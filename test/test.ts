import { getCookie } from "../src/category/user";
import { loadBookSeatTime, stopBookSeat } from "../src/category/seat";
import { FormatDate } from "../src/utils/date-utils";

(async () => {
  const COOKIE: string = await getCookie();
  const TODAY = FormatDate.today();
  console.log(`从微信获取 cookie: ${COOKIE}`);

  const seatId = 25537;
  // await loadBookSeatTime(COOKIE, seatId, FormatDate.now());

  // const seatResult = await stopBookSeat(COOKIE, 3593235);
  // console.log(seatResult);
  let result = await loadBookSeatTime(COOKIE, seatId, TODAY);
  console.log(result);
  // let res = await bookSeat(COOKIE, seatId, TODAY, result.start, result.end);
  // console.log(res);
})();
