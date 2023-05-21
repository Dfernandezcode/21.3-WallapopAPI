const express = require("express");

const { Chat } = require("../models/Chat.js");
const { Message } = require("../models/Message.js");
const { Product } = require("../models/Product.js");

const { checkParams } = require("../middlewares/checkParams.middleware");
const { isAuthForChats } = require("../middlewares/authChats.middleware");
const { isAuth } = require("../middlewares/auth.middleware.js");

const { resetChats } = require("../utils/resetChats.js");

const router = express.Router();

// --------------------------------------------------------------------------------------------
// --------------------------------- ENDPOINTS DE /chat ---------------------------------------
// --------------------------------------------------------------------------------------------

/*  Endpoint para recuperar todos los users de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

router.get("/", checkParams, async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const chats = await Chat.find()
      .populate(["messages", "seller", "buyer", "product"])
      .limit(limit)
      .skip((page - 1) * limit);

    const totalElements = await Chat.countDocuments();
    const totalPagesByLimit = Math.ceil(totalElements / limit);

    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: chats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para recuperar un chat en concreto a través de su id ( modelo.findById()) (CRUD: READ):

router.get("/:id", async (req, res, next) => {
  try {
    const idChat = req.params.id;
    const chat = await Chat.findById(idChat).populate(["messages", "seller", "buyer", "product"]);
    if (chat) {
      res.json(chat);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/chat/id del chat a buscar

//  ------------------------------------------------------------------------------------------

//  Endpoint para añadir elementos (CRUD: CREATE):

router.post("/:id", isAuth, async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const product = await Product.findById(productId);

    if (product) {
      const seller = product.owner;
      const buyer = req.user.id;

      const message = {
        date: new Date(),
        message: req.body.newMessage,
        sender: buyer,
        reciever: seller,
      };

      const newMessage = new Message(message);
      await newMessage.save();
      const messages = [newMessage.id];

      const chat = {
        product,
        seller,
        buyer,
        messages,
      };

      const document = new Chat(chat);
      await document.save();
      res.status(201).json(document);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos de chat:

router.delete("/reset", async (req, res, next) => {
  try {
    await resetChats();
    res.send("Datos reseteados y Relaciones reestablecidas");
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para eliminar chat identificado por id (CRUD: DELETE):

router.delete("/:id", isAuthForChats, async (req, res, next) => {
  try {
    const chat = req.chat;

    const chatDeleted = await Chat.findByIdAndDelete(chat.id).populate(["buyer", "seller", "messages"]);

    if (chatDeleted) {
      res.json(chatDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para actualizar un elemento añadiendo un nuevo mensaje al chat identificado por id pasando antes por el middleware de auntetificación (CRUD: UPDATE):

router.put("/:id", isAuthForChats, async (req, res, next) => {
  try {
    const chat = req.chat;
    const user = req.user;

    const reciever = user.id === chat.seller.id ? chat.buyer.id : chat.seller.id;

    const newMessage = {
      date: new Date(),
      sender: user,
      reciever,
      message: req.body.newMessage,
    };

    const document = new Message(newMessage);
    await document.save();
    chat.messages.push(document.id);

    const chatToUpdate = await Chat.findById(chat.id).populate(["buyer", "seller", "messages"]);

    if (chatToUpdate) {
      Object.assign(chatToUpdate, chat);
      await chatToUpdate.save();
      res.json(chatToUpdate);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

module.exports = { chatRouter: router }; // Exportamos el router.
