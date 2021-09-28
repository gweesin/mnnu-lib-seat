import { Room, Seat, UserBookHistory } from "../src/request/data";
import { BUILDING_ID_YF, getRooms } from "../src/category/building";
import { getCookie, getUserBookHistory, login } from "../src/category/user";
import { FormatDate } from "../src/utils/date-utils";
import { User } from "../src/request/user";
import { getUsers } from "../src/category/config-load";
import { getSeats } from "../src/category/room";

(async () => {
  const users: User[] = await getUsers();

  for (const user of users) {
    const COOKIE: string = await getCookie();
    console.log(`从微信获取 cookie: ${COOKIE}`);

    // 获取 Building 里所有房间
    const rooms: Room[] = await getRooms(BUILDING_ID_YF, COOKIE);

    // 获取房间里所有座位
    const seats: Seat[] = await getSeats(
      COOKIE,
      rooms[1].roomId,
      FormatDate.tomorrow()
    );
    for (const seat of seats) {
      console.log(
        `seatId: ${seat.id}, name: ${seat.name}, status: ${seat.status}`
      );
    }
  }
})();
