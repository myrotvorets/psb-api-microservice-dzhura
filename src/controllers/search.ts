import { NextFunction, Request, Response, Router } from 'express';
import asyncWrapper from '@myrotvorets/express-async-middleware-wrapper';
import SearchService from '../services/search';

async function searchHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    const result = await SearchService.search(req.query.s as string);
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
}

export default function searchController(): Router {
    const router = Router();
    router.get('/search', asyncWrapper(searchHandler));
    return router;
}
