import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import type knex from 'knex';
import asyncWrapper from '@myrotvorets/express-async-middleware-wrapper';
import SearchService from '../services/search';

function searchHandler(searchService: SearchService): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const result = await searchService.search(req.query.s as string);
        if (result === null) {
            next({
                success: false,
                status: 400,
                code: 'BAD_SEARCH_TERM',
                message: 'Both surname and name are required',
            });
        } else {
            res.json({
                success: true,
                items: result,
            });
        }
    };
}

export default function (db: knex): Router {
    const router = Router();
    const service = new SearchService(db);

    router.get('/search', asyncWrapper(searchHandler(service)));
    return router;
}
