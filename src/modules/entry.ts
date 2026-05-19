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

export const entryModule = new Elysia({ prefix: '/api' })
  .get('/entry/:year/:month/:day/:slug', async ({ params, set }) => {
    const { year, month, day, slug } = params;

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) ||
      monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        set.status = 400;
        throw new Error('Неверная дата в адресе');
      }
    
    // Границы дня (в секундах)
    const startDay = Math.floor(Date.UTC(yearNum, monthNum - 1, dayNum, 0, 0, 0) / 1000);
    const endDay = Math.floor(Date.UTC(yearNum, monthNum - 1, dayNum, 23, 59, 59) / 1000);

    try {
      // Найти entryid по slug и дате
      const [found] = await db`
        SELECT entryid, intime
        FROM int_entry
        WHERE urlcache = ${slug}
          AND intime >= ${startDay}
          AND intime <= ${endDay}
        ORDER BY intime DESC
        LIMIT 1
      `;

      if (!found) {
        set.status = 404;
        throw new Error(`Запись ${slug} за ${day}.${month}.${year} не найдена`);
      }

      // Загрузить полную запись по найденному entryid
      const [entry] = await db`
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
        WHERE e.entryid = ${found.entryid}
      `;

      if (!entry) {
        set.status = 404;
        throw new Error('Запись не найдена');
      }

      const cleanEntry = formatEntry(entry as RawEntry, true);

      return {
        ...cleanEntry,
        settings: { commentDays: 30} // TODO: Заменить на конфиг
      } as typeof EntrySchema.static & { settings: { commentDays: number }}
    } catch (err) {
      console.error('DB Error in /api/entry:', err);
      throw err;
    }
  }, {
    // Валидация схемы ответа
    response: t.Object({
      ...EntrySchema.properties,
      settings: t.Object({ commentDays: t.Number() })
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить запись по ЧПУ /year/month/day/slug'
    }
  });