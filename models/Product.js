//  Importamos Mongoose
// Importamos Mongoose
const mongoose = require("mongoose");

// Declaramos nuestro esquema que nos permite declarar nuestros objetos y crearle restricciones.
const Schema = mongoose.Schema;

// Creamos el esquema del producto:
const productSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: [3, "Al menos tres letras para el nombre."],
      maxLength: [50, "Nombre demasiado largo, máximo de 50 caracteres."],
      required: true,
    },
    price: {
      type: Number,
      min: [0, "No puede costar menos de 0."],
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      minLength: [10, "Descripción demasiado corta, mínimo 10 caracteres."],
      maxLength: [50, "Descripción demasiado larga, máximo 50 caracteres."],
    },
    photos: {
      type: [{ type: String, required: true }],
      required: false,
    },
  },
  { timestamps: true } // Cada vez que se modifique un documento refleja la hora y fecha de modificación
);

// Creamos un modelo para que siempre que creamos un producto valide contra el esquema que hemos creado para ver si es válido.
const Product = mongoose.model("Product", productSchema);

// Exportamos el modelo para poder usarlo fuera.
module.exports = { Product };
