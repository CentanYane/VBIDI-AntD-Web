import React, { useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd';
import { queryStreams, queryStreamSquares } from '@/services/ant-design-pro/live';
import { useModel } from 'umi';
import ReactPlayer from 'react-player';
import { useState, useRef } from 'react';
import ProCard from '@ant-design/pro-card';
import { Flipper, Flipped } from 'react-flip-toolkit';
import styles from './index.less';

const handleFetchStreams = async (): Promise<API.StreamList> => {
  message.loading('正在获取直播流列表');
  try {
    const data = await queryStreams({});
    if (!data.success) throw new Error();
    message.destroy();
    return data;
  } catch (error) {
    message.destroy();
    message.error('获取直播流列表失败');
    return {};
  }
};

const handleFetchSquares = async (vid: string): Promise<API.StreamSquareList> => {
  try {
    const data = await queryStreamSquares({ vid });
    if (!data.success) throw new Error();
    return data;
  } catch (error) {
    return {};
  }
};

const LiveStream = (): React.ReactNode => {
  const { initialState } = useModel('@@initialState');
  const [streamArray, setStreamArray] = useState<API.StreamItem[]>([]);
  const [mainStreamIndex, setMainStreamIndex] = useState<number>(0);
  const [squareArray, setSquareArray] = useState<API.StreamSquareItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 初始化时执行且只执行一次，获取视所有频流
  useEffect(() => {
    const setStreams = async () => {
      try {
        if (!initialState?.token) throw new Error('初始化错误，请重新登陆！');
        const result = await handleFetchStreams();
        if (!result.data?.length) throw new Error('无法查询到有效视频流地址，请检查地址配置');
        if (result.data !== streamArray) setStreamArray(result.data);
        if (mainStreamIndex !== 0) setMainStreamIndex(0);
      } catch (error) {
        message.error(error.message);
      }
    };
    setStreams();
  }, [initialState?.token]);

  const drawSquares = async (index: number) => {
    if (index === mainStreamIndex) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || undefined;
      if (canvas && ctx) {
        try {
          const result = await handleFetchSquares(streamArray[mainStreamIndex].vid);
          if (!result.data?.length) throw new Error();
          if (result.data !== squareArray) {
            squareArray.forEach((value) => {
              if (value.x && value.y && value.width && value.height) {
                ctx.clearRect(value.x, value.y, value.width, value.height);
              }
            });
            result.data.forEach((value) => {
              if (value.x && value.y && value.width && value.height) {
                ctx.rect(value.x, value.y, value.width, value.height);
              }
            });
            ctx.stroke();
            setSquareArray(result.data);
          }
        } catch (error) {
          message.error(error.message);
        }
      }
    }
  };

  return (
    <PageContainer waterMarkProps={{}}>
      <Flipper flipKey={mainStreamIndex}>
        <div className={styles.playerCardsContainer}>
          {streamArray.map((value, index) => {
            return (
              <Flipped flipId={index} key={value.vid}>
                <ProCard
                  title={value.title ? value.title : `未命名直播流_${index}`}
                  tooltip={`直播流_${index}`}
                  className={`${styles.playerCard} ${
                    index === mainStreamIndex ? styles.mainPlayerCard : styles.subPlayerCard
                  }`}
                  onClick={() => {
                    if (mainStreamIndex !== index) {
                      setMainStreamIndex(index);
                      document
                        .getElementsByClassName(`${styles.mainPlayerCard}`)
                        .item(0)
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <div className={styles.mainContentContainer}>
                    <ReactPlayer
                      width=""
                      height=""
                      muted={true}
                      autoPlay={true}
                      controls
                      playsinline={true}
                      playing={true}
                      className={styles.reactPlayer}
                      url={value.href}
                      key={`reactPlayer_${value.vid}`}
                      onProgress={() => {
                        drawSquares(index);
                      }}
                    ></ReactPlayer>
                    {index === mainStreamIndex && (
                      <canvas className={styles.mainVideoCanvas} ref={canvasRef}></canvas>
                    )}
                  </div>
                </ProCard>
              </Flipped>
            );
          })}
        </div>
      </Flipper>
    </PageContainer>
  );
};

export default LiveStream;
