const fetchFromDb = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const succsess = true;
      if (succsess) {
        resolve('Много разных данных из базы данных с задержкой в 2 секунды');
      } else {
        reject('Error DB')
      }
    }, 2000);
  });
};

const main = async () => {
  console.log('01 - Старт');
  
  try {
    const data = await fetchFromDb();
    console.log('02 - Данные получены:', data);
  } catch (err) {
    console.log('Error:', err);
  }  
  
  console.log('03 - The end')
};

main();
