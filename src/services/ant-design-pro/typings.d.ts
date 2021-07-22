// @ts-ignore
/* eslint-disable */

declare namespace API {
  type UserInfoQueryParams = {
    /** 用户识别id */
    userId: string;
  };

  type UserInfo = {
    /** 要显示在界面上的用户名 */
    name?: string;
    /** 用户头像链接 */
    avatar?: string;
    /** 用户所属权限组，比如Admin、Watcher */
    group?: string;
  };

  type LoginResult = {
    /** 登陆验证结果，比如ok、fail、error。不为ok时返回内容不含token（或为空） */
    status: string;
    /** token，根据userId计算，无超时 */
    token: string;
    /** 用户识别id */
    userId: string;
  };

  type LoginParams = {
    username: string;
    password: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type StreamItem = {
    /** 视频流id */
    id?: string;
    /** 取流时在链接后附加的key（eg rstp://link/?key=xxx），可以没有 */
    key?: string;
    /** 视频流标题 */
    title?: string;
    /** 视频流地址 */
    href?: string;
  };

  type StreamList = {
    data?: StreamItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type StreamSquareItem = {
    /** 方框id */
    id?: string;
    /** 识别对象名称 */
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    /** 识别对象在哪一个分组内 */
    group?: string;
  };

  type StreamSquareList = {
    /** 视频流id，指示这些方框是应用于哪一个视频流的 */
    id?: string;
    data?: StreamSquareItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };
}
