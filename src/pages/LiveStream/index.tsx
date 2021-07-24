import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, message } from 'antd';
import ReactDOM from 'react-dom';
import { queryStreams } from '@/services/ant-design-pro/live';
import { useModel } from 'umi';
import { random } from 'lodash';
import ReactPlayer from 'react-player';

const VideoBlock: React.FC<{
  href?: string;
  id?: string;
  index?: number;
}> = ({ href, id, index }) => {
  let streamId = id;
  if (!id) streamId = random().toString();
  return (
    <div>
      <ReactPlayer
        url={href}
        id={`stream-id_${streamId}`}
        className={`player player-index_${index}`}
      ></ReactPlayer>
    </div>
  );
};

const handleFetchStreams = async (body: API.SafeQueryParams): Promise<API.StreamList> => {
  message.loading('正在获取直播流列表');
  try {
    const data = await queryStreams({}, body);
    if (!data.success) throw new Error();
    message.destroy();
    message.success('获取成功');
    return data;
  } catch (error) {
    message.destroy();
    message.error('获取失败');
    return {};
  }
};

const LiveStream = (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');

  const transcodeRtspToPlay = async () => {
    try {
      if (!initialState?.userId) throw new Error('初始化错误，请重新登陆！');
      const result = await handleFetchStreams({ userId: initialState.userId });
      if (!result.data) throw new Error('无法查询到有效视频流地址，请检查地址配置');
      result.data.forEach((streamItem, index) => {
        if (streamItem.href)
          ReactDOM.render(
            <VideoBlock id={streamItem.id} href={streamItem.href} index={index}></VideoBlock>,
            document.getElementById('video-block-container'),
          );
      });
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <PageContainer>
      <Card id="video-block-container">
        <Button onClick={transcodeRtspToPlay}>FUCK</Button>
      </Card>
    </PageContainer>
  );
};

export default LiveStream;
