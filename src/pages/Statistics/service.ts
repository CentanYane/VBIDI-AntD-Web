// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { RecordTableListItem } from './data';

/** 获取列表 GET /api/main/record */
export async function record(options?: { [key: string]: any }) {
  return request<{
    data: RecordTableListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  }>('/api/main/record', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新信息 PUT /api/main/record */
export async function updateRecord(options?: { [key: string]: any }) {
  return request<RecordTableListItem>('/api/main/record', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 删除信息 DELETE /api/main/record */
export async function removeRecord(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/main/record', {
    method: 'DELETE',
    ...(options || {}),
  });
}
