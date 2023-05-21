const { Product } = require("../models/Product");
const { verifyToken } = require("../utils/token");

const isAuthForProducts = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error({ error: "No tienes autorización para realizar esta operación" });
    }

    const decodedInfo = verifyToken(token);
    const idProduct = req.params.id;

    const product = await Product.findById(idProduct).populate("owner");
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    if (decodedInfo?.id !== product?.owner?.id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    req.product = product;
    next();
  } catch (error) {
    return res.status(401).json(error);
  }
};

module.exports = { isAuthForProducts };
