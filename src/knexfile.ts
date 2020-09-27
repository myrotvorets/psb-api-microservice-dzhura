import type { Config } from 'knex';
import { cleanEnv, num, str } from 'envalid';

const env = cleanEnv(
    process.env,
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
    },
);

export function buildKnexConfig(): Config {
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

module.exports = {
    buildKnexConfig,
    [env.NODE_ENV]: buildKnexConfig(),
};
