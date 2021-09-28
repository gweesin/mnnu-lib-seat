export interface Result {
  content: string;
  params:
    | {
        history: UserBookHistory;
        releaseSeat: boolean;
      }
    | {
        violations: UserBookViolationsHistory;
      }
    | Building
    | RoomDetails
    | RoomFreeSeats
    | any;
  status: boolean;
}

export enum BookState {
  CANCEL = "CANCEL", // 已取消
  AWAY = "AWAY", // 暂时离开
  CHECK_IN = "CHECK_IN", // 履约中
  COMPLETE = "COMPLETE", // 已履约
  INCOMPLETE = "INCOMPLETE", // 早退
  MISS = "MISS", // 失约
  STOP = "STOP", // 结束使用
}

export interface UserBookHistory {
  awayBegin: null | any;
  awayEnd: null | any;
  begin: string;
  date: string;
  end: string;
  id: number;
  loc: string;
  stat: BookState;
}

export interface UserBookViolationsHistory {}

export interface Building {
  buildId: 1 | 2;
  rooms: Room[];
}

export interface Room {
  away: number;
  floor: number; // 楼层
  free: number; // 可用的空位置数
  inUse: number; // 正在使用的人数
  maxHour: number;
  reserved: number; // 当前房间预定的位置数
  room: string; // 房间名称
  roomId: number; // room id, 根据这个字段选择房间号
  totalSeats: number; // 总座位数
}

export interface RoomDetails {
  row: number;
  cols: number;
  seats: Seat[];
}

export interface RoomFreeSeats {
  linkSign: "activitySeat" | string;
  seats: Seat[];
}

export interface Seat {
  type: SeatType;
  col: number;
  row: number;
  id: number; // 座位的 id, 根据这个选择座位
  status: SeatState | string;
  window: boolean; // 是否靠窗
  power: boolean; // 是否靠近电源
  computer: boolean; // 是否有电脑
  local: boolean;
  name: string; // 座位名称
}

export enum SeatType {
  EMPTY = "empty",
  SEAT = "seat",
  DOOR = "door",
}

export enum SeatState {
  IN_USE = "IN_USE", // 使用中
  FULL = "FULL", // 有约
  FREE = "FREE", // 可选，空座位
}

// 保存预约记录的返回值
export interface BookSeatResult {
  status: string;
  data: any;
  message: string;
  code: string;
}

export interface BookLoadTime {
  id: string; // 值
  value: string; // 名称
}

export interface UserExpected {
  readonly roomId?: number;
  readonly seatId: number;
  readonly priority?: number;
}
