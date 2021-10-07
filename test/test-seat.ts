import { Room, Seat, SeatState } from "../src/request/data";
import { BUILDING_ID_YF, getRooms } from "../src/category/building";
import { getCookie } from "../src/category/user";
import { FormatDate } from "../src/utils/date-utils";
import { User } from "../src/request/user";
import * as config from "../config/user-config.json";
import { getSeatsByTime } from "../src/category/room";
import {
  bookSeat,
  loadBookSeatTime,
  toFormatString,
} from "../src/category/seat";
import _ from "lodash";

function autoTest() {
  (async () => {
    const users: User[] = config.users;
    const date: FormatDate = FormatDate.getDate();

    for (const user of users) {
      const cookie: string = await getCookie();
      console.log(`从微信获取 cookie: ${cookie}`);

      // 获取 Building 里所有房间
      const rooms: Room[] = await getRooms(BUILDING_ID_YF, cookie);

      let freeSeats: Seat[] = [];

      for (const room of rooms) {
        const seatsByTime = await getSeatsByTime(
          cookie,
          date,
          21,
          22,
          room.roomId,
          BUILDING_ID_YF
        );

        const frees: Seat[] = _.filter(seatsByTime, (seat: Seat) => {
          return seat.status === SeatState.FREE;
          // return true;
        });

        freeSeats = freeSeats.concat(frees);
      }

      for (const seat of freeSeats) {
        console.log(toFormatString(seat));
        // loadBookSeatTime(cookie, seat.id, date).then(resp => {
        //     console.log(resp);
        // bookSeat(cookie, seat.id, date, resp.start, resp.end).then((resp: BookSeatResult) => {
        //     console.log(resp);
        // });
        // });
      }

      // if (freeSeats.length > 0) {
      //     const expectedSeat: Seat = freeSeats[0];
      //     const bookResult: BookSeatResult = await bookSeat(cookie, expectedSeat.id, date, 8, 22);
      //     console.log(bookResult);
      // }
    }
  })();
}

function testByHead() {
  (async () => {
    loadBookSeatTime(await getCookie(), 25505, FormatDate.tomorrow()).then(
      (resp) => {
        console.log(resp);
      }
    );
    bookSeat(await getCookie(), 25505, FormatDate.tomorrow()).then((resp) => {
      console.log(resp);
    });
  })();
}

// testByHead();
autoTest();
