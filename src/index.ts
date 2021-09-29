import { UserExpected } from "./request/data";
import { OccupySeat } from "./request/occupy-seat";
import { getCookie } from "./category/user";
import * as config from "../app-config.json";
import moment, { Moment } from "moment";
import { BookTimes, Duration, User } from "./request/user";

const users: User[] = config.users;
const tomorrow: Moment = moment().add(1, "days");
console.log(tomorrow.format("YYYY-MM-DD") + " " + tomorrow.day());

(async () => {
  for (const user of users) {
    const expects: UserExpected[] = user.expectSeats;
    let bookTimes: BookTimes = user.bookTimes;
    let duration: Duration = bookTimes[tomorrow.day()] || { begin: 8, end: 22 };
    console.log(duration);

    const cookieTime: number = new Date().setHours(17, 57, 0);
    const startTime: number = new Date().setHours(17, 59, 59);
    const endTime: number = new Date().setHours(18, 5, 0);
    const occupySeat = new OccupySeat(user, expects, startTime, endTime);

    while (true) {
      if (Date.now() >= cookieTime) {
        const cookie: string = await getCookie();
        console.log(cookie);
        await occupySeat.occupyExpectedSeat(
          cookie,
          duration.begin,
          duration.end
        );
        break;
      }
    }
  }
})();

// getUsers().then(async users => {
//     for (const user of users) {
//         const occupySeat = new OccupySeat(user, expecteds);
//         let hours = new Date().getHours();
//         await occupySeat.getAllFreeSeats(hours, hours + 1);
//     }
// })
//
