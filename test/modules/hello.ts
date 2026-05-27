import { Elysia, t } from 'elysia';

interface HelloResponse {
  message: string;
  lang: string;
  timestamp: number;
}

export const helloModule = new Elysia({ prefix: '/api' })
  
  .get('/hello', async ({ query }): Promise<HelloResponse> => {
    return {
      message: `Hello ${query.name} from Elysia with query!`,
      lang: query.lang, 
      timestamp: Math.floor(Date.now() / 1000),
    }
  }, {
    query: t.Object({
      name: t.String({ 
        minLength: 1, 
        maxLength: 64, 
        default: 'world',
      }),
      lang: t.Union([
          t.Literal('ru'),
          t.Literal('en'),
          t.Literal('es'),
          t.Literal('de'),
          t.Literal('fr'),
          t.Literal('uz'),
        ], 
        { 
          default: 'ru',
          description: 'Язык ответа (ISO 639-1 код)',
          examples: ['ru', 'en', 'de']
        }, 
      ),
    }),
    response: t.Object({
      message: t.String(),
      lang: t.String(),
      timestamp: t.Number(),
    }),
    detail: {
      tags: ['Demo'],
      summary: 'Hello by name from query'
    },
  })
  
  .get('/hello/:name', async ({ params }) => {
    return {
      message: `Hello ${params.name} from Elysia with params!`,
      timestamp: Math.floor(Date.now() / 1000),
    }
  }, {
    response: t.Object({
      message: t.String(),
      timestamp: t.Number(),
    }),
    detail: {
      tags: ['Demo'],
      summary: 'Hello by name from params',
    },
  });