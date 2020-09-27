import type knex from 'knex';
import { autoP, makeClickable } from '../lib/textutils';

interface Criminal {
    id: number;
    slug: string;
    name: string;
    nname: string;
    dob: string;
    country: string;
    address: string;
    description: string;
}

interface CriminalAttachment {
    id: number;
    att_id: number;
    path: string;
    mime_type: string;
}

export interface SearchItem {
    id: number;
    link: string;
    name: string;
    nname: string;
    dob?: string;
    country?: string;
    address?: string;
    description: string;
    thumbnail?: string;
}

export default class SearchService {
    private readonly db: knex;

    public constructor(db: knex) {
        this.db = db;
    }

    public async search(name: string): Promise<SearchItem[] | null> {
        const n = SearchService.prepareName(name);
        if (!n) {
            return null;
        }

        const rows = await this.searchQuery(n, 10);
        if (!rows.length) {
            return [];
        }

        const ids = rows.map((x) => x.id);
        const atts = await this.criminalAttachmentsQuery(ids);
        const thumbs = SearchService.getThumbnails(atts);
        const result: SearchItem[] = [];
        for (const item of rows) {
            const entry: SearchItem = {
                id: item.id,
                name: item.name,
                nname: item.nname,
                link: `https://myrotvorets.center/criminal/${item.slug}/`,
                description: autoP(makeClickable(item.description)),
            };

            if (item.dob !== '0000-00-00') {
                entry.dob = item.dob;
            }

            if (item.country) {
                entry.country = item.country;
            }

            if (item.address) {
                entry.address = item.address;
            }

            if (typeof thumbs[item.id] !== 'undefined') {
                entry.thumbnail = `https://psb4ukr.natocdn.net/${thumbs[item.id]}`;
            }

            result.push(entry);
        }

        return result;
    }

    private static prepareName(s: string): string | null {
        s = s.replace(/[^\p{L}]/gu, ' ');
        s = s.replace(/\s+/gu, ' ').trim().toLowerCase();

        const parts: string[] = [...new Set(s.split(' '))];
        if (parts.length < 2) {
            return null;
        }

        let name = `>"${s}"`;
        if (parts.length > 2) {
            name += ` "${parts[0]} ${parts[1]}"`;
        }

        parts[0] = `+${parts[0]}`;
        parts[1] = `+${parts[1]}`;
        name += ` ${parts.join(' ')}`;

        return name;
    }

    private searchQuery(s: string, n: number): knex.QueryBuilder<Criminal, Criminal[]> {
        return this.db
            .select('id', 'name', 'nname', 'dob', 'slug', 'country', 'address', 'description')
            .from<Criminal>('criminals')
            .where('active', 1)
            .andWhereRaw('MATCH (sname) AGAINST (? IN BOOLEAN MODE)', s)
            .orderByRaw(`MATCH (sname) AGAINST (? IN BOOLEAN MODE) DESC`, s)
            .limit(n);
    }

    private criminalAttachmentsQuery(ids: number[]): knex.QueryBuilder<CriminalAttachment, CriminalAttachment[]> {
        return this.db<CriminalAttachment>('criminal_attachments')
            .select('id', 'att_id', 'path', 'mime_type')
            .whereIn('id', ids)
            .andWhere('mime_type', 'LIKE', 'image/%')
            .orderBy(['id', 'sort_order']);
    }

    private static getThumbnails(atts: readonly CriminalAttachment[]): Record<number, string> {
        const result: Record<number, string> = {};

        for (const { id, path } of atts) {
            if (result[id] === undefined) {
                result[id] = path.replace(/(\.[a-z]+)$/u, '-150x150$1');
            }
        }

        return result;
    }
}
