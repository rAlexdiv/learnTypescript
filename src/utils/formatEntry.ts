export interface RawEntry {
  entryid: number;
  subject: string;
  content_p: string;
  intime: string | number;
  keywordcache?: string;
  [key: string]: unknown;
}

export interface FormattedEntry {
  entryid: number;
  subject: string;
  content: string;
  intime: string;
  keywords: Array<{ word: string; unixword: string }>;
  dateComponents: {
    year: number | null;
    month: string;
    day: string;
  };
  breadcrumbsTitle: {title: string};
  [key: string]: unknown;
}

// Исправление путей к картинкам
export const fixImagePaths = (content: string): string => {
  if (!content) return content;
  return content.replace(
    /https?:\/\/plaintext\.ru\/entry\/(\d+)\/file\//gi,
    '/files/$1/'
  );
};

// Исправление ссылок на записи
export const fixPostLinks = (content: string): string => {
  if (!content) return content;
  return content.replace(
    /https?:\/\/plaintext\.ru\/(\d{4}\/\d{2}\/\d{2}\/[a-z0-9\-_]+)(?:\.html|\/)?/gi,
    '/$1'
  );
};

// Универсальная функция исправления всех путей
export const fixPaths = (content: string): string => {
  if (!content) return content;
  return fixPostLinks(fixImagePaths(content));
};

export const formatEntry = (entry: RawEntry, applyFixPath = true): FormattedEntry => {
  const timestamp = typeof entry.intime === 'string'
    ? parseInt(entry.intime, 10)
    : entry.intime;
  const date = !isNaN(timestamp) ? new Date(timestamp * 1000) : null;
  const dateComponents = {
    year: date?.getUTCFullYear() ?? null,
    month: date ? String(date.getUTCMonth() + 1).padStart(2, '0') : '01',
    day: date ? String(date.getUTCDate()).padStart(2, '0') : '01'
  };

  const breadcrumbsTitle = { title: entry.subject };

  const keywords: Array<{ word: string; unixword: string }> = [];
  const rawKeywords = entry.keywordcache?.trim();
  if (rawKeywords) {
    keywords.push(
      ...rawKeywords
        .split(',')
        .map(item => item.split('|'))
        .map(([word, unixword]) => ({
          word: (word ?? '').trim(),
          unixword: (unixword ?? '').trim()
        }))
    );
  }

  const content = entry.content_p ?? '';

  return {
    ...entry,
    intime: String(entry.intime), 
    content: applyFixPath ? fixPaths(content) : content,
    keywords,
    dateComponents,
    breadcrumbsTitle
  };
};