import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';

interface RawEntry {
  entryid: number;
  subject: string;
  intime: string;
  urlcache: string;
}

export const entriesModule = new Elysia({ prefix: '/api' })
  .get('/entries', async () => {
    try {
      const entries = await db`
        SELECT entryid, subject, intime, urlcache 
        FROM int_entry 
        ORDER BY intime DESC 
        LIMIT 10
      `;

      console.log('Надено записей:', entries.length);
      console.table(entries);

      return {
        status: 'success',
        count: entries.length,
        data: entries
      }
    } catch (err) {
      console.error('Ошибка базы данных', err);
      throw new Error('Не удалось загрузить записи');
    }
  }, {
    response: t.Object({
      status: t.String(),
      count: t.Number(),
      data: t.Array(t.Any()),
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить список записей (реальный запрос к БД)',
    }
  });