// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取用户信息 POST /api/auth/userInfo */
export async function queryUserInfo(
  params: {
    // path
  },
  body: API.UserInfoQueryParams,
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.UserInfo>('/api/auth/userInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 登录接口 POST /api/auth/login */
export async function login(
  params: {
    // path
  },
  body: API.LoginParams,
  options?: { [key: string]: any },
) {
  const { ...queryParams } = params;
  return request<API.LoginResult>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
