import {FormatDate, FormatTime} from "../utils/date-utils";
import {Result, RoomDetails, RoomFreeSeats, Seat, SeatType} from "../request/data";
import qs from "qs";
import {AxiosResponse} from "axios";
import axios, {URL, URLP} from "../request/lib-axios";
import _ from "lodash";

const LINK_SIGN: string = 'activitySeat';

/**
 * 获取房间号为 roomId 的 date 日期的座位信息。
 *
 * @param cookie 请求头需要包含已登录的 cookie
 * @param roomId 房间号，标识房间
 * @param date 需要查询的日期，请求时会转换为 yyyy-mm-dd
 */
export async function getSeats(cookie: string, roomId: number, date: FormatDate): Promise<Seat[]> {
    const QUERY_STRING = qs.stringify({
        roomId: roomId,
        date: date.toString(),
        linkSign: LINK_SIGN,
        endTime: '',
    });
    const {data: result}: AxiosResponse<Result> = await axios.get(`${URLP}/seats?${QUERY_STRING}`, {
        headers: {
            'Cookie': cookie,
        },
    });
    const roomDetails: RoomDetails = result.params;
    return _.filter(roomDetails.seats, (seat: Seat) => seat.type === SeatType.SEAT);
}

/**
 * 获取 building 中房间号为 roomId， 日期为 date 日 beginTime 至 endTime 的座位信息。
 *
 * @param cookie 请求头需要包含已登录的 cookie
 * @param date 需要查询的日期，请求时会转换为 yyyy-mm-dd
 * @param beginTime 开始时间，只记录小时数（8 - 22）
 * @param endTime 结束时间，只记录小时数（8 - 22）
 * @param roomId 房间号，标识房间
 * @param buildId 建筑 Id (1 为逸夫, 2 为科技馆)
 */
export async function getSeatsByTime(cookie: string, date: FormatDate | string, beginTime: FormatTime | number,
                                     endTime: FormatTime | number, roomId: number, buildId: number): Promise<Seat[]> {
    const QUERY_STRING: string = qs.stringify({
        linkSign: LINK_SIGN,
        date: date.toString(),
        begin: beginTime instanceof FormatTime ? beginTime.hour * 60 : beginTime * 60,
        end: endTime instanceof FormatTime ? endTime.hour * 60 : endTime * 60,
        roomId: roomId,
        buildId: buildId,
    });
    const {data: result}: AxiosResponse<Result> = await axios.get(`${URLP}/searchSeats?${QUERY_STRING}`, {
        headers: {
            'Cookie': cookie,
        },
    });

    if (!result && result.status === false) {
        return null;
    }
    const roomFreeSeats: RoomFreeSeats = result.params;

    return roomFreeSeats.seats;
}
