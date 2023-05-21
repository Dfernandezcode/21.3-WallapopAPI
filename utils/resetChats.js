const { Chat } = require("../models/Chat.js");
const { Message } = require("../models/Message.js");
const { User } = require("../models/User.js");
const { Product } = require("../models/Product.js");

const resetChats = async () => {
  try {
    await Chat.collection.drop();
    console.log("Chats eliminados");

    const products = await Product.find({ buyer: { $exists: true } }).limit(2);
    if (!products.length) {
      console.error("No hay productos en la BBDD.");
      return;
    }

    const buyers = products.map((product) => product.buyer);
    const owners = products.map((product) => product.owner);

    const users = await User.find({
      _id: { $in: [...buyers, ...owners] },
    });
    if (!users.length) {
      console.error("No hay usuarios en la BBDD.");
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
        sender: users.find((user) => user._id.toString() === chat1.buyer.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat1.seller.toString())._id,
        message: "Hola, estoy interesado en comprar tu producto.",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat1.seller.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat1.buyer.toString())._id,
        message: "¡Hola! Claro, ¿en qué puedo ayudarte?",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat1.buyer.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat1.seller.toString())._id,
        message: "Eso que vendes me gusta",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat1.seller.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat1.buyer.toString())._id,
        message: "Es que está muy chulo",
      }),
    ];

    const mensajesChat2 = [
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat2.buyer.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat2.seller.toString())._id,
        message: "Me gusta tu producto, ¿está disponible?",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat2.seller.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat2.buyer.toString())._id,
        message: "Sí, aún está disponible. ¿Te gustaría comprarlo?",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat2.buyer.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat2.seller.toString())._id,
        message: "A cuánto me lo dejas?",
      }),
      new Message({
        date: new Date(),
        sender: users.find((user) => user._id.toString() === chat2.seller.toString())._id,
        reciever: users.find((user) => user._id.toString() === chat2.buyer.toString())._id,
        message: "Baratito, baratito...",
      }),
    ];

    // Guarda los mensajes en la base de datos
    const mensajesGuardadosChat1 = await Message.insertMany(mensajesChat1);
    const mensajesGuardadosChat2 = await Message.insertMany(mensajesChat2);

    // Asigna los mensajes a los chats
    chat1.messages = mensajesGuardadosChat1.map((mensaje) => mensaje._id);
    chat2.messages = mensajesGuardadosChat2.map((mensaje) => mensaje._id);

    // Guarda los chats en la base de datos
    await Promise.all([chat1.save(), chat2.save()]);

    console.log("Chats generados exitosamente.");
  } catch (error) {
    console.error("Error al generar los chats:", error);
  }
};

module.exports = { resetChats };
