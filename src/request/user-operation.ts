import { BookTimes, Duration, User } from './user';
import { BookSeatResult, Room, Seat, SeatState, UserExpected } from './data';
import { getCookie } from '../category/user';
import { bookSeat, loadBookSeatTime } from '../category/seat';
import { FormatDate } from '../utils/date-utils';
import { BUILDING_ID_YF, getRooms } from '../category/building';
import { getSeatsByTime } from '../category/room';
import _ from 'lodash';
import nodemailer, { Transporter } from 'nodemailer';
import { email } from '../../config/user-config.json';
import getLogger from '../entity/logger';
import moment from 'moment';

const logger = getLogger('user');

export class UserOperation {
  public readonly user: User;
  public readonly expects: UserExpected[];
  private readonly startRequestTime: number;
  private readonly endRequestTime: number;
  private readonly duration: Duration;
  private readonly DEFAULT_BEGIN_HOUR: number = 8;
  private readonly DEFAULT_END_HOUR: number = 22;
  private transporter: Transporter;
  private readonly userLogger;

  constructor(user: User) {
    this.userLogger = getLogger(user.name);
    this.user = user;
    this.expects = user.expectSeats;

    const start = this.user.times.startRequestTime;
    const end = this.user.times.endRequestTime;
    let date: Date = new Date();
    this.startRequestTime = date.setHours(start.hour, start.minute, start.second);
    this.endRequestTime = date.setHours(end.hour, end.minute, end.second);

    this.userLogger.debug(`加载配置信息：开始抢座时间 ${start.hour}:${start.minute}:${start.second}`);
    this.userLogger.debug(`加载配置信息：结束抢座时间 ${end.hour}:${end.minute}:${end.second}`);

    const WEEK_DAY: number = moment().add(1, 'days').day();
    const bookTimes: BookTimes = this.user.bookTimes;
    const duration = bookTimes[WEEK_DAY] || bookTimes.default;
    if (!this.isValid(duration.begin, duration.end)) {
      this.userLogger.error(`时间信息配置错误：[${duration.begin}, ${duration.end}]`);
      throw Error(`时间信息配置错误：[${duration.begin}, ${duration.end}]`);
    }
    this.userLogger.debug(`加载配置信息：期望时间段: [${duration.begin}, ${duration.end}]`);
    this.duration = duration;

    // 配置邮件信息
    this.transporter = nodemailer.createTransport({
      service: email.service,
      // port: 465,
      // secure: false,
      auth: {
        user: email.auth.user,
        pass: email.auth.pass,
      },
    });
  }

  private sendEmail(subject: string, text: string): Promise<any> {
    return this.transporter
      .sendMail({
        from: email.from,
        to: [email.from, this.user.email],
        subject: subject,
        text: text,
      })
      .then((resp) => {
        logger.info(resp);
      })
      .catch((err) => {
        logger.error(err);
      });
  }

  /**
   * 抢明天指定时间段期望的座位
   */
  public async occupyExpectedSeat() {
    const COOKIE: string = await getCookie(this.user.wechatConfig);
    this.userLogger.debug(`cookie: ${COOKIE}`);

    const tomorrow: FormatDate = FormatDate.tomorrow();
    const date: string = tomorrow.toString();
    let intervals: NodeJS.Timer[] = [];

    try {
      for (const expect of this.expects) {
        let interval: NodeJS.Timer = setInterval(async () => {
          const now: number = Date.now();
          if (this.startRequestTime < now && now < this.endRequestTime) {
            for (let i = 0; i < (expect.priority || 1); ++i) {
              bookSeat(COOKIE, expect.seatId, date, this.duration.begin, this.duration.end).then(async (resp: BookSeatResult) => {
                const MSG: string = JSON.stringify(resp.data);
                this.userLogger.debug(MSG);

                if (resp?.data?.location) {
                  const SEND_SUBJECT: string = FormatDate.tomorrow().toString() + ' ' + resp.data.location;
                  const SEND_TEXT: string = JSON.stringify(resp.data, null, 2);
                  this.userLogger.debug(`抢座成功: ${MSG}`);
                  await this.sendEmail(SEND_SUBJECT, SEND_TEXT);
                  UserOperation.clearIntervals(intervals);
                } else if (
                  !resp?.message ||
                  resp.message.search('登录失败: 用户名或密码不正确') !== -1 ||
                  resp.message.search('非法用户登录') !== -1 ||
                  resp.message.search('参数错误') !== -1
                ) {
                  // 参数错误的情况为节假日
                  UserOperation.clearIntervals(intervals);
                } else if (resp.status == 'success' || resp.message.search('有效预约') !== -1) {
                  return;
                }
              });
            }
          } else if (now > this.endRequestTime) {
            UserOperation.clearIntervals(intervals);
          }
        }, 1050);
        intervals.push(interval);
      }
    } catch (err) {
      UserOperation.clearIntervals(intervals);
      return logger.error(err);
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
  public async getAllFreeSeats(beginHour?: number, endHour?: number, date?: FormatDate, buildId?: number) {
    beginHour = beginHour || this.DEFAULT_BEGIN_HOUR;
    endHour = endHour || this.DEFAULT_END_HOUR;
    buildId = buildId || BUILDING_ID_YF;
    if (!this.isValid(beginHour, endHour)) {
      return false;
    }
    date = date || FormatDate.today();

    const cookie: string = await getCookie(this.user.wechatConfig);
    logger.debug(`cookie: ${cookie}`);

    // 获取 Building 里所有房间
    const rooms: Room[] = await getRooms(BUILDING_ID_YF, cookie);

    let freeSeats: Seat[] = [];
    for (const room of rooms) {
      const seatsByTime = await getSeatsByTime(cookie, date, beginHour, endHour, room.roomId, buildId);

      const frees: Seat[] = _.filter(seatsByTime, (seat: Seat) => {
        return seat.status === SeatState.FREE;
      });

      for (const seat of frees) {
        loadBookSeatTime(cookie, seat.id, date).then((resp) => {
          let start = resp.start !== 'now' ? parseInt(resp.start) / 60 : resp.start;
          let end = resp.end !== 'now' ? parseInt(resp.end) / 60 : resp.end;
          logger.debug(`${room.room} ${seat.name}: [${start}, ${end}]`);
          // bookSeat(cookie, seat.id, date, resp.start, resp.end).then((resp: BookSeatResult) => {
          //     console.log(resp);
          // });
        });
      }
      // freeSeats = freeSeats.concat(frees);
    }
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
      logger.info('清除抢座请求定时器列表');
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
    if (beginHour > endHour || beginHour < this.DEFAULT_BEGIN_HOUR || endHour > this.DEFAULT_END_HOUR) {
      logger.info(`[${beginHour}, ${endHour}] 时间段非法`);
      return false;
    }
    return true;
  }
}
