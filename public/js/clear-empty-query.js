const searchForm = document.getElementById('search-form')

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const inputs = searchForm.querySelectorAll('.input');
  const currentUrl = new URL(
    window.location.origin + searchForm.getAttribute('action'),
  );

  inputs.forEach((input) => {
    const name = input.name;
    const value = input.value.trim();

    if (value !== '') {
      currentUrl.searchParams.set(name, value);
    }
  });

  window.location.href = currentUrl.toString();
});

