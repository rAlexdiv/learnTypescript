const getPostBadge = (isPublic: boolean, category: string = 'Без категории'): string => {
    return isPublic ? `🟢 Опубликовано в: ${category}` : '🟡 Черновик';
};

function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
};

console.log(getPostBadge(true, 'Технологии'));
console.log(getPostBadge(false));
console.log(calculateOffset(3, 10));