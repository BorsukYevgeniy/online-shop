let page = 2; // перша сторінка вже завантажена

const btn = document.getElementById('loadCategories');
const select = document.getElementById('categories');

btn.addEventListener('click', async () => {
  try {
    const response = await fetch(`/api/categories?page=${page}`);

    const { categories } = await response.json();

    console.log(categories);

    if (categories.length === 0) {
      btn.disabled = true;
      btn.textContent = 'No more categories';
      return;
    }

    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });

    page++; // готуємось до наступного натискання
  } catch (err) {
    console.error('Помилка при завантаженні категорій:', err);
  }
});
