import type { PartyIntent, PartyView, RoomView } from '@republic/contracts';
export type PartySend = (intent: PartyIntent) => Promise<boolean>;
export type PartyProps = { game: PartyView; world: RoomView; send: PartySend; busy: boolean };
