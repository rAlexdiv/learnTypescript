import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';

const EntrySchema = t.Object({
  entryid: t.Number(),
  subject: t.String(),
  intime: t.String(),
  urlcache: t.String(),
});

type Entry = typeof EntrySchema.static;

// Перевод даты в UNIX-timestamp диапазон секунд
const getDateRange = (year: number, month?: number, day?: number) => {
  const startMonth = month ?? 1;
  const endMonth = month ?? 12;
  const startDay = day ?? 1;
  const endDay = day ?? (month ? new Date(Date.UTC(year, month, 0)).getDate() : 31);

  const start = Math.floor(new Date(Date.UTC(year, startMonth - 1, startDay, 0, 0, 0)).getTime() / 1000);
  const end = Math.floor(new Date(Date.UTC(year, endMonth - 1, endDay, 23, 59, 59)).getTime() / 1000);

  return { start, end };
};

// Общий хендлер для всех трёх роутов
const getEntriesByDate = async ({ params, query }: { params: any, query: any }) => {
  const { year, month, day } = params;
  const { page = 1, limit = 10 } = query;
  const offset = Math.max(0, Math.floor((page - 1) * limit));

  // Парсинг в числа
  const yearNum = parseInt(year, 10);
  const monthNum = month ? parseInt(month, 10) : undefined;
  const dayNum = day ? parseInt(day, 10) : undefined;

  // Валидация
  if (isNaN(yearNum) || yearNum < 1970 || yearNum > 2100) throw new Error('Неверный год');
  if (monthNum && (isNaN(monthNum) || monthNum < 1 || monthNum > 12)) throw new Error('Неверный месяц');
  if (dayNum && (isNaN(dayNum) || dayNum < 1 || dayNum > 31)) throw new Error('Неверный день');

  const { start, end } = getDateRange(yearNum, monthNum, dayNum);

  const [totalResult, entries] = await Promise.all([
    db`
      SELECT COUNT(*) as count
      FROM int_entry
      WHERE intime >= ${start} AND intime <= ${end}
    `,
    db`
      SELECT entryid, subject, intime, urlcache 
      FROM int_entry 
      WHERE intime >= ${start} AND intime <= ${end}
      ORDER BY intime DESC 
      LIMIT ${limit} OFFSET ${offset}
    `,
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const pages = Number(Math.ceil(total / limit));
  const cleanEntries: Entry[] = entries.map(({ 
    entryid, 
    subject, 
    intime, 
    urlcache 
  }) => ({
    entryid, 
    subject, 
    intime, 
    urlcache
  }));

  return {
        status: 'success',
        period: day ? 'day' : month ? 'month' : 'year',
        year: yearNum,
        month: monthNum ?? 0,
        day: dayNum ?? 0,
        page,
        pages,
        limit,
        offset,
        total,
        data: cleanEntries,
      };
};

export const entriesArchiveModules = new Elysia({ prefix: '/api'})
  // За год месяца дня
  .get('/entries/:year/:month/:day', async (ctx) => {
    try {
      return await getEntriesByDate(ctx);
    } catch (err) {
      console.error('Archive error', err);
      throw new Error('Ошибка загрузки архива');
    }
  }, {
    params:t.Object({
      year: t.String({ pattern: '^\\d{4}$', description: 'Год, 4 цифры' }),
      month: t.String({ pattern: '^\\d{2}$', description: 'Месяц, 2 цифры — 01-12' }),
      day: t.String({ pattern: '^\\d{2}$', description: 'День, 2 цифры — 01-31' }),
    }),
    query: t.Object({
      page: t.Number({ minimum: 1, default: 1 }),
      limit: t.Number({ minimum: 1, maximum: 100, default: 10 }),
    }),
    response: t.Object({
      status: t.String(),
      period: t.String(),
      year: t.Number(),
      month: t.Number(),
      day: t.Number(),
      page: t.Number(),
      pages: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
      total: t.Number(),
      data: t.Array(EntrySchema),
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить записи за год месяца дня',
      description: 'Принимает /year/month/day/?page=1&limit=10. В ответе month=0 или day=0 означают, что фильтр не применялся. Возвращает все записи за указанный день месяца в году, с пагинацией',
    }
  })
  // За год месяца
  .get('/entries/:year/:month', async (ctx) => {
    try {
      return await getEntriesByDate(ctx);
    } catch (err) {
      console.error('Archive error', err);
      throw new Error('Ошибка загрузки архива');
    }
  }, {
    params:t.Object({
      year: t.String({ pattern: '^\\d{4}$', description: 'Год, 4 цифры' }),
      month: t.String({ pattern: '^\\d{2}$', description: 'Месяц, 2 цифры — 01-12' }),
    }),
    query: t.Object({
      page: t.Number({ minimum: 1, default: 1 }),
      limit: t.Number({ minimum: 1, maximum: 100, default: 10 }),
    }),
    response: t.Object({
      status: t.String(),
      period: t.String(),
      year: t.Number(),
      month: t.Number(),
      day: t.Number(),
      page: t.Number(),
      pages: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
      total: t.Number(),
      data: t.Array(EntrySchema),
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить записи за год месяца',
      description: 'Принимает /year/month/?page=1&limit=10. В ответе month=0 или day=0 означают, что фильтр не применялся. Возвращает все записи за указанный месяц в году, с пагинацией',
    }
  })
  // За год
  .get('/entries/:year', async (ctx) => {
    try {
      return await getEntriesByDate(ctx);
    } catch (err) {
      console.error('Archive error', err);
      throw new Error('Ошибка загрузки архива');
    }
  }, {
    params:t.Object({
      year: t.String({ pattern: '^\\d{4}$', description: 'Год, 4 цифры' }),
    }),
    query: t.Object({
      page: t.Number({ minimum: 1, default: 1 }),
      limit: t.Number({ minimum: 1, maximum: 100, default: 10 }),
    }),
    response: t.Object({
      status: t.String(),
      period: t.String(),
      year: t.Number(),
      month: t.Number(),
      day: t.Number(),
      page: t.Number(),
      pages: t.Number(),
      limit: t.Number(),
      offset: t.Number(),
      total: t.Number(),
      data: t.Array(EntrySchema),
    }),
    detail: {
      tags: ['Entries'],
      summary: 'Получить записи за год',
      description: 'Принимает /year/?page=1&limit=10. Возвращает все записи за указанный год, с пагинацией',
    }
  })