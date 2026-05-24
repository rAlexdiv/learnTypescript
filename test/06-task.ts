const fetchEntry = (id: number): Promise<{ id: number, title: string }> => {
  return new Promise((resolve, reject) =>{
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, title: `Запись id: ${id}` })
      } else {
        reject(new Error('Запись не найдена'));
      }
    }, 5000);
  });
};

const timeout = (ms: number, message: string): Promise<never> => {
  return new Promise((_, reject) => { 
    setTimeout(() => reject(new Error(message)), ms);
  });
};


const loadEntry = async (id: number, timeoutMs = 7000): Promise<string> => {

  console.log('Загрузка...');

  try {
    const entry = await Promise.race([
      fetchEntry(id),
      timeout(timeoutMs, '🕘 Таймаут запроса'),
    ]);
    return `✅ Загружена: ${entry.title}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `❌ Ошибка: ${message}`;
  }
};

const main = async () => {
  console.log('Тест 1: быстрый ответ БД (таймаут 7,5 сек, БД 5 сек)');
  console.log(await loadEntry(1474, 7500)); 
  // ✅ Загружена: Запись #1474

  console.log('\nТест 2: ошибка БД (таймаут не сработает)');
  console.log(await loadEntry(-1, 7500));   
  // ❌ Ошибка: Запись не найдена

  console.log('\nТест 3: таймаут сработает (таймаут 3 сек, БД 5 сек)');
  console.log(await loadEntry(1474, 3000));  
  // ❌ Ошибка: Таймаут запроса
};

main();