import moment, { Moment } from "moment";

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
    this.timer = setTimeout(() => {
      this._callback();
      this._expectedMoment.add(1, "days");
      return this.start();
    }, this._expectedMoment.diff(moment()));
  }

  public stop(): void {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
