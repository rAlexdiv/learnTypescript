import { db } from './db/index.ts';
import { Elysia, t } from 'elysia';
import { entriesModule } from './modules/entries.ts';

const app = new Elysia()
  .use(entriesModule)
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return '404 Not found';
    }
    if (code === 'INTERNAL_SERVER_ERROR') {
      set.status = 500;
      console.error('Unhandled error:', error);
      return { error: 'Внутренняя ошибка сервера' };
    }
  });

app.listen(3000);
console.log(`API запущен: http://localhost:${app.server?.port}/api/entries`); // /api/entries — временное решени для отладки

process.on('SIGINT', async () => {
  console.log(`\nЗакрываю пул соединений`);
  await db.end();
  process.exit(0);
})