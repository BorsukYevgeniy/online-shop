const inputCartIdForm = document.getElementById('cartIdInputForm');

inputCartIdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const cartId = document.getElementById('cartIdInput').value;

  window.location.href = `/cart/${cartId}`;
});
