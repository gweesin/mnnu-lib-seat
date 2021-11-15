import { Room, Seat } from '../src/request/data';
import { UserOperation } from '../src/request/user-operation';
import { getCookie } from '../src/category/user';
import { users } from '../config/user-config.json';
import { server } from '../config/app-config.json';
import moment from 'moment';
import Koa from 'koa';
import Router from 'koa-router';
import { BUILDING_ID_YF, getRooms } from '../src/category/building';
import { getSeats } from '../src/category/room';
import { FormatDate } from '../src/utils/date-utils';
import _ from 'lodash';
import CycleTimer from '../src/entity/cycle-timer';
import getLogger from '../src/entity/logger';
import cors from 'koa2-cors';

const logger = getLogger('main');

const app: Koa = new Koa();
const router: Router = new Router<any, {}>();

app.use(cors());
async function bookExpectSeat() {
  for (const user of users) {
    const userLogger = getLogger(user.name);
    const watch = user.times.watchingTime;
    userLogger.debug(`加载配置信息：程序启动时间 ${watch.hour}:${watch.minute}:${watch.second}`);
    const cycleTimer: CycleTimer = new CycleTimer(async () => {
      const userOperation = new UserOperation(user);
      await userOperation.occupyExpectedSeat();
    }, moment(`${watch.hour}:${watch.minute}:${watch.second}`, 'HH:mm:ss'));

    cycleTimer.start();
  }
}

// router.get('/', async (ctx) => {
//   ctx.response.body = `
// <h1>Welcome!!!</h1>
// <li><a href='/'>请求页面列表</a></li>
// <li><a href='/get/yf/seats'>获取所有逸夫座位</a></li>
// <li><a href='/get/users/info'>获取所有用户信息</a></li>
// `;
// });

router.get('/get/yf/seats', async (ctx) => {
  const today: FormatDate = FormatDate.today();

  const COOKIE: string = await getCookie(users[0].wechatConfig);
  if (!COOKIE) {
    return (ctx.response.body = `<h1>获取逸夫座位失败</h1>`);
  }

  const rooms: Room[] = await getRooms(BUILDING_ID_YF, COOKIE);
  for (let room of rooms) {
    const seats: Seat[] = await getSeats(COOKIE, room.roomId, today);
    room['seats'] = seats;
  }
  ctx.response.body = _.map(rooms, (room) => {
    return _.map(room['seats'], (seat: Seat) => {
      return {
        roomId: room.roomId,
        roomName: room.room,
        seatId: seat.id,
        seatName: seat.name,
      };
    });
  });
});

router.get('/get/users/info', async (ctx) => {
  ctx.response.body = users;
});

router.get('/', async (ctx) => {
  for (const user of users) {
    const userOperation = new UserOperation(user);
    let hours = new Date().getHours();
    await userOperation.getAllFreeSeats(hours, hours + 1);
  }
});

app.use(router.routes());

app.listen(server.port, () => {
  logger.info('服务器启动成功');
  console.log('服务器启动成功');
  bookExpectSeat();
});
