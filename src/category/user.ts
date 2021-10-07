import axios, { URL } from '../request/axios-library';
import { User } from '../request/user';
import { AxiosResponse } from 'axios';
import { Result, UserBookHistory } from '../request/data';
import qs from 'qs';

/**
 * 获取保持会话所需的 Cookie 信息
 *
 * @param WE_CHAT_CONFIG 微信配置信息
 */
export async function getCookie(WE_CHAT_CONFIG: string): Promise<string> {
  try {
    const resp = await axios.get(`${URL}/libseat-ibeacon/load/${WE_CHAT_CONFIG}?type=currentBook`, {
      proxy: false,
    });
    const PATH: string = resp.request.path;
    const JSESSION_ID_PATTERN: RegExp = /^.*;jsessionid=(.*)$/;

    const JSESSION_ID = PATH.match(JSESSION_ID_PATTERN)?.[1];
    const COOKIE: string = `JSESSIONID=${JSESSION_ID}` || '';
    return COOKIE;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function login(user: User, cookie: string, WE_CHAT_CONFIG: string): Promise<boolean> {
  const response: AxiosResponse<Result> = await axios.post(
    `${URL}/libseat-ibeacon/bundle`,
    qs.stringify({
      account: user.account,
      password: user.password,
      weChat: WE_CHAT_CONFIG,
      linkSign: 'currentBook',
      type: 'currentBook',
      msg: '',
    }),
    {
      headers: {
        Cookie: cookie,
      },
    }
  );

  if (response.data.status === false) {
    console.log(response.data);
  }
  return response.data.status;
}

/**
 * 获取用户的预约记录（包括违约）
 *
 * @param cookie 已登录用户的 cookie
 */
export async function getUserBookHistory(cookie: string): Promise<UserBookHistory> {
  try {
    const response: AxiosResponse<Result> = await axios.get(`${URL}/libseat-ibeacon/getUserBookHistory`, {
      headers: {
        Cookie: cookie,
        Referer: 'https://seatwx.mnnu.edu.cn/libseat-ibeacon/currentBook?linkSign=currentBook',
      },
    });
    return response?.data?.params;
  } catch (error) {
    console.log(error);
  }
}
