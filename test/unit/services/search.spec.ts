import SearchService from '../../../src/services/search';

class MySearchService extends SearchService {
    public static testPrepareName(name: string): string | null {
        return SearchService.prepareName(name);
    }
}

describe('SearchService', () => {
    describe('prepareName', () => {
        const tester = (input: string, expected: string | null): void => {
            const actual = MySearchService.testPrepareName(input);
            expect(actual).toBe(expected);
        };

        const table1: [string, string | null][] = [
            ['путинхуйло', null],
            ['путин путин', null],
            ['Путин путин', null],
            ['Путин  путин ', null],
            ['Путин@ #путин ', null],
            ['@@@ ### $$$', null],
        ];

        it.each(table1)('should discard names having less than two unique lexemes (%s)', tester);

        const table2: [string, string][] = [
            ['пУтин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин путин владимир', '>"путин владимир" +путин +владимир'],
            ['Путин@ #владимир ', '>"путин владимир" +путин +владимир'],
            ['путин-хуйло', '>"путин хуйло" +путин +хуйло'],
        ];

        it.each(table2)('should correctly handle names with two lexemes (%s => %s)', tester);

        const table3: [string, string][] = [
            [
                'пУтин владимир владимирович',
                '>"путин владимир владимирович" "путин владимир" +путин +владимир владимирович',
            ],
            [
                'Путин-Хуйло Вальдемар Вальдемарович',
                '>"путин хуйло вальдемар вальдемарович" "путин хуйло" +путин +хуйло вальдемар вальдемарович',
            ],
        ];

        it.each(table3)('should correctly handle names with more than two lexemes (%s => %s)', tester);
    });
});
