const fetchEntry = (id: number): Promise<{ id: number, title: string }> => {
  return new Promise((resolve, reject) =>{
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, title: `Запись id: ${id}` })
      } else {
        reject(new Error('Запись не найдена'));
      }
    }, 1200);
  });
};

const loadEntry = async (id: number): Promise<string> => {

  try {
    const entry = await fetchEntry(id);
    return `✅ Загружена: ${entry.title}`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `❌ Ошибка: ${message}`;
  }
};

const main = async () => {
  console.log(await loadEntry(457));
  console.log(await loadEntry(-1));
  console.log(await loadEntry(0));
}

main();