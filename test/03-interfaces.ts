interface Article {
  id: number;
  title: string;
  author: string;
  isDraft: boolean;
  views?: number;
}

const getArticleSummary = (article: Article): string => {
  return `Запись #${article.id}: "${article.title}" от ${article.author} | Статус: ${article.isDraft ? 'черновик' : 'опубликована'} | Просмотров: ${article.views ?? 0}`
};

const testArticle: Article = {
  id: 12,
  title: 'Первый интерфейс',
  author: 'rAlex',
  isDraft: true,
}

console.log(getArticleSummary(testArticle));