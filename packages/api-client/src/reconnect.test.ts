import { expect, it, vi } from 'vitest';
const sockets = vi.hoisted(() => ({
  created: [] as {
    handlers: Record<string, (...args: unknown[]) => void>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }[],
}));
vi.mock('socket.io-client', () => ({
  io: () => {
    const socket = {
      handlers: {} as Record<string, (...args: unknown[]) => void>,
      connect: vi.fn(),
      disconnect: vi.fn(),
      on(event: string, fn: (...args: unknown[]) => void) {
        this.handlers[event] = fn;
      },
    };
    sockets.created.push(socket);
    return socket;
  },
}));
import { RepublicClient } from './index';
it('reconnects after server shutdown without reconnecting an intentionally closed session', () => {
  const client = new RepublicClient('http://localhost:4000');
  const session = { code: 'ABCDE', playerId: 'a', token: 'token' };
  const status = vi.fn();
  const cleanup = client.connect(session, vi.fn(), status);
  const socket = sockets.created.at(-1)!;
  socket.handlers.disconnect('io server disconnect');
  expect(socket.connect).toHaveBeenCalledOnce();
  socket.handlers.disconnect('io client disconnect');
  expect(socket.connect).toHaveBeenCalledOnce();
  client.connect(session, vi.fn(), status);
  cleanup();
  expect(sockets.created.at(-1)!.disconnect).not.toHaveBeenCalled();
});
