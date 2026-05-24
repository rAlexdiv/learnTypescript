// test/05-modules.ts

import { parseKeywordCache, type Keyword } from "./04-unions.ts";

const data = 'Блог|blog,Технологии|tech,TypeScript|typescript';

const myTags: Keyword[] = parseKeywordCache(data);

console.log(myTags);
// console.log(parseKeywordCache(null));
// console.log(parseKeywordCache(''));