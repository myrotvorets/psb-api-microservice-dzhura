import express from 'express';
import request from 'supertest';
import { configureApp } from '../../../src/server';

const env = { ...process.env };
let app: express.Express;

process.env = {
    ...process.env,
    MYSQL_DATABASE: 'fake',
};

async function buildApp(): Promise<express.Express> {
    const app = express();
    await configureApp(app);
    return app;
}

beforeAll((done) => {
    buildApp()
        .then((application) => {
            app = application;
            done();
        })
        .catch((e: Error) => {
            done.fail(e);
        });
});

afterAll(() => {
    process.env = { ...env };
});

describe('SearchController', () => {
    describe('Error Handling', () => {
        it('should fail the request without s parameter', () => {
            return request(app)
                .get('/search')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        it('should fail the request on an empty s', () => {
            return request(app)
                .get('/search?s=')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        it('should fail the request if s is not URL-encoded', () => {
            return request(app)
                .get('/search?s=test+test')
                .expect(400)
                .expect(/"code":"BAD_REQUEST"/u);
        });

        it.each([['Medvedev'], ['Medvedev Medvedev'], ['Putin #@Putin'], ['Putin %21%40%23%24%25%5E%26']])(
            'should fail the request if s is invalid (%s)',
            (param: string) => {
                return request(app)
                    .get(`/search?s=${param}`)
                    .expect(400)
                    .expect(/"code":"BAD_SEARCH_TERM"/u);
            },
        );

        it('should return a 404 on non-existing URLs', () => {
            return request(app).get('/admin').expect(404);
        });

        it.each<['post' | 'put' | 'head' | 'delete' | 'patch' | 'options']>([
            ['post'],
            ['put'],
            ['head'],
            ['delete'],
            ['patch'],
            ['options'],
        ])('should return a 405 on disallowed methods (%s)', (method) => {
            return request(app)[method]('/search').expect(405);
        });
    });
});
