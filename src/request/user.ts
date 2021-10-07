import { UserExpected } from "./data";

export interface User {
  readonly name?: string;
  readonly email: string;
  readonly account: string;
  readonly password: string;
  readonly bookTimes: BookTimes;
  readonly expectSeats: UserExpected[];
  readonly wechatConfig: string;
  readonly times: {
    watchingTime: Time;
    startRequestTime: Time;
    endRequestTime: Time;
  };
}

export interface BookTimes {
  "0"?: Duration;
  "1"?: Duration;
  "2"?: Duration;
  "3"?: Duration;
  "4"?: Duration;
  "5"?: Duration;
  "6"?: Duration;
  default: Duration;
}

export interface Time {
  hour: number;
  minute: number;
  second: number;
}

export interface Duration {
  begin: number;
  end: number;
}
