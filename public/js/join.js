const chatform = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');
const usernameForm = document.getElementById('username-form');

// get username and room from url
const roomId = location.pathname.slice(1).toString();
const socket = io();
usernameForm.elements['username'].value = sessionStorage.getItem('userName');
usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let username = e.target.elements['username'].value;
  sessionStorage.setItem('userName', username);
  //join room
  socket.emit('joinRoom', { username, roomId });
  var elements = usernameForm.elements;
  socket.on('noRoom', () => {
    usernameForm.innerHTML =
      '<div class="text-center">Room Not Found <br /> Returning to Home Page</div>';
    setTimeout(() => (location.pathname = '/'), 2000);
  });

  document.getElementById('link').innerHTML = location.href;
  //#region hide elements after succesfull submit
  for (var i = 0, len = elements.length; i < len; ++i) {
    elements[i].disabled = true;
  }
  socket.on('joinSuccess', () =>
    document.getElementById('login-container').classList.add('join-animation')
  );

  //#endregion
});

setTimeout(() => {
  if (sessionStorage.getItem('autoJoin') === 'true') {
    usernameForm.elements[1].click();
    sessionStorage.setItem('autoJoin', false);
  }
}, 1);

socket.on('roomUsers', ({ room, roomId, users }) => {
  console.log(room);
  outputRoomName(room);
  outputUsers(users);
});

socket.on('message', (message) => {
  checkScrollnX(() => outputMessage(message));
});

socket.on('coinFlipResult', (message) => {
  checkScrollnX(() => outputCoinFlip(message));
});

socket.on('diceResult', (message) => {
  checkScrollnX(() => outputDice(message));
});

const checkScrollnX = (f) => {
  let bottom = false;
  if (
    chatMessages.scrollHeight - chatMessages.scrollTop ===
    chatMessages.clientHeight
  )
    bottom = true;
  f(); // execute the passed function
  if (bottom)
    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

chatform.addEventListener('submit', (e) => {
  e.preventDefault();

  // get text from form
  const msg = e.target.elements.msg.value;

  // emit message to server
  socket.emit('chatMessage', msg);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// output message to dom
const outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  if (message.username === 'You') {
    div.classList.add('self-end');
  }
  div.innerHTML = `<p class="msg-meta">${message.username}<span class="msg-time"> ${message.time}</span></p>
  <p class="msg-text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
};

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}

function outputRoomName(room) {
  roomName.innerText = room;
}

const drawRandom = document.getElementById('draw-random');
drawRandom.addEventListener('click', () => {
  socket.emit('random');
});

const outputCoinFlip = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="msg-meta"> ${message.username}<span class="msg-time"> ${message.time}</span></p>
  <div class="p-2">
  <div class="coin">
  <div class="side-a"></div>
  <div class="side-b"></div>
</div>
</div>`;
  document.querySelector('.chat-messages').appendChild(div);

  let x = document.querySelectorAll('.coin');
  x = x[x.length - 1];
  let flipResult = message.text;
  console.log(flipResult);
  setTimeout(function () {
    if (flipResult <= 0.5) {
      x.classList.add('heads');
    } else {
      x.classList.add('tails');
    }
  }, 100);
};

const flip = document.getElementById('flip-coin');
flip.addEventListener('click', () => {
  socket.emit('flipCoin');
});

const dice = document.getElementById('roll-dice');

dice.addEventListener('click', () => {
  socket.emit('rollDice');
});

const outputDice = (message) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="msg-meta"> ${message.username}<span class="msg-time"> ${message.time}</span></p>
  <div class="msg-text">Dice rolled with ${message.text}</div>`;
  document.querySelector('.chat-messages').appendChild(div);
};

function copy() {
  element = document.getElementById('link');
  var range, selection, worked;

  if (document.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  try {
    document.execCommand('copy');
    alert('text copied');
  } catch (err) {
    alert('unable to copy text');
  }
}
