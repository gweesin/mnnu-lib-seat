import {Room, Seat, UserBookHistory} from "../request/data";
import {BUILDING_ID_YF, getRooms} from "../category/building";
import {getCookie, getUserBookHistory, login} from "../category/user";
import {FormatDate} from "../utils/date-utils";
import {User} from "../request/config";
import {getUsers} from "../category/config-load";
import {getSeats} from "../category/room";

(async () => {
    const users: User[] = await getUsers();

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
        const seats: Seat[] = await getSeats(COOKIE, rooms[1].roomId, FormatDate.tomorrow());
        for (const seat of seats) {
            console.log(seat);
        }
    }
})();
