import { FormatDate } from '../utils/date-utils';
import { BookLoadTime, BookSeatResult, Seat } from '../request/data';
import qs from 'qs';
import { AxiosResponse } from 'axios';
import axios, { URLP } from '../request/axios-library';

/** 预定座位 */
export async function bookSeat(
  cookie: string,
  seatId: number,
  date: FormatDate | string,
  startTime?: number | string,
  endTime?: number | string
): Promise<BookSeatResult> {
  if (!cookie) {
    return null;
  }
  const start: string | number = typeof startTime === 'string' ? startTime : startTime * 60 || 8 * 60;
  const end: string | number = typeof endTime === 'string' ? endTime : endTime * 60 || 22 * 60;
  const QUERY_STRING: string = qs.stringify({
    seatId: seatId,
    date: date.toString(),
    start: start,
    end: end,
  });
  try {
    const { data: originalData }: AxiosResponse<string> = await axios.get(`${URLP}/saveBook?${QUERY_STRING}`, {
      headers: {
        Cookie: cookie,
      },
    });
    const bookResult: BookSeatResult = JSON.parse(originalData);
    return bookResult;
  } catch (err) {
    return null;
  }
}

/** 释放座位（已使用的情况下 */
export async function stopBookSeat(cookie: string, bookId: number): Promise<BookSeatResult> {
  const { data: data }: AxiosResponse<string> = await axios.get(`${URLP}/stop?bookId=${bookId}`, { headers: { Cookie: cookie } });
  return JSON.parse(data);
}

/** 取消座位（未使用的情况下 */
export async function cancelBookSeat(cookie: string, bookId: number): Promise<BookSeatResult> {
  const { data: data }: AxiosResponse<string> = await axios.get(`${URLP}/cancel?bookId=${bookId}`, { headers: { Cookie: cookie } });
  return JSON.parse(data);
}

/** 加载空闲时间 */
export async function loadBookSeatTime(cookie: string, seatId: number, date: string | FormatDate) {
  const QUERY_STRING: string = qs.stringify({
    seatId: seatId,
    date: date.toString(),
  });
  try {
    const { data: data }: AxiosResponse<string> = await axios.get(`${URLP}/loadStartTime?${QUERY_STRING}`, { headers: { Cookie: cookie } });
    const tmp: string[] = data.split('/');
    const starts: BookLoadTime[] = JSON.parse(tmp[0]);
    const ends: BookLoadTime[] = JSON.parse(tmp[1]);
    return { start: starts?.[0]?.id, end: ends?.[ends?.length - 1]?.id };
  } catch (err) {
    return null;
  }
}

export function toFormatString(seat: Seat): string {
  return `seatId: ${seat.id}, name: ${seat.name}, status: ${seat.status}`;
}
