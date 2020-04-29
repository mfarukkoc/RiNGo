const { createRoom, findRoom, destroyRoom } = require('./rooms');
const users = [];

function userJoin(id, username, roomId, roomName = '', create = false) {
  var room = findRoom(roomId);
  if (room.id === -1) {
    console.log(`couldnt find room with ${roomId}`);
    if (create === true) room = createRoom(roomName, id);
    else return -1;
  }
  if (room.owner == '') room.owner = id;
  const user = { id, username, roomId: room.id };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    let roomid = users[index].roomId;
    let roomUsers = getRoomUsers(roomid);
    if (roomUsers.length <= 1) {
      console.log(roomid + 'room destroyed');
      destroyRoom(roomid);
    } else {
      let room = findRoom(roomid);
      if (room.owner == id) {
        // set a random user owner, if owner leaves
        let x = getRandom(id, false);
        room.owner = x.lucky.id;
      }
    }
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(roomId) {
  return users.filter((user) => user.roomId === roomId);
}

function getRandom(id, includeSelf = true) {
  const room = getRoomUsers(getCurrentUser(id).roomId);
  let roll = room.slice();
  console.log(room);
  if (!includeSelf) {
    roll.splice(
      roll.findIndex((user) => user.id === id),
      1
    );
  }
  if (roll.length <= 0) {
    return { succes: false, lucky: -1 };
  }
  let lucky = Math.floor(Math.random() * roll.length);
  return { succes: true, lucky: roll[lucky] };
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getRandom,
  findRoom,
  createRoom,
};
