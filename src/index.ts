import { db } from './db/index.ts';
import { Elysia, t } from 'elysia';
import { entriesModule } from './modules/entries.ts';
import { entryModule } from './modules/entry.ts';
import { commentsModule } from './modules/comments.ts'

const app = new Elysia()
  .use(entriesModule)  // Все записи с пагинацией
  .use(commentsModule) // Загрузка комментариев к записи по entryid
  .use(entryModule)    // Одна запись по ЧПУ /year/month/day/slug
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
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Неверные параметры' };
    }
  });

app.listen(3000);
console.log(`API запущен: http://localhost:${app.server?.port}/api/entries`); // /api/entries — временное решени для отладки

process.on('SIGINT', async () => {
  console.log(`\nЗакрываю пул соединений`);
  await db.end();
  process.exit(0);
})