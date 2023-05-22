const { User } = require("../models/User");
const { verifyToken } = require("../utils/token");

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error({ error: "No tienes autorización para realizar esta operación" });
    }

    const decodedInfo = verifyToken(token);
    const user = await User.findOne({ email: decodedInfo.email }).select("+password");
    if (!user) {
      throw new Error({ error: "No tienes autorización para realizar esta operación" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
  }
};

module.exports = { isAuth };
