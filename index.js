const express = require("express");
const { productRouter } = require("./routes/product.routes.js");
const { userRouter } = require("./routes/user.routes.js");
// const { chatRouter } = require("./routes/chat.routes.js");
// const { messageRouter } = require("./routes/message.routes.js");
const { connect } = require("./db.js");
const cors = require("cors");
const { fileUploadRouter } = require("./routes/file-upload.routes.js");

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

  // Application Middlewares
  app.use((req, res, next) => {
    const date = new Date();
    console.log(`Petición de tipo ${req.method} a la url ${req.originalUrl} el ${date}`);
    next();
  });

  // Middleware - error management.
  // !! NOTE: ORDER OF PARAMETERS IS KEY.

  // Usamos las rutas
  app.use("/product", productRouter);
  app.use("/user", userRouter);
  // app.use("/chat", chatRouter);
  // app.use("/message", messageRouter);
  app.use("/public", express.static("public")); // use to upload vids and pics to :"Public" folder.
  app.use("/file-upload", fileUploadRouter); // use to create a function to allow upload of files.
  app.use("/", router);

  app.use((err, req, res, next) => {
    console.log("*** Start of Error ***");
    console.log(`REQUEST FAILED: ${req.method} of URL ${req.originalUrl}`);
    console.log(err);
    console.log("*** End of error ***");

    if (err?.name === "ValidationError") {
      res.status(400).json(err);
    } else if (err.errmsg.indexof("duplicate key") !== -1) {
      res.status(400).json(err);
    } else {
      res.status(500).json(err);
    }

    // res.status(500).send(err.stack); // stack indicates where the error occurred.
  });

  app.listen(PORT, () => {
    console.log(`app levantado en el puerto ${PORT}`);
  });
};

main();
