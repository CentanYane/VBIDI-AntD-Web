// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取直播视频流列表 POST /api/live/streams */
export async function queryStreams(
  params: {
    // path
  },
  body: API.SafeQueryParams,
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.StreamList>('/api/live/streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 获取直播视频识别框列表 POST /api/live/streamSquares */
export async function queryStreamSquares(
  params: {
    // path
  },
  body: API.SafeQueryParams,
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.StreamSquareList>('/api/live/streamSquares', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
