/* istanbul ignore file */

import type { Config } from 'knex';
import { cleanEnv, num, str } from 'envalid';

export function buildKnexConfig(environment: NodeJS.Dict<string> = process.env): Config {
    const env = cleanEnv(
        environment,
        {
            NODE_ENV: str({ default: 'development' }),
            MYSQL_DATABASE: str(),
            MYSQL_HOST: str({ default: 'localhost' }),
            MYSQL_USER: str({ default: '' }),
            MYSQL_PASSWORD: str({ default: '' }),
            MYSQL_CONN_LIMIT: num({ default: 2 }),
        },
        {
            strict: true,
            dotEnvPath: null,
        },
    );

    return {
        client: 'mysql2',
        asyncStackTraces: env.NODE_ENV === 'development',
        connection: {
            database: env.MYSQL_DATABASE,
            host: env.MYSQL_HOST,
            user: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            dateStrings: true,
            charset: 'utf8mb4',
        },
        pool: {
            min: 0,
            max: env.MYSQL_CONN_LIMIT,
        },
        migrations: {
            tableName: 'knex_migrations_dzhura',
        },
    };
}
