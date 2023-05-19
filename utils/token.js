//  Importamos jwt
const jwt = require("jsonwebtoken");

//  Cargamos variables de entorno
require("dotenv").config();

const generateToken = (id, email) => {
  // Comprueba si han mandado authorId o authorEmail
  if (!id || !email) {
    throw new Error("Email or authorId missing"); // Fuerza un nuevo error y salta al catch
  }

  const payload = {
    authorId: id,
    authorEmail: email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is missing");
  }
  const result = jwt.verify(token, process.env.JWT_SECRET);
  return result;
};

module.exports = { generateToken, verifyToken };
