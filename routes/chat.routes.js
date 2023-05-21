// Importamos express:
const express = require("express");
// Importamos el modelo que nos sirve tanto para importar datos como para leerlos:
const { Chat } = require("../models/Chat.js");
// const { User } = require("../models/User.js");
// Importamos la función que nos sirve para resetear los chat:
const { resetChats } = require("../utils/resetChats.js");
// middleware
const { checkParams } = require("../middlewares/checkParams.middleware");
const { isAuth } = require("../middlewares/auth.middleware");
// Router propio de chat suministrado por express.Router:
const router = express.Router();
// Importamos Multer.
// const multer = require("multer");
// Import filesystem "fs"
// const fs = require("fs");

// --------------------------------------------------------------------------------------------
// --------------------------------- ENDPOINTS DE /chat ---------------------------------------
// --------------------------------------------------------------------------------------------
router.get("/", checkParams, async (req, res, next) => {
  // Si funciona la lectura...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    // if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
    //   return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    // }

    const { page, limit } = req.query;
    const chats = await Chat.find(id)
      .populate(["messages"]) // Devolvemos los chats si funciona. Con modelo.find().
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit); // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit. // Con populate le indicamos que si recoge un id en la propiedad señalada rellene con los campos de datos que contenga ese id
    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el chat:
    const totalElements = await Chat.countDocuments(); //  Esperamos aque realice el conteo del número total de elementos con modelo.countDocuments()
    const totalPagesByLimit = Math.ceil(totalElements / limit); // Para saber el número total de páginas que se generan en función del limit. Math.ceil() nos elimina los decimales.

    // Respuesta Completa:
    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: chats,
    };
    // Enviamos la respuesta como un json.
    res.json(response);

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// post de chats
router.post("/", isAuth, async (req, res, next) => {
  try {
    const { senderId, recipientId, message, product } = req.body;

    console.log("req.body:", req.body);
    console.log("product:", product);

    // Validate the required fields
    if (!senderId || !recipientId || !message || !product) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Get the seller information
    const seller = product.owner._id;

    // Create a new chat
    const chat = new Chat({ senderId, recipientId, message, product, seller });
    const createdChat = await chat.save();

    res.status(201).json(createdChat);
  } catch (error) {
    next(error);
  }
});

// reset de chats.
router.delete("/reset", async (req, res, next) => {
  try {
    // La constante all recoge un boleano, si recogemos una query (all) y con valor (true), esta será true:
    const all = req.query.all === "true";

    // Si all es true resetearemos todos los datos de nuestras coleciones y las relaciones entre estas.
    if (all) {
      await resetChats();
      res.send("Datos reseteados y Relaciones reestablecidas");
    } else {
      await resetChats();
      res.send("Chat reseteados");
    }
    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  // Si funciona el borrado...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    // if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
    //   return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    // }
    const chatDeleted = await Chat.findByIdAndDelete(id); // Esperamos a que nos devuelve la info del chat eliminado que busca y elimina con el metodo findByIdAndDelete(id del chat a eliminar).
    if (chatDeleted) {
      res.json(chatDeleted); //  Devolvemos el chat eliminado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla el borrado...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

module.exports = { chatRouter: router }; // Exportamos el router.
