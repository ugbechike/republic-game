import { existsSync } from 'node:fs';
import { createApp } from './app';
import { createStore } from './store';
if (existsSync('../../.env')) process.loadEnvFile('../../.env');
const { app } = await createApp(await createStore());
await app.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' });
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
