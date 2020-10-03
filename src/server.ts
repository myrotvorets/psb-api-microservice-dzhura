import express from 'express';
import knex from 'knex';
import { join } from 'path';
import { installOpenApiValidator } from '@myrotvorets/oav-installer';
import { errorMiddleware, notFoundMiddleware } from '@myrotvorets/express-microservice-middlewares';
import { createServer } from '@myrotvorets/create-server';
import morgan from 'morgan';

import { buildKnexConfig } from './knexfile';
import { environment } from './lib/environment';

import searchController from './controllers/search';
import monitoringController from './controllers/monitoring';

export async function configureApp(app: express.Express, db: knex): Promise<void> {
    const env = environment();

    await installOpenApiValidator(join(__dirname, 'specs', 'dzhura.yaml'), app, env.NODE_ENV);

    app.use('/', searchController(db));
    app.use('/', notFoundMiddleware);
    app.use(errorMiddleware);
}

/* istanbul ignore next */
export function setupApp(): express.Express {
    const app = express();
    app.set('strict routing', true);
    app.set('x-powered-by', false);

    app.use(
        morgan(
            '[PSBAPI-dzhura] :req[X-Request-ID]\t:method\t:url\t:status :res[content-length]\t:date[iso]\t:response-time\t:total-time',
        ),
    );

    return app;
}

/* istanbul ignore next */
export async function run(): Promise<void> {
    const env = environment();
    const app = setupApp();
    const db = knex(buildKnexConfig());

    app.use('/monitoring', monitoringController(db));

    await configureApp(app, db);

    const server = await createServer(app);
    server.listen(env.PORT);
}
