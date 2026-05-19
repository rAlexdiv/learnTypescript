import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';
import { formatEntry, type RawEntry } from '../utils/formatEntry.ts';

const CategorySchema = t.Object({
  fullname: t.String(),
  name: t.String(),
});

const EntrySchema = t.Object({
  entryid: t.Number(),
  subject: t.String(),
  content: t.String(),
  catid: t.Number(),
  intime: t.String(),
  comments: t.String(),
  commentcount: t.Number(),
  image: t.Number(),
  keywordcache: t.String(),
  urlcache: t.String(),
  category: CategorySchema,
  keywords: t.Array(t.Object({ 
    word: t.String(), 
    unixword: t.String() 
  })),
  dateComponents: t.Object({ 
    year: t.Optional(t.Number()), 
    month: t.String(), 
    day: t.String() 
  }),
  breadcrumbsTitle: t.Object({ 
    title: t.String() 
  }),
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
            json_build_object(
              'fullname', COALESCE(c.fullname, ''),
              'name', COALESCE(c.name, '')
            ),
            '{}'::json
          ) as category
          FROM int_entry e
          LEFT JOIN int_category c ON e.catid = c.catid
          ORDER BY e.intime DESC
          LIMIT ${limit} OFFSET ${offset}
      `]);

      const total = Number(totalResult[0]?.count ?? 0);
      const cleanEntries = entries.map(entry => 
        formatEntry(entry as RawEntry, true)
      ) as Array<typeof EntrySchema.static>;

      // Elysia сама сериализует объект в JSON + добавит Content-Type
      return { 
        total, 
        limit, 
        offset,
        entries: cleanEntries, 
      };
    } catch (err) {
      console.error('DB Error in /api/entries:', err);
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
      description: 'Возвращает последние 10 записей и общее количество для пагинации'
    }
  });