import { UserExpected } from "./data";

export interface User {
  name?: string;
  account: string;
  password: string;
  bookTimes: BookTimes;
  expectSeats: UserExpected[];
}

export interface BookTimes {
  "0"?: Duration;
  "1"?: Duration;
  "2"?: Duration;
  "3"?: Duration;
  "4"?: Duration;
  "5"?: Duration;
  "6"?: Duration;
}

export interface Duration {
  begin: number;
  end: number;
}
