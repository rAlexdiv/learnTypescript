import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';

const EntrySchema = t.Object({
  entryid: t.Number(),
  subject: t.String(),
  intime: t.String(),
  urlcache: t.String(),
});

type Entry = typeof EntrySchema.static;

export const entriesModule = new Elysia({ prefix: '/api' })
  .get('/entries', async ({ query }) => {
    try {
      const { page, limit } = query;
      const offset = Math.max(0, Math.floor((page - 1) * limit));

      const entries: Entry[] = await db`
        SELECT entryid, subject, intime, urlcache 
        FROM int_entry 
        ORDER BY intime DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;

      console.log('Надено записей:', entries.length);
      console.table(entries);

      return {
        status: 'success',
        page,
        limit,
        offset,
        data: entries
      }
    } catch (err) {
      console.error('Ошибка базы данных', err);
      throw new Error('Не удалось загрузить записи');
    }
  }, {
    query: t.Object({
      page: t.Number({ minimum: 1, default: 1 }),
      limit: t.Number({ minimum: 1, maximum: 100, default: 10 }),
    }),
    response: t.Object({
      status: t.String(),
      page: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
      data: t.Array(EntrySchema),
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить список записей с пагинацией по страницам',
      description: 'Принимает ?page=2&limit=10, автоматически считает OFFSET',
    }
  });