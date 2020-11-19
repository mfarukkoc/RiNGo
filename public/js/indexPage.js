const createRoomForm = document.getElementById('create-room-form');

const socket = io();

createRoomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let userName = e.target.elements['username'].value.toString();
  let roomName = e.target.elements['room'].value.toString();
  console.log(roomName);
  sessionStorage.setItem('userName', userName);
  sessionStorage.setItem('autoJoin', true);
  socket.emit('createRoom', roomName);
});

socket.on('roomCreated', (id) => {
  window.location.href = id;
});
