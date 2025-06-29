const socket = io();

const chatId = parseInt(document.getElementById('chatId').value);
const userId = parseInt(document.getElementById('userId').value);

// Joining to the room
socket.emit('joinChat', chatId);

// Updating message
socket.on('chatUpdateMessage', (newMsg) => {
  const msg = document.getElementById(`message-${newMsg.id}`);
  if (msg) {
    const textElement = msg.querySelector('.text');

    if (textElement) {
      textElement.textContent = newMsg.text;
    }
  }
});

// Deleting message
socket.on('chatDeleteMessage', (msg) => {
  const msgElement = document.getElementById(`message-${msg.id}`);

  if (msgElement) {
    msgElement.remove();
  }
});

// Emitting `deleteMessage` if delete button was pressed
document.querySelectorAll('.deleteButton').forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();

    //Getting id from button element
    const messageId = button.id.split('-')[1];

    console.log(button);

    socket.emit('deleteMessage', {
      id: parseInt(messageId),
      chatId,
    });
  });
});

// Emitting `updateMessage` if update button was pressed
document.querySelectorAll('.updateButton').forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();

    //Getting id from button element
    const messageId = button.id.split('-')[1];
    const newText = prompt('Enter new text:');

    if (!newText || newText.trim() === '') return;

    socket.emit('updateMessage', {
      id: parseInt(messageId),
      chatId,
      text: newText.trim(),
    });
  });
});

// Rendering new messages
socket.on('chatMessage', (msg) => {
  // Creating new messages

  const div = document.createElement('div');
  div.classList.add('message');
  div.id = `message-${msg.id}`;

  const sender = document.createElement('p');
  sender.classList.add('sender');
  sender.textContent = `${msg.user.nickname}:`;

  const text = document.createElement('p');
  text.classList.add('text');
  text.textContent = msg.text;

  div.appendChild(sender);
  div.appendChild(text);

  if (userId === msg.userId) {
    // Adding delete and update buttons to the message

    const updateButton = document.createElement('button');
    updateButton.id = `updateButton-${msg.id}`;
    updateButton.classList.add('updateButton');
    updateButton.textContent = 'Update';
    updateButton.style.marginRight = '3px';

    const deleteButton = document.createElement('button');
    deleteButton.id = `deleteButton-${msg.id}`;
    deleteButton.classList.add('deleteButton');
    deleteButton.textContent = 'delete';

    // Emitting `updateMessage` if update button was pressed
    updateButton.addEventListener('click', (e) => {
      e.preventDefault();

      const newText = prompt('Enter new text:');

      if (!newText || newText.trim() === '') return;

      socket.emit('updateMessage', {
        id: parseInt(msg.id),
        chatId,
        text: newText.trim(),
      });
    });

    // Emitting `deleteMessage` if delete button was pressed
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      socket.emit('deleteMessage', {
        id: parseInt(msg.id),
        chatId,
      });
    });

    div.appendChild(document.createElement('br'));
    div.appendChild(updateButton);
    div.appendChild(deleteButton);
  }

  document.getElementById('messages').appendChild(div);
});

// Emitting `sendMessage` if crete button was pressed
document.getElementById('sendForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const input = document.getElementById('messageInput');
  const text = input.value.trim();

  if (!text) return;

  socket.emit('sendMessage', {
    chatId,
    userId,
    text,
  });

  input.value = '';
});
