const inputChatIdForm = document.getElementById('chatIdInputForm');

inputChatIdForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const chatId = document.getElementById('chatIdInput').value;

  window.location.href = `/chats/${chatId}/messages`;
});