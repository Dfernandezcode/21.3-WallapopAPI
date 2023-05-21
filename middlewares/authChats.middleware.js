const { Chat } = require("../models/Chat");
const { verifyToken } = require("../utils/token");

const isAuthForChats = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error({ error: "No tienes autorización para realizar esta operación" });
    }

    const decodedInfo = verifyToken(token);
    const idChat = req.params.id;

    const chat = await Chat.findById(idChat).populate(["buyer", "seller", "messages"]);
    if (!chat) {
      throw new Error("Chat no encontrado");
    }

    if (decodedInfo?.id !== chat?.buyer?.id && decodedInfo?.id !== chat?.seller?.id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    req.user = decodedInfo.id;
    req.chat = chat;
    next();
  } catch (error) {
    return res.status(401).json(error);
  }
};

module.exports = { isAuthForChats };
