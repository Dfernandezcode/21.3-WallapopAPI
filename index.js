const express = require("express");

const { productRouter } = require("./routes/product.routes.js");
const { userRouter } = require("./routes/user.routes.js");
const { chatRouter } = require("./routes/chat.routes.js");
// const { chatRouter } = require("./routes/chat.routes.js");
// const { messageRouter } = require("./routes/message.routes.js");
const { connect } = require("./db.js");
const { checkError } = require("./middlewares/error.middleware.js");
const cors = require("cors");
const { infoReq } = require("./middlewares/infoReq.middleware.js");

const main = async () => {
  // Conexión a la BBDD
  const database = await connect();

  // Configuración del app
  const PORT = 3000;
  const app = express();
  app.use(express.json()); // server.use = app.use
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

  // Rutas
  const router = express.Router();
  router.get("/", (req, res) => {
    res.send(`Esta es la home de nuestra API. Conectados a la BBDD ${database.connection.name}`);
  });
  router.get("*", (req, res) => {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  });

  // Info de la req
  app.use(infoReq);

  // Usamos las rutas
  app.use("/product", productRouter);
  app.use("/user", userRouter);
  app.use("/chat", chatRouter);
  // app.use("/message", messageRouter);
  app.use("/public", express.static("public")); // use to upload vids and pics to :"Public" folder.
  app.use("/", router);

  app.use(checkError);

  app.listen(PORT, () => {
    console.log(`app levantado en el puerto ${PORT}`);
  });
};

main();
