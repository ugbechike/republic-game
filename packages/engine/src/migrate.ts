import { RESOURCES, type Room } from '@republic/contracts';
export function migrateRoom(room: Room, minimum: number) {
  room.minPlayers = minimum;
  for (const r of room.republics) {
    for (const resource of RESOURCES) r.stocks[resource] ??= 0;
    r.disruptions ??= [];
  }
  return room;
}
