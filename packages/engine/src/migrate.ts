import { ensureEconomy } from './economic-history';
import { RESOURCES, type Room } from '@republic/contracts';
export function migrateRoom(room: Room, minimum: number) {
  room.activeMs ??= (room.month * room.options.duration * 60000) / 240;
  room.nextWorldAt ??= (room.activeMs ?? 0) + 720000;
  room.minPlayers = minimum;
  for (const r of room.republics) {
    for (const resource of RESOURCES) r.stocks[resource] ??= 0;
    r.disruptions ??= [];
    ensureEconomy(r);
  }
  return room;
}
