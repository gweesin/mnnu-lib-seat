import { UserExpected } from "./request/data";
import { OccupySeat } from "./request/occupy-seat";
import { getCookie } from "./category/user";
import { users } from "../app-config.json";

// (async () => {
//     const users: User[] = await getUsers();
//     for (const user of users) {
//         // for (let i = 0; true; ++i) {
//         while (true) {
//             // const COOKIE: string = 'JSESSIONID=BB9ED4513C70B85F9F6F2D1C26906D49;';
//             let cookie: string = await getCookie();
//
//             const now: Date = new Date();
//             const nowString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}`;
//             // if (now.getHours() >= 17 && now.getMinutes() > 59 && now.getSeconds() > 58 || now.getHours() > 17) {
//             // const COOKIE: string = await getCookie();
//
//             const result: BookSeatResult = await bookSeat(cookie, expected.seatId, TOMORROW);
//             if (result.status !== 'fail') {
//                 console.log(result);
//                 break;
//             }
//             console.log(`${nowString} ${result.message}`);
//         }
//     }
// })();

// getUsers().then(async users => {
//     for (const user of users) {
//         const cookie: number = new Date().setHours(17, 57, 0);
//         const occupySeat = new OccupySeat(user, expecteds,
//             new Date().setHours(17, 59, 59),
//             new Date().setHours(18, 50, 0),
//         );
//         await occupySeat.occupyExpectedSeat(10, 21);
//     }
// });

(async () => {
  for (const user of users) {
    const expecteds: UserExpected[] = user["expected-seats"];

    const cookieTime: number = new Date().setHours(17, 57, 0);
    const startTime: number = new Date().setHours(17, 59, 59);
    const endTime: number = new Date().setHours(18, 5, 0);
    const occupySeat = new OccupySeat(user, expecteds, startTime, endTime);

    while (true) {
      if (Date.now() >= cookieTime) {
        const cookie: string = await getCookie();
        console.log(cookie);
        occupySeat.occupyExpectedSeat(cookie, 8, 22);
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
