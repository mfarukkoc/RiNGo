const shortid = require('shortid');
const rooms = [];

function createRoom(roomName, owner) {
  const id = shortid.generate();
  console.log(`Created room with ${id}`);
  const room = { name: roomName, owner, id };
  rooms.push(room);
  return room;
}

function findRoom(roomId) {
  const room = rooms.filter((room) => room.id == roomId);
  if (room.length == 0) return { name: '', owner: '', id: -1 };
  return room[0];
}

function destroyRoom(roomId) {
  const index = rooms.findIndex((room) => room.id === roomId);
  if (index !== -1) {
    return rooms.splice(index, 1)[0];
  }
}

module.exports = {
  createRoom,
  findRoom,
  destroyRoom,
};
