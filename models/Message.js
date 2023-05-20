const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      ref: "Messages",
      required: true,
      trim: true,
      minLength: [3, "El mensaje deberia tener un minimo de 3 caracteres."],
      maxLength: [250, "Mensaje demasiado largo, maximo 250 caracteres."],
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
