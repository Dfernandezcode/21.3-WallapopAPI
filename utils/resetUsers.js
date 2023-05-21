const { User } = require("../models/User.js");

const userList = [
  {
    name: "RONALDO",
    email: "Ronaldo@gmail.com",
    password: "password0",
  },
  {
    name: "JOHN DOE",
    email: "johndoe@gmail.com",
    password: "password1",
  },
  {
    name: "JANE SMITH",
    email: "janesmith@gmail.com",
    password: "password2",
  },
  {
    name: "MICKEL JOHNSON",
    email: "michaeljohnson@gmail.com",
    password: "password3",
  },
  {
    name: "EMILY DAVIS",
    email: "emilydavis@gmail.com",
    password: "password4",
  },
  // Add more random names here
];

const resetUsers = async () => {
  try {
    await User.collection.drop();
    console.log("Users borrados correctamente");
    // Add
    const documents = userList.map((user) => new User(user));
    await User.insertMany(documents);
    console.log("Users creados correctamente!");
  } catch (error) {
    console.error("ERROR AL CONECTAR CON LA BBDD");
    console.error(error);
  }
};

module.exports = { resetUsers };
