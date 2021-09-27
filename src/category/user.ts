import axios, {URL} from "../request/lib-axios";
import {User} from "../request/config";
import {AxiosResponse} from "axios";
import {Result, UserBookHistory} from "../request/data";
import qs from "qs";

const WE_CHAT_CONFIG = 'o1IyJt1Jg8ODKO-uFa3hSRC9isIM';

export function getCookie(): Promise<string> {
    return axios.get(`${URL}/libseat-ibeacon/load/${WE_CHAT_CONFIG}?type=currentBook`, {
        proxy: false,
    })
        .then(resp => {
            const PATH: string = resp.request.path;
            const JSESSION_ID_PATTERN: RegExp = /^.*;jsessionid=(.*)$/;

            const JSESSION_ID = PATH.match(JSESSION_ID_PATTERN)?.[1];
            const COOKIE: string = `JSESSIONID=${JSESSION_ID}` || '';
            return COOKIE;
        }).catch(err => {
            console.log(err);
            return null;
        });
}

export async function login(user: User, cookie: string): Promise<boolean> {
    const response: AxiosResponse<Result> = await axios.post(`${URL}/libseat-ibeacon/bundle`, qs.stringify({
        account: user.account,
        password: user.password,
        weChat: WE_CHAT_CONFIG,
        linkSign: 'currentBook',
        type: 'currentBook',
        msg: '',
    }), {
        headers: {
            'Cookie': cookie,
        },
    });

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
                'Cookie': cookie,
                'Referer': 'https://seatwx.mnnu.edu.cn/libseat-ibeacon/currentBook?linkSign=currentBook',
            },
        });
        return response?.data?.params;

    } catch (error) {
        console.log(error);
    }
}
