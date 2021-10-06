import moment, { Moment } from "_moment@2.29.1@moment";
import CycleTimer from "../src/entity/cycle-timer";

const todayMoment: Moment = moment();

new CycleTimer(() => {
  console.log("等待成功！" + moment().format("YYYY-MM-DD HH:mm:ss"));
}, moment().add(2, "seconds")).start();
