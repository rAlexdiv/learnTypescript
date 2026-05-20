function addViews(current: number, newViews: number): number {
    return current + newViews;
};

const addViewsArrow = (current: number, newView: number): number => {
    return current + newView;
};

const addViewsShort = (current: number, newView: number): number => current * newView;

let result: number = addViews(12, 17);
console.log(result);

result = addViewsArrow(145, 17);
console.log(result);

result = addViewsShort(12, 17);
console.log(result);

const formatStatus = (isPublished: boolean, prefix: string = '|o|'): string => {
    return isPublished ? `"${prefix}" опубликована` : `"${prefix}" черновик`;
};

let text: string = formatStatus(true, 'Заголовок статьи');
console.log(text);

const getExcept = (text: string, maxLength?: number): string => {
    const limit = maxLength ?? 100;
    return text.length > limit ? text.slice(0, limit) + '...' : text; 
};
// maxLength?: number — ? — опцилнальный аргумет, может быть, может нет
// maxLength ?? 100 — ?? — если слева от вопросов null или undefined, бери справа

const toDisplay = getExcept(
`У лукоморья дуб зелёный;
Златая цепь на дубе том:
И днём и ночью кот учёный
Всё ходит по цепи кругом;
Идёт направо — песнь заводит,
Налево — сказку говорит.
Там чудеса: там леший бродит,
Русалка на ветвях сидит;
Там на неведомых дорожках
Следы невиданных зверей;
Избушка там на курьих ножках
Стоит без окон, без дверей;
Там лес и дол видений полны;
Там о заре прихлынут волны
На брег песчаный и пустой,
И тридцать витязей прекрасных
Чредой из вод выходят ясных,
И с ними дядька их морской;
Там королевич мимоходом
Пленяет грозного царя;
Там в облаках перед народом
Через леса, через моря
Колдун несёт богатыря;
В темнице там царевна тужит,
А бурый волк ей верно служит;
Там ступа с Бабою Ягой
Идёт, бредёт сама собой,
Там царь Кащей над златом чахнет;
Там русский дух… там Русью пахнет!
И там я был, и мёд я пил;
У моря видел дуб зелёный;
Под ним сидел, и кот учёный
Свои мне сказки говорил.
`, 50);
console.log(toDisplay);

const logEntry = (id: number): void => { 
    console.log(`Просомтрт записи #${id}`); 
};

logEntry(result);