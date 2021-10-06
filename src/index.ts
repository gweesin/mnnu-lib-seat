import { Room, Seat, UserExpected } from "./request/data";
import { OccupySeat } from "./request/occupy-seat";
import { getCookie } from "./category/user";
import * as config from "../app-config.json";
import moment, { Moment } from "moment";
import { BookTimes, Duration, User } from "./request/user";
import Koa from "koa";
import Router from "koa-router";
import { BUILDING_ID_YF, getRooms } from "./category/building";
import { getSeats } from "./category/room";
import { FormatDate } from "./utils/date-utils";
import _ from "lodash";
import CycleTimer from "./entity/cycle-timer";

const users: User[] = config.users;
const today: FormatDate = FormatDate.today();
const tomorrow: Moment = moment().add(1, "days");

const app: Koa = new Koa();
const router: Router = new Router<any, {}>();

async function bookExpectSeat() {
  for (const user of users) {
    const expects: UserExpected[] = user.expectSeats;
    let bookTimes: BookTimes = user.bookTimes;
    let duration: Duration = bookTimes[tomorrow.day()] || bookTimes.default;
    console.log(duration);

    const times = config.times;
    const watch = times.watchingTime;
    const start = times.startRequestTime;
    const end = times.endRequestTime;
    const cycleTimer: CycleTimer = new CycleTimer(async () => {
      const startTime: number = new Date().setHours(
        start.hour,
        start.minute,
        start.second
      );
      const endTime: number = new Date().setHours(
        end.hour,
        end.minute,
        end.second
      );
      const occupySeat = new OccupySeat(user, expects, startTime, endTime);
      const cookie: string = await getCookie();
      console.log(cookie);
      await occupySeat.occupyExpectedSeat(cookie, duration.begin, duration.end);
    }, moment(`${watch.hour}:${watch.minute}:${watch.second}`, "HH:mm:ss"));

    // cycleTimer.start();
  }
}

router.get("/", async (ctx) => {
  ctx.response.body = `
<h1>Welcome!!!</h1>
<li><a href="/">请求页面列表</a></li>
<li><a href="/get/yf/seats">获取所有逸夫座位</a></li>
<li><a href="/get/users/info">获取所有用户信息</a></li>
`;
});

router.get("/get/yf/seats", async (ctx) => {
  const cookie: string = await getCookie();
  if (!cookie) {
    return (ctx.response.body = `<h1>获取逸夫座位失败</h1>`);
  }

  const rooms: Room[] = await getRooms(BUILDING_ID_YF, cookie);
  for (let room of rooms) {
    const seats: Seat[] = await getSeats(cookie, room.roomId, today);
    room["seats"] = seats;
  }
  ctx.response.body = _.map(rooms, (room) => {
    return _.map(room["seats"], (seat: Seat) => {
      return {
        roomId: room.roomId,
        roomName: room.room,
        seatId: seat.id,
        seatName: seat.name,
      };
    });
  });
});

router.get("/get/users/info", async (ctx) => {
  ctx.response.body = users;
});

router.get("/", async (ctx) => {
  for (const user of users) {
    const occupySeat = new OccupySeat(user, user.expectSeats);
    let hours = new Date().getHours();
    await occupySeat.getAllFreeSeats(hours, hours + 1);
  }
});

app.use(router.routes());
app.listen(config.server.port, () => {
  console.log("服务器启动成功");
  bookExpectSeat();
});
