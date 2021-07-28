import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd';
import { queryStreams, queryStreamSquares } from '@/services/ant-design-pro/live';
import { useState } from 'react';
import ProCard from '@ant-design/pro-card';
import { Flipper, Flipped } from 'react-flip-toolkit';
import styles from './index.less';
import MpegtsVideo from '@/components/MpegtsPlayer';
import { useBoolean, useMount, useUnmount } from '@umijs/hooks';
import { useLayoutEffect } from 'react';
import type Mpegts from 'mpegts.js';

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
  const [mainVideoSourceSize, setMainVideoSourceSize] =
    useState<{ width: number; height: number }>();

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

  // 卸载时设置false，阻止继续请求方框
  useUnmount(() => {
    isMainStreamPlaying.setFalse();
  });

  /** 测量布局，设置canvas实际大小 */
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.width !== canvas.clientWidth) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      if (mainVideoSourceSize && canvas.width !== mainVideoSourceSize?.width) {
        setCanvasScaleRate(canvas.width / mainVideoSourceSize.width);
      }
    }
  }, [canvasRef, mainVideoSourceSize]);

  /** 更新主视频的方框列表 */
  const updateStreamSquaresState = async () => {
    try {
      if (mainStreamIndex !== undefined && isMainStreamPlaying.state) {
        const result = await handleFetchSquares(streamArray[mainStreamIndex].vid);
        if (result.data?.length) {
          setSquareArray(result.data);
        }
      }
    } catch (error) {
      setMainStreamIndex(undefined);
    }
  };

  /** 确保能拿到canvasRef.current */
  useLayoutEffect(() => {
    /** 清除方框 */
    const clearSquares = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || undefined;
      if (canvas && ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0)';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    /** 绘制方框 */
    const drawSquares = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d') || undefined;
      if (canvas && ctx && squareArray.length > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0)';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = 'green';
        squareArray.forEach((value) => {
          if (value.x && value.y && value.width && value.height) {
            ctx.rect(
              value.x * canvasScaleRate,
              value.y * canvasScaleRate,
              value.width * canvasScaleRate,
              value.height * canvasScaleRate,
            );
          }
        });
        ctx.closePath();
        ctx.stroke();
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
                                  setMainVideoSourceSize({
                                    width: video.current.videoWidth,
                                    height: video.current.videoHeight,
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
