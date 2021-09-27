export interface FormatDateConfig {
    year?: number,
    month?: number,
    day?: number
}

export interface FullDateConfig {
    dateSplitSymbol?: string,
    splitSymbol?: string,
    timeSplitSymbol?: string,
    isKeepTwoDigit: boolean,
}

export class FormatDate {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;

    /**
     * 根据年月日生成日期，缺省时根据当前日期填写数据
     *
     * @param dateConfig 配置类
     */
    constructor(dateConfig?: FormatDateConfig) {
        const nowDate = new Date();
        const year = nowDate.getFullYear();
        const month = nowDate.getMonth() + 1;
        const day = nowDate.getDate();

        this.year = dateConfig?.year || year;
        this.month = dateConfig?.month || month;
        this.day = dateConfig?.day || day;
    }

    /**
     * 返回当前的日期
     */
    public static today(): FormatDate {
        return new FormatDate();
    }

    /**
     * 获取明天的日期
     */
    public static tomorrow(): FormatDate {
        return this.getDate(1);
    }

    /**
     * 获取`在今天日期的基础上加减 day 天`的结果
     * eg:
     *      今天的年月日为 '2021-9-25', day = 5
     *      返回的年月日为 '2021-9-30'
     *
     * @param day 需要加减的日期
     */
    public static getDate(day?: number): FormatDate {
        let expectedDay: Date = new Date();
        expectedDay.setDate(expectedDay.getDate() + day);
        return new FormatDate({
            year: expectedDay.getFullYear(),
            month: expectedDay.getMonth() + 1,
            day: expectedDay.getDate(),
        });
    }

    /**
     * 格式化为：yyyy-mm-dd
     * @param splitSymbol 分隔符，默认为 "-"
     */
    public toString(splitSymbol?: string): string {
        const s = splitSymbol || '-';
        return `${this.year}${s}${this.month < 10 ? '0' : ''}${this.month}${s}${this.day}`;
    };

    public compareTo(other: FormatDate): number {
        return this.toString().localeCompare(other.toString());
    }
}

export interface FormatTimeConfig {
    hour?: number,
    minute?: number,
    second?: number,
}

export class FormatTime {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;
    private readonly DIGIT_SPLIT_LINE: number = 10;

    constructor(timeConfig?: FormatTimeConfig) {
        this.hour = timeConfig?.hour || 0;
        this.minute = timeConfig?.minute || 0;
        this.second = timeConfig?.second || 0;
    }

    /**
     * 返回当前时间
     */
    public static now(): FormatTime {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        return new FormatTime({hour, minute, second});
    }

    /**
     * 默认格式化为：hh:mm
     * 若 hh 或 mm 小于 2 位数，默认不带零
     * @param splitSymbol 分隔符，默认为 ":"
     * @param isKeepTwoDigit 是否保持两位数。如果是则只有一位数时在前面添 0
     */
    public getDisplayTime(splitSymbol?: string, isKeepTwoDigit?: boolean): string {
        let hourPrefix: string = '';
        let minutePrefix: string = '';

        if (isKeepTwoDigit) {
            hourPrefix = this.hour < this.DIGIT_SPLIT_LINE ? '0' : hourPrefix;
            minutePrefix = this.minute < this.DIGIT_SPLIT_LINE ? '0' : minutePrefix;
        }

        return `${hourPrefix}${this.hour}${splitSymbol}${minutePrefix}${this.minute}`;
    }

    /**
     * 格式化为：hh:mm:ss
     */
    public getFullTime(splitSymbol?: string, isKeepTwoDigit?: boolean): string {
        return this.toString(splitSymbol, isKeepTwoDigit);
    }

    toString(splitSymbol?: string, isKeepTwoDigit?: boolean): string {
        let secondPrefix: string = '';
        if (isKeepTwoDigit) {
            secondPrefix = this.second < this.DIGIT_SPLIT_LINE ? '0' : secondPrefix;
        }
        const displayTime = this.getDisplayTime(splitSymbol, isKeepTwoDigit);
        return `${displayTime}${splitSymbol}${secondPrefix}${this.second}`;
    }

    public compareTo(other: FormatTime): number {
        return this.toString('', true).localeCompare(other.toString('', true));
    }
}

export class FullFormatDate {
    public readonly date: FormatDate;
    public readonly time: FormatTime;

    constructor(dateConfig?: FormatDateConfig, timeConfig?: FormatTimeConfig) {
        this.date = new FormatDate(dateConfig) || FormatDate.today();
        if (!timeConfig) {
            this.time = FormatTime.now();
        } else {
            this.time = new FormatTime(timeConfig);
        }
    }

    public static now(): FullFormatDate {
        return new FullFormatDate();
    }

    /** without second */
    getDisplayFullDate(config?: FullDateConfig) {
        const d: string = config?.dateSplitSymbol || '-';
        const s: string = config?.splitSymbol || ' ';
        const t: string = config?.timeSplitSymbol || ':';
        const k: boolean = config?.isKeepTwoDigit || false;
        return `${this.date.toString(d)}${s}${this.time.toString(t, k)}`;
    }

    /** include date and time, such as "2021-09-23"*/
    toString(config?: FullDateConfig) {
        return this.getDisplayFullDate(config);
    }

    compareTo(other: FullFormatDate): number {
        const dateResult = this.date.compareTo(other.date);
        return dateResult !== 0 ? dateResult : this.time.compareTo(other.time);
    }
}

export const FULL_DATE_7 = new FullFormatDate(FormatDate.today(), {hour: 7});
export const FULL_DATE_22 = new FullFormatDate(FormatDate.today(), {hour: 22});
