const mongoose = require("mongoose");
const { Product } = require("../models/Product.js");
const { connect } = require("../db.js");

/*
    - Product name
    - Price
    - Description
    - Photos
    - Buyer => User
    - Seller => User
*/

const productList = [
  { productName: "Jersey Zara L", price: "€20", description: "negro con lineas azules" },
  { productName: "T-Shirt Adidas M", price: "€15", description: "blanca con logo negro" },
  { productName: "Jeans Levi's 501", price: "€50", description: "azul oscuro, estilo recto" },
  { productName: "Sneakers Nike Air Max", price: "€100", description: "negro con suela blanca" },
  { productName: "Dress H&M", price: "€30", description: "estampado floral, estilo camisero" },
  { productName: "Watch Casio", price: "€50", description: "correa de acero inoxidable, color plateado" },
  { productName: "Backpack Eastpak", price: "€40", description: "negra, con múltiples compartimentos" },
  { productName: "Sunglasses Ray-Ban", price: "€80", description: "montura de metal dorado, lentes polarizadas" },
  { productName: "Perfume Chanel No.5", price: "€120", description: "fragancia clásica y elegante" },
  { productName: "Wallet Tommy Hilfiger", price: "€35", description: "cuero marrón, múltiples ranuras para tarjetas" },
  { productName: "Earrings Swarovski", price: "€60", description: "pendientes de cristal con forma de gota" },
];

const productSeed = async () => {
  try {
    await connect();
    console.log("Tenemos conexión");

    // Borrar datos
    await Product.collection.drop();
    console.log("Productos eliminados");

    // Añadimos Productos
    const documents = productList.map((product) => new Product(product));

    // await Product.insertMany(documents);
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }

    console.log("Productos creados correctamente!");
  } catch (error) {
    console.error("ERROR AL CONECTAR CON LA BBDD");
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

productSeed();

// find all products.
// for-loop productList and add random owner to every product.
