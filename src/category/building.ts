import { Building, Result, Room } from '../request/data';
import { AxiosResponse } from 'axios';
import axios, { URL } from '../request/axios-library';
import _ from 'lodash';

export const BUILDING_ID_YF: number = 1;
export const BUILDING_ID_KJG: number = 2;

/**
 * 获取 building 里所有的房间信息
 *
 * @param buildId 建筑的唯一标识，1 为逸夫， 2 为科技馆
 * @param cookie 请求头需要包含已登录的 cookie
 */
export async function getRooms(buildId: number, cookie: string): Promise<Room[]> {
  const { data: result }: AxiosResponse<Result> = await axios.get(`${URL}/libseat-ibeacon/loadRooms?buildId=${buildId}`, {
    headers: {
      Cookie: cookie,
    },
  });

  if (result.status === false) {
    return null;
  }
  const building: Building = result.params;

  const roomsInfo: string[] = _.map(
    building.rooms,
    (room: Room) => `${room.roomId < 10 ? ' ' : ''}${room.roomId} ${room.room}: 剩余 ${room.free < 10 ? ' ' : ''}${room.free}, 已用 ${room.inUse}`
  );
  for (const roomInfo of roomsInfo) {
    console.log(roomInfo);
  }
  return building.rooms;
}
