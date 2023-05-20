const express = require("express");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

const upload = multer({ dest: "public" }); // middleware que nos sirve para subir archivos a nuestra carpeta public en este caso.

router.post("/", upload.single("file"), (req, res, next) => {
  try {
    const originalname = req.file.originalname;
    const path = req.file.path;

    const newPath = path + "_" + originalname;

    fs.renameSync(path, newPath);

    res.send("Fichero subido correctamente");
    console.log("Fichero subido correctamente");
  } catch (error) {
    next(error);
  }
});

module.exports = { fileUploadRouter: router };
