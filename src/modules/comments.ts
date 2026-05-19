import { Elysia, t } from 'elysia';
import { db } from '../db/index.ts';

const CommentSchema = t.Object({
  commentid: t.Number(),
  content: t.String(),
  sendername: t.String(),
  senderurl: t.String(),
  intime: t.String(),
  sortorder: t.Number(),
  level: t.Number(),
  parent: t.Number(),
  admin: t.Number(),
  deleted: t.Number(),
});

export const commentsModule = new Elysia({ prefix: '/api' })
  .get('/comments/:entryid', async ({ params, set }) => {
    const { entryid } = params;
    const entryidNum = parseInt(entryid, 10);

    if (isNaN(entryidNum)) {
      set.status = 400;
      throw new Error('Неверный entryid');
    }

    try {
      const [entry] = await db`
      SELECT entryid, comments as "commentsEnabled"
      FROM int_entry
      WHERE entryid = ${entryidNum}
      `;

      if (!entry) {
        set.status = 404;
        throw new Error('Запись не найдена');
      }

      // Если выключены возвращем пустой массив?
      if (String(entry.commentsEnabled) !== '1') {
        return {
          entryid: entryidNum,
          commentsEnabled: false,
          total: 0,
          comments: []
        }
      }

      const comments = await db`
        SELECT 
          commentid, 
          content, 
          sendername, 
          sendermail, 
          senderurl,
          intime, 
          sortorder, 
          level, 
          parent, 
          admin, 
          deleted, 
          notify, 
          ip
        FROM int_comment 
        WHERE entryid = ${entryidNum} 
          AND deleted = 0
        ORDER BY sortorder ASC, level ASC, commentid ASC
      `;
    
      const processedComments = comments.map(c => ({
        commentid: Number(c.commentid),
        content: String(c.content),
        sendername: String(c.sendername),
        sendermail: String(c.sendermail ?? ''),
        senderurl: String(c.senderurl ?? ''),
        intime: String(c.intime),
        sortorder: Number(c.sortorder),
        level: Number(c.level),
        parent: Number(c.parent ?? 0),
        admin: Number(c.admin ?? 0),
        deleted: Number(c.deleted ?? 0),
      }));

      return {
        entryid: entryidNum,
        commentsEnabled: true,
        total: processedComments.length,
        comments: processedComments,
      };
    } catch (err) {
      console.error('DB Error in /api/comments:', err);
      set.status = 500;
      throw new Error('Ошибка сервера');
    }
  }, {
    response: t.Object({
      entryid: t.Number(),
      commentsEnabled: t.Boolean(),
      total: t.Number(),
      comments: t.Array(CommentSchema)
    }),
    detail: {
      tags: ['Comments'],
      summary: 'Получить комментари к записи'
    }
  });