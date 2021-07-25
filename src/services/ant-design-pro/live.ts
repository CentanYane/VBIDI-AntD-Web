// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取直播视频流列表 GET /api/live/streams */
export async function queryStreams(
  params: {
    // path
  },
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.StreamList>('/api/live/streams', {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取直播视频识别框列表 GET /api/live/streamSquares */
export async function queryStreamSquares(
  params: {
    // query
    /** 视频流id，指示要获取哪一个视频流的方框 */
    vid: string;
    // path
  },
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.StreamSquareList>('/api/live/streamSquares', {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}
