// test/04-unions.ts
 
export interface Keyword {
    word: string; 
    slug: string; 
}

export const parseKeywordCache = (raw: string | null | undefined): Keyword[] => {
    if (!raw) return [];

    return raw.split(',').map(item => {
        const [word = '', slug = ''] = item.split('|').map(part => part.trim());
        return { word, slug };
    });
}