const { Chat } = require("../models/Chat.js");
const { Message } = require("../models/Message.js");
const { User } = require("../models/User.js");
const { Product } = require("../models/Product.js");

const resetChats = async () => {
  try {
    const products = await Product.find({ buyer: { $exists: true } }).limit(2);
    if (!products.length) {
      console.error("No hay products en la BBDD.");
      return;
    }

    const users = await User.find({
      _id: { $in: [products[0].buyer, products[0].owner, products[1].buyer, products[1].owner] },
    });
    if (!users.length) {
      console.error("No hay users en la BBDD.");
      return;
    }

    // Crea dos chats:
    const chat1 = new Chat({
      buyer: products[0].buyer,
      seller: products[0].owner,
      product: products[0]._id,
    });

    const chat2 = new Chat({
      buyer: products[1].buyer,
      seller: products[1].owner,
      product: products[1]._id,
    });

    const mensajesChat1 = [
      new Message({
        date: new Date(),
        sender: users[0]._id,
        receiver: users[1]._id,
        message: "Hola, estoy interesado en comprar tu producto.",
      }),
      new Message({
        date: new Date(),
        sender: users[1]._id,
        receiver: users[0]._id,
        message: "¡Hola! Claro, ¿en qué puedo ayudarte?",
      }),
      new Message({
        date: new Date(),
        sender: users[0]._id,
        receiver: users[1]._id,
        message: "Eso que vendes me gusta",
      }),
      new Message({
        date: new Date(),
        sender: users[1]._id,
        receiver: users[0]._id,
        message: "Es que está muy chulo",
      }),
    ];

    const mensajesChat2 = [
      new Message({
        date: new Date(),
        sender: users[2]._id,
        receiver: users[3]._id,
        message: "Me gusta tu producto, ¿está disponible?",
      }),
      new Message({
        date: new Date(),
        sender: users[3]._id,
        receiver: users[2]._id,
        message: "Sí, aún está disponible. ¿Te gustaría comprarlo?",
      }),
      new Message({
        date: new Date(),
        sender: users[2]._id,
        receiver: users[3]._id,
        message: "A cuánto me lo dejas?",
      }),
      new Message({
        date: new Date(),
        sender: users[3]._id,
        receiver: users[2]._id,
        message: "Baratito, baratito...",
      }),
    ];

    // Guarda los mensajes en la base de datos
    const mensajesGuardadosChat1 = await Message.create(mensajesChat1);
    const mensajesGuardadosChat2 = await Message.create(mensajesChat2);

    // Asigna los mensajes a los chats
    chat1.messages = mensajesGuardadosChat1;
    chat2.messages = mensajesGuardadosChat2;

    // Guarda los chats en la base de datos
    await Promise.all([chat1.save(), chat2.save()]);

    console.log("Chats generados exitosamente.");
  } catch (error) {
    console.error("Error al generar los chats:", error);
  }
};

module.exports = { resetChats };
