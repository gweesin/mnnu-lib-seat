import {UserExpected} from "../request/data";
import {FormatDate} from "../utils/date-utils";
import {OccupySeat} from "../occupy-seat";
import {getCookie} from "../category/user";

// 预约指定地方的座位，默认 08:00 - 22:00
const TOMORROW: FormatDate = FormatDate.tomorrow();
const expected: UserExpected = {
    roomId: 33, // room=二楼电子阅览室
    seatId: 25505, // 137 号座位
};

export const expecteds: UserExpected[] = [
    {
        roomId: 33,
        seatId: 25505,
        priority: 5,
    },
    {
        roomId: 33,
        seatId: 25574,
        priority: 2,
    },
    {
        roomId: 33,
        seatId: 25576,
        priority: 1,
    },
    {
        roomId: 33,
        seatId: 25503,
        priority: 1,
    },
    {
        roomId: 9,
        seatId: 12580,
        priority: 1,
    },
    {
        roomId: 9,
        seatId: 12583,
        priority: 1,
    },
    {
        roomId: 9,
        seatId: 12577,
        priority: 1,
    }
];

// async function selectSeat

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

let user = {
    "account": "1805100131",
    "password": "mima592372302"
};

const cookieTime: number = new Date().setHours(17, 57, 0);
const startTime: number = new Date().setHours(17, 59, 59);
const endTime: number = new Date().setHours(18, 5, 0);
const occupySeat = new OccupySeat(user, expecteds, startTime, endTime);

(async () => {
    while (true) {
        if (Date.now() >= cookieTime) {
            const cookie: string = await getCookie();
            console.log(cookie);
            occupySeat.occupyExpectedSeat(cookie, 8, 22);
            break;
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
