const { Product } = require("../models/Product.js");
const { User } = require("../models/User.js");

const { generateRandom } = require("../utils/generateRandom.js");

const productList = [
  { name: "Jersey Zara L", price: 20, description: "negro con lineas azules" },
  { name: "T-Shirt Adidas M", price: 15, description: "blanca con logo negro" },
  { name: "Jeans Levi's 501", price: 50, description: "azul oscuro, estilo recto" },
  { name: "Sneakers Nike Air Max", price: 100, description: "negro con suela blanca" },
  { name: "Dress H&M", price: 30, description: "estampado floral, estilo camisero" },
  { name: "Watch Casio", price: 50, description: "correa de acero inoxidable, color plateado" },
  { name: "Backpack Eastpak", price: 40, description: "negra, con múltiples compartimentos" },
  { name: "Sunglasses Ray-Ban", price: 80, description: "montura de metal dorado, lentes polarizadas" },
  { name: "Perfume Chanel No.5", price: 120, description: "fragancia clásica y elegante" },
  { name: "Wallet Tommy Hilfiger", price: 35, description: "cuero marrón, múltiples ranuras para tarjetas" },
  { name: "Earrings Swarovski", price: 60, description: "pendientes de cristal con forma de gota" },
];

const resetProducts = async () => {
  try {
    // Borrar datos
    await Product.collection.drop();
    console.log("Productos eliminados");

    const users = await User.find();
    if (!users.length) {
      console.error("No hay users en la BBDD.");
      return;
    }

    for (let i = 0; i < productList.length; i++) {
      const product = productList[i];
      product.owner = users[generateRandom(0, users.length - 1)]._id;
      console.log(product.owner);
      const document = new Product(product);
      await document.save();
    }

    // Añadimos Productos
    const documents = productList.map((product) => new Product(product));
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }
    console.log("Productos creados correctamente!");
  } catch (error) {
    console.error("ERROR AL CONECTAR CON LA BBDD");
    console.error(error);
  }
};

module.exports = { resetProducts };
