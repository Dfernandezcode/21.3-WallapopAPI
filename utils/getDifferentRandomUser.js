const { generateRandom } = require("./generateRandom.js");

const getDifferentRandomUser = (ownerId, users) => {
  const filteredUsers = users.filter((user) => user._id.toString() !== ownerId.toString());
  return filteredUsers[generateRandom(0, filteredUsers.length - 1)];
};

module.exports = { getDifferentRandomUser };
