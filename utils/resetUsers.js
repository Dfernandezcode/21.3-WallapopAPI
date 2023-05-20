const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { User } = require("../models/User.js");

const userList = [
  {
    name: "Ronaldo",
    email: "Ronaldo@gmail.com",
    password: "password0",
  },
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    password: "password1",
  },
  {
    name: "Jane Smith",
    email: "janesmith@gmail.com",
    password: "password2",
  },
  {
    name: "Michael Johnson",
    email: "michaeljohnson@gmail.com",
    password: "password3",
  },
  {
    name: "Emily Davis",
    email: "emilydavis@gmail.com",
    password: "password4",
  },
  // Add more random names here
];

const userSeed = async () => {
  try {
    await connect();
    console.log("Tenemos conexión");

    // Borrar datos
    await User.collection.drop();
    console.log("Usuarios eliminados");

    // Añadimos usuarios
    const documents = userList.map((user) => new User(user));

    // await User.insertMany(documents);
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }

    console.log("Usuarios creados correctamente!");
  } catch (error) {
    console.error("ERROR AL CONECTAR CON LA BBDD");
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

userSeed();
