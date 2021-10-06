import { Room, Seat, UserBookHistory } from "../src/request/data";
import { BUILDING_ID_YF, getRooms } from "../src/category/building";
import { getCookie, getUserBookHistory, login } from "../src/category/user";
import { FormatDate } from "../src/utils/date-utils";
import { User } from "../src/request/user";
import { getSeats } from "../src/category/room";
import * as config from "../user-config.json";

(async () => {
  const users: User[] = config.users;

  for (const user of users) {
    const COOKIE: string = await getCookie();
    console.log(`从微信获取 cookie: ${COOKIE}`);
    // const isLogin: boolean = await login(user, COOKIE)
    // console.log(`${user.account}：登录${isLogin ? '成功' : '失败'}`);

    // 预约记录
    const bookHistory: UserBookHistory = await getUserBookHistory(COOKIE);
    console.log(bookHistory);

    // 获取 Building 里所有房间
    const rooms: Room[] = await getRooms(BUILDING_ID_YF, COOKIE);

    // 获取房间里所有座位
    const seats: Seat[] = await getSeats(
      COOKIE,
      rooms[1].roomId,
      FormatDate.tomorrow()
    );
    for (const seat of seats) {
      console.log(seat);
    }
  }
})();
