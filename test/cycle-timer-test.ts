import moment, { Moment } from 'moment';
import CycleTimer from '../src/entity/cycle-timer';

const todayMoment: Moment = moment();

new CycleTimer(async () => {
  await new Promise(() => {
    console.log('开始等待！' + moment().format('YYYY-MM-DD HH:mm:ss'));
    const twoSeconds = new Date().setSeconds(new Date().getSeconds() + 15);
    while (Date.now() < twoSeconds);
    console.log('等待成功！' + moment().format('YYYY-MM-DD HH:mm:ss'));
  });
}, moment().add(2, 'seconds')).start();
