const entryId: number = 1478;
const title: string = 'First title of first entry';
const viewCount: number = 0;
const isPublic: boolean = false;
const keywords: string[] = [ 'blog', 'web', 'typescript' ];

console.log(`Запись #${entryId} "${title}", просмотры: ${viewCount}, публичная: ${isPublic ? 'да' : 'нет'}, тэги: [${keywords.join(', ')}]`);
