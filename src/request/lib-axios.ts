import axios, { AxiosProxyConfig } from "axios";
import { proxy } from "../../user-config.json";

export const URL = "https://seatwx.mnnu.edu.cn";
export const URLP = "https://seatwx.mnnu.edu.cn/libseat-ibeacon";

const PROXY: AxiosProxyConfig = {
  host: proxy.host,
  port: proxy.port,
};

axios.defaults.proxy = proxy.open ? PROXY : null;
axios.defaults.validateStatus = (status: number) => {
  return (status >= 200 && status < 300) || status === 302;
};

axios.defaults.timeout = 180000;
axios.defaults.headers = {
  "User-Agent":
    "Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; GT-I9300 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 MicroMessenger/5.2.380",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "sec-ch-ua": "",
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": "",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": 1,
  Connection: "keep-alive",
};

export default axios;
