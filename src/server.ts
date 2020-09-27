import express from 'express';
import knex from 'knex';
import { join } from 'path';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { findEnv } from '@myrotvorets/findenv';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { createServer } from '@myrotvorets/create-server';
import morgan from 'morgan';

import { buildKnexConfig } from './knexfile';
import { environment } from './lib/environment';

import searchController from './controllers/search';

(async function (): Promise<unknown> {
    const env = environment(await findEnv());

    const app = express();
    app.set('strict routing', true);
    app.set('x-powered-by', false);

    const db = knex(buildKnexConfig());
    const server = await createServer(app);

    app.use(
        morgan(
            '[PSBAPI-dzhura] :req[X-Request-ID]\t:method\t:url\t:status :res[content-length]\t:date[iso]\t:response-time\t:total-time',
        ),
    );

    await installOpenApiValidator(join(__dirname, 'specs', 'dzhura.yaml'), app, env.NODE_ENV);

    app.use('/', searchController(db));
    app.use('/', notFoundMiddleware);
    app.use(errorMiddleware);

    return server.listen(env.PORT);
})().catch((e) => console.error(e));
