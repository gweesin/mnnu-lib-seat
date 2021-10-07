import moment, { Moment } from 'moment';
import getLogger from '../entity/logger';

const logger = getLogger('timer');

export default class CycleTimer {
  private timer: NodeJS.Timer;
  private _callback: (...args: any) => void;
  private _expectedMoment: Moment;

  constructor(callback: (...args: any) => void, expectedMoment: Moment) {
    this._callback = callback;
    this._expectedMoment = expectedMoment;
  }

  public start(): void {
    this.stop();
    logger.debug(`期望开始监听时间 ${this._expectedMoment.format('HH:mm:ss')}`);
    const waitTime: number = this._expectedMoment.diff(moment());

    const HOUR = Math.floor(waitTime / 1000 / 60 / 60);
    const MINUTE = Math.floor((waitTime / 1000 / 60) % 60);
    const SECOND = Math.floor((waitTime / 1000) % 60);
    logger.debug(`离开始监听还需要 ${HOUR}:${MINUTE}:${SECOND}`);

    this.timer = setTimeout(() => {
      this._callback();
      this._expectedMoment.add(1, 'days');
      return this.start();
    }, waitTime);
  }

  public stop(): void {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
