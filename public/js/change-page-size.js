const input = document.getElementById('pageSizeInput');

input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const newSize = input.value;

    if (newSize && parseInt(newSize) > 0) {
      const url = new URL(window.location.href);
      url.searchParams.set('pageSize', newSize);
      url.searchParams.set('page', '1');
      window.location.href = url.toString();
    }
  }
});
