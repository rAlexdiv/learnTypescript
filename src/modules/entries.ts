import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';

const CategorySchema = t.Object({
  fullname: t.String(),
  name: t.String(),
});

const EntrySchema = t.Object({
  entryid: t.Number(),
  subject: t.String(),
  content_p: t.String(),
  catid: t.Number(),
  intime: t.String(),
  comments: t.String(),
  commentcount: t.Number(),
  image: t.Number(),
  keywordcache: t.String(),
  urlcache: t.String(),
  category: t.Array(CategorySchema),
});

const toPlainEntry = (row: Record<string, unknown>) => ({
    entryid: Number(row.entryid ?? 0),
    subject: String(row.subject ?? ''),
    content_p: String(row.content_p ?? ''),
    catid: Number(row.catid ?? 0),
    intime: String(row.intime ?? ''),
    comments: String(row.comments ?? ''),
    commentcount: Number(row.commentcount ?? 0),
    image: Number(row.image ?? 0),
    keywordcache: String(row.keywordcache ?? ''),
    urlcache: String(row.urlcache ?? ''),
    category: row.category as { fullname: string; name: string }[],
});

export const entriesModule = new Elysia({ prefix: '/api' })
  .get('/entries', async ({ query }) => {
    try {
      const limit = query.limit ?? 10;
      const offset = query.offset ?? 0;

      // Выполнение запросов параллельно
      const [totalResult, entries] = await Promise.all([
        db`SELECT COUNT(*) as count FROM int_entry`,
        db`
          SELECT 
            e.entryid,
            e.subject,
            e.content_p,
            e.catid,
            e.intime,
            e.comments,
            e.commentcount,
            e.image,
            e.keywordcache,
            e.urlcache,
            COALESCE(
              json_agg(
                json_build_object(
                  'fullname', COALESCE(c.fullname, ''), 
                  'name', COALESCE(c.name, '')
                )
              ) FILTER (WHERE c.catid IS NOT NULL),
              '[]'::json
            ) as category
          FROM int_entry e
          LEFT JOIN int_category c ON e.catid = c.catid
          GROUP BY
            e.entryid,
            e.subject,
            e.content_p,
            e.catid,
            e.intime,
            e.comments,
            e.commentcount,
            e.image,
            e.keywordcache,
            e.urlcache
          ORDER BY e.intime DESC
          LIMIT ${limit} OFFSET ${offset}
      `]);

      const total = Number(totalResult[0]?.count ?? 0);
      const cleanEntries = entries.map(toPlainEntry);

      // Elysia сама сериализует объект в JSON + добавит Content-Type
      return { 
        total, 
        limit, 
        offset,
        entries: cleanEntries, 
      };
    } catch (err) {
      console.error('DB Error in /api/entries:', err);
      // Бросаем ошибку — она перехватится глобальным onError в index.ts
      throw new Error('Ошибка запроса к базе данных');
    }
  } , {
    // Валидация входящих параметров
    query: t.Object({
      limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      offset: t.Optional(t.Number({ minimum: 0 }))
    }),
    // Валидация ответа
    response: t.Object({
      total: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
      entries: t.Array(EntrySchema),
    }),
    // Метаданные для swagger
    detail: {
      tags: ['Entries'],
      summary: 'Получить список записей с пагинацией',
      description: 'Возвращает последние 10 записей и общее количество'
    }
  });