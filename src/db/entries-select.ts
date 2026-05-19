import { db } from '../db/index.ts';

export const entriesSelect = db`
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
`;