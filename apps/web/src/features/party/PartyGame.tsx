import type { WorldController } from '../room/useWorld';
import type { PartyIntent } from '@republic/contracts';
import { PartyLobby } from './PartyLobby';
import { RoleReveal } from './RoleReveal';
import { PartyShell } from './PartyShell';
import { PartyResults } from './PartyResults';
export function PartyGame({ c }: { c: WorldController }) {
  const game = c.world!.party!;
  const props = {
    game,
    world: c.world!,
    send: (intent: PartyIntent) => c.send({ type: 'party', match: game.id, intent }),
    busy: c.busy,
    leave: c.leave,
  };
  if (game.stage === 'lobby') return <PartyLobby {...props} />;
  if (game.stage === 'reveal') return <RoleReveal {...props} />;
  if (game.stage === 'ended') return <PartyResults {...props} />;
  return <PartyShell key={game.id} {...props} />;
}
