import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { helloModule } from './modules/hello.ts';
import { entriesModule } from './modules/entries.ts'

const app = new Elysia()
  .use(swagger({ path: '/docs' }))
  .use(helloModule)
  .use(entriesModule)
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not found' };
    }
    set.status = 500
    return { error: 'Internal error' };
  });

  app.listen(3000);
  console.log('Server started on http://localhost:3000/docs');