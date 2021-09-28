import { User } from "./user";
import { BookSeatResult, Room, Seat, SeatState, UserExpected } from "./data";
import { getCookie } from "../category/user";
import { bookSeat, loadBookSeatTime, toFormatString } from "../category/seat";
import { FormatDate } from "../utils/date-utils";
import { BUILDING_ID_YF, getRooms } from "../category/building";
import { getSeatsByTime } from "../category/room";
import _ from "lodash";

export class OccupySeat {
  public readonly user: User;
  public readonly expects: UserExpected[];
  private readonly occupyBegin: number;
  private readonly occupyEnd: number;
  private readonly DEFAULT_BEGIN_HOUR: number = 8;
  private readonly DEFAULT_END_HOUR: number = 22;

  constructor(
    user: User,
    expects: UserExpected[],
    occupyBegin?: number,
    occupyEnd?: number
  ) {
    this.user = user;
    this.expects = expects;
    if (!occupyBegin || !occupyEnd) {
      let date: Date = new Date();
      this.occupyBegin = date.setHours(17, 58);
      this.occupyEnd = date.setHours(18, 5);
    } else {
      this.occupyBegin = occupyBegin;
      this.occupyEnd = occupyEnd;
    }
  }

  public occupySeat() {}

  /**
   * 抢明天指定时间段期望的座位
   *
   * @param beginHour 开始的小时数，不能小于 DEFAULT_BEGIN_HOUR
   * @param endHour 结束的小时数，不能大于 DEFAULT_END_HOUR
   */
  public async occupyExpectedSeat(
    cookie: string,
    beginHour?: number,
    endHour?: number
  ) {
    beginHour = beginHour || this.DEFAULT_BEGIN_HOUR;
    endHour = endHour || this.DEFAULT_END_HOUR;
    if (!this.isValid(beginHour, endHour)) {
      return false;
    }
    const tomorrow: FormatDate = FormatDate.getDate(1);
    const date: string = tomorrow.toString();
    let intervals: NodeJS.Timer[] = [];

    try {
      for (const expect of this.expects) {
        let interval: NodeJS.Timer = setInterval(() => {
          const now: number = Date.now();
          if (this.occupyBegin < now && now < this.occupyEnd) {
            for (let i = 0; i < (expect.priority || 1); ++i) {
              bookSeat(cookie, expect.seatId, date, beginHour, endHour).then(
                async (resp: BookSeatResult) => {
                  console.log(resp);
                  if (
                    !resp ||
                    !resp.message ||
                    resp.message.search("登录失败: 用户名或密码不正确") !==
                      -1 ||
                    resp.message.search("非法用户登录") !== -1
                  ) {
                  } else if (
                    resp.status == "success" ||
                    resp.message.search("有效预约") !== -1
                  ) {
                    OccupySeat.clearIntervals(intervals);
                  }
                }
              );
            }
          } else if (now > this.occupyEnd) {
            OccupySeat.clearIntervals(intervals);
          }
        }, 1005);
        intervals.push(interval);
      }
    } catch (err) {
      OccupySeat.clearIntervals(intervals);
      console.log(err);
      return false;
    }
  }

  /**
   * 获取 date 日 [beginHour, endHour] 时间段内的空闲座位
   *
   * @param date 查询的日期，默认 today
   * @param beginHour 开始时间
   * @param endHour 结束时间
   * @param buildId 查询的建筑，默认逸夫
   */
  public async getAllFreeSeats(
    beginHour?: number,
    endHour?: number,
    date?: FormatDate,
    buildId?: number
  ) {
    beginHour = beginHour || this.DEFAULT_BEGIN_HOUR;
    endHour = endHour || this.DEFAULT_END_HOUR;
    buildId = buildId || BUILDING_ID_YF;
    if (!this.isValid(beginHour, endHour)) {
      return false;
    }
    date = date || FormatDate.today();

    const cookie: string = await getCookie();
    console.log(`从微信获取 cookie: ${cookie}`);

    // 获取 Building 里所有房间
    const rooms: Room[] = await getRooms(BUILDING_ID_YF, cookie);

    let freeSeats: Seat[] = [];
    for (const room of rooms) {
      const seatsByTime = await getSeatsByTime(
        cookie,
        date,
        beginHour,
        endHour,
        room.roomId,
        buildId
      );

      const frees: Seat[] = _.filter(seatsByTime, (seat: Seat) => {
        return seat.status === SeatState.FREE;
      });

      for (const seat of frees) {
        loadBookSeatTime(cookie, seat.id, date).then((resp) => {
          let start =
            resp.start !== "now" ? parseInt(resp.start) / 60 : resp.start;
          let end = resp.end !== "now" ? parseInt(resp.end) / 60 : resp.end;
          console.log(`${room.room} ${seat.name}: [${start}, ${end}]`);
          // bookSeat(cookie, seat.id, date, resp.start, resp.end).then((resp: BookSeatResult) => {
          //     console.log(resp);
          // });
        });
      }
      // freeSeats = freeSeats.concat(frees);
    }

    // for (const seat of freeSeats) {
    //     loadBookSeatTime(cookie, seat.id, date).then(resp => {
    //         let start = resp.start !== 'now' ? parseInt(resp.start) / 60 : resp.start;
    //         let end = resp.end !== 'now' ? parseInt(resp.end) / 60 : resp.end;
    //         console.log(`seatId: ${seat.id}: [${start}, ${end}]`);
    //         // bookSeat(cookie, seat.id, date, resp.start, resp.end).then((resp: BookSeatResult) => {
    //         //     console.log(resp);
    //         // });
    //     });
    // }
  }

  /**
   * 清除所有的定时器
   *
   * @param intervals 定时器列表
   * @private
   */
  private static clearIntervals(intervals: NodeJS.Timer[]): void {
    if (intervals && intervals.length !== 0) {
      for (const interval of intervals) {
        if (interval != null) {
          clearInterval(interval);
        }
      }
    }
  }

  /**
   * 验证开始和结束时间是否合法
   *
   * @param beginHour 开始时间，必须大于 DEFAULT_BEGIN_HOUR
   * @param endHour 结束时间，必须小于 DEFAULT_END_HOUR
   * @private
   */
  private isValid(beginHour: number, endHour: number): boolean {
    if (
      beginHour > endHour ||
      beginHour < this.DEFAULT_BEGIN_HOUR ||
      endHour > this.DEFAULT_END_HOUR
    ) {
      console.log(`[${beginHour}, ${endHour}] 时间段非法`);
      return false;
    }
    return true;
  }
}
