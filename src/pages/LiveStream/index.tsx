import React from 'react';
import { useState, useLayoutEffect } from 'react';
import { useBoolean, useMount, useUnmount } from '@umijs/hooks';
import { message, Switch } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Flipper, Flipped } from 'react-flip-toolkit';
import { queryStreams, queryStreamSquares } from '@/services/ant-design-pro/live';
import styles from './index.less';
import type Mpegts from 'mpegts.js';
import MpegtsVideo from './components/MpegtsVideo';

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

const LiveStream: React.ReactNode = () => {
  const [streamArray, setStreamArray] = useState<API.StreamItem[]>([]);
  const [mainStreamIndex, setMainStreamIndex] = useState<number>();
  const [squareArray, setSquareArray] = useState<API.StreamSquareItem[]>([]);
  const canvasRef = React.createRef<HTMLCanvasElement>();
  const [canvasScaleRate, setCanvasScaleRate] = React.useState<number>(0);
  const isMainStreamPlaying = useBoolean(false);
  const isSqauresTurnedOn = useBoolean(false);
  const [mainVideoSize, setMainVideoSize] = useState<{
    videoWidth: number;
    videoHeight: number;
    clientWidth: number;
    clientHeight: number;
  }>();

  // 初始化时执行且只执行一次，获取所有视频流
  useMount(() => {
    const setStreams = async () => {
      try {
        const result = await handleFetchStreams();
        if (!result.data?.length) throw new Error('无法查询到有效视频流地址，请检查地址配置');
        setStreamArray(result.data);
        setMainStreamIndex(0);
      } catch (error) {
        message.error(error.message);
      }
    };
    setStreams();
  });

  useUnmount(() => {
    // 卸载时设置false，阻止继续请求方框
    isMainStreamPlaying.setFalse();
    setStreamArray([]);
    setSquareArray([]);
    setMainStreamIndex(0);
  });

  /** 测量布局，设置canvas实际大小 */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // canvas.clientWidth 和 canvas.clientHeight 获取的大小不正确
      // if (canvas.width !== canvas.clientWidth) {
      //   canvas.width = canvas.clientWidth;
      //   canvas.height = canvas.clientHeight;
      // }
      if (mainVideoSize) {
        if (
          canvas.clientWidth !== mainVideoSize?.clientWidth ||
          canvas.clientHeight !== mainVideoSize?.clientHeight
        ) {
          canvas.width = mainVideoSize.clientWidth;
          canvas.height = mainVideoSize.clientHeight;
        }
        const tempScale = canvas.width / mainVideoSize.videoWidth;
        if (mainVideoSize && canvasScaleRate !== tempScale) {
          setCanvasScaleRate(tempScale);
        }
      }
    }
    // 不监控 canvasScaleRate，防止自循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, mainVideoSize]);

  /** 更新主视频的方框列表 */
  const updateStreamSquaresState = async () => {
    try {
      if (mainStreamIndex !== undefined && isMainStreamPlaying.state && isSqauresTurnedOn.state) {
        const result = await handleFetchSquares(streamArray[mainStreamIndex].vid);
        if (result.data?.length) {
          setSquareArray(result.data);
          return;
        }
      }
    } catch (error) {
      setMainStreamIndex(undefined);
    }
    setSquareArray([]);
  };

  /** 确保能拿到canvasRef.current */
  useLayoutEffect(() => {
    /** 清除方框 */
    const clearSquares = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || undefined;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    /** 绘制方框 */
    const drawSquares = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || undefined;
      if (canvas && ctx && squareArray.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        squareArray.forEach((value) => {
          if (value.x && value.y && value.width && value.height) {
            // 按照 {画布大小/原视频大小} 缩放
            const rect = {
              x: value.x * canvasScaleRate,
              y: value.y * canvasScaleRate,
              w: value.width * canvasScaleRate,
              h: value.height * canvasScaleRate,
            };

            // 不知道为什么画不了(0, 0)，所以偏移一点点
            if (rect.x === 0) rect.x = 1;
            if (rect.y === 0) rect.y = 1;
            if (rect.x + rect.w === canvas.width) rect.w -= 1;
            if (rect.y + rect.h === canvas.height) rect.h -= 1;

            ctx.beginPath();

            if (value.group === 'suspects') {
              ctx.strokeStyle = 'red';
              ctx.fillStyle = 'red';
            } else {
              ctx.strokeStyle = 'green';
              ctx.fillStyle = 'green';
            }
            ctx.lineWidth = 2;
            ctx.rect(rect.x, rect.y, rect.w, rect.h);
            ctx.textBaseline = 'top';
            ctx.font = 'bold 1.5em Sans-serif';
            if (value.name) ctx.fillText(value.name, rect.x + 5, rect.y + 5, rect.w - 10);

            ctx.closePath();
            ctx.stroke();
          }
        });
        // 1000ms后清除
        setTimeout(clearSquares, 1000);
      }
    };
    drawSquares();
  }, [canvasRef, canvasScaleRate, squareArray]);

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
                  extra={
                    index === mainStreamIndex ? (
                      <div className={styles.rightSwitchWrapper}>
                        识别框
                        <Switch
                          className={styles.squaresOpenSwitch}
                          defaultChecked={isSqauresTurnedOn.state}
                          onChange={(checked) => isSqauresTurnedOn.toggle(checked)}
                        />
                      </div>
                    ) : undefined
                  }
                  onClick={
                    mainStreamIndex !== index
                      ? () => {
                          setMainStreamIndex(index);
                          document
                            .getElementsByClassName(`${styles.mainPlayerCard}`)
                            .item(0)
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }
                      : undefined
                  }
                >
                  <div className={styles.mainContentContainer}>
                    {index === mainStreamIndex && (
                      <canvas className={styles.mainVideoCanvas} ref={canvasRef}></canvas>
                    )}
                    <MpegtsVideo
                      className={styles.livePlayer}
                      mediaDataSource={{
                        type: 'mse',
                        isLive: true,
                        url: value.href,
                      }}
                      config={{
                        enableWorker: true,
                        lazyLoadMaxDuration: 3 * 60,
                        seekType: 'range',
                        liveBufferLatencyChasing: true,
                      }}
                      onProgress={
                        index === mainStreamIndex
                          ? (
                              _player?: Mpegts.Player,
                              video?: React.RefObject<HTMLVideoElement>,
                            ) => {
                              if (video?.current) {
                                if (
                                  video?.current.currentTime > 0 &&
                                  !video?.current.paused &&
                                  !video?.current.ended &&
                                  video?.current.readyState > 2
                                ) {
                                  setMainVideoSize({
                                    videoWidth: video.current.videoWidth,
                                    videoHeight: video.current.videoHeight,
                                    clientWidth: video.current.clientWidth,
                                    clientHeight: video.current.clientHeight,
                                  });
                                  isMainStreamPlaying.setTrue();
                                  updateStreamSquaresState();
                                }
                              }
                            }
                          : undefined
                      }
                      onPause={
                        index === mainStreamIndex
                          ? () => {
                              // 暂停或者视频卡顿时不获取方框
                              isMainStreamPlaying.setFalse();
                            }
                          : undefined
                      }
                      autoPlay={true}
                      controls={true}
                    ></MpegtsVideo>
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
