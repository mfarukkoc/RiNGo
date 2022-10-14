const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getRandom,
  findRoom,
  createRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Chat Bot';

app.get('/:roomid', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

// static folder
app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', (socket) => {
  socket.on('createRoom', (roomName) => {
    const room = createRoom(roomName, '');
    socket.emit('roomCreated', room.id);
  });
  socket.on('joinRoom', ({ username, roomId }) => {
    const user = userJoin(socket.id, username, roomId, 'Unknown');
    if (user == -1) {
      socket.emit('noRoom');
    } else {
      socket.emit('joinSuccess');
    }
    socket.join(user.roomId);

    // broadcast to all clients except itself
    socket.broadcast
      .to(user.roomId)
      .emit(
        'message',
        formatMessage(botName, `${username} has joined the chat`)
      );
    // single client
    socket.emit(
      'message',
      formatMessage(
        botName,
        `Welcome to ${findRoom(user.roomId).name}, ${username} !`
      )
    );

    io.to(user.roomId).emit('roomUsers', {
      room: findRoom(user.roomId).name,
      roomId: user.roomId,
      users: getRoomUsers(user.roomId),
    });

    socket.on('random', () => {
      const user = getCurrentUser(socket.id);
      let result = getRandom(socket.id);
      let name = '';
      if (result['succes'] == true) {
        name = result.lucky.username;
        io.to(result.lucky.roomId).emit(
          'message',
          formatMessage(
            user.username + ' -> RiNGo',
            `${name} is the lucky one!`
          )
        );
      }
      io.emit('randomUser', { result, name });
    });

    socket.on('flipCoin', () => {
      const user = getCurrentUser(socket.id);
      const result = Math.random();
      io.to(user.roomId).emit(
        'coinFlipResult',
        formatMessage(user.username + ' -> RiNGo', result)
      );
    });

    socket.on('rollDice', () => {
      const user = getCurrentUser(socket.id);
      let result = Math.floor(Math.random() * 6.2) + 1;

      io.to(user.roomId).emit(
        'diceResult',
        formatMessage(user.username + ' -> RiNGo', result)
      );
    });

    // client disconnect
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        socket.broadcast
          .to(user.roomId)
          .emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat`)
          );
        io.to(user.roomId).emit('roomUsers', {
          room: findRoom(user.roomId).name,
          roomId: user.roomId,
          users: getRoomUsers(user.roomId),
        });
      }
    });

    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);
      // seperate self-message, broadcast-message
      socket.broadcast
        .to(user.roomId)
        .emit('message', formatMessage(user.username, msg));
      // everyone except itself
      socket.emit('message', formatMessage('You', msg));
    });
  });
});

const PORT = process.env.PORT || 3020;

server.listen(PORT, () => console.log(`Server listening port ${PORT}`));
