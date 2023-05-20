const express = require("express");
const fs = require("fs");
const multer = require("multer");

const { Product } = require("../models/Product.js");

const { resetProducts } = require("../utils/resetProducts.js");
const { resetUsers } = require("../utils/resetUsers.js");
const { resetChats } = require("../utils/resetChats.js");

const { isAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({ dest: "public" });

// --------------------------------------------------------------------------------------------
// --------------------------------- ENDPOINTS DE /product ---------------------------------------
// --------------------------------------------------------------------------------------------

/*  Endpoint para recuperar todos los products de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

router.get("/", async (req, res, next) => {
  // Si funciona la lectura...
  try {
    // Recogemos las query params de esta manera req.query.parametro.
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const products = await Product.find() // Devolvemos los products si funciona. Con modelo.find().
      .populate(["owner", "buyer"])
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit); // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit.

    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el usuario:
    const totalElements = await Product.countDocuments(); //  Esperamos aque realice el conteo del número total de elementos con modelo.countDocuments()
    const totalPagesByLimit = Math.ceil(totalElements / limit); // Para saber el número total de páginas que se generan en función del limit. Math.ceil() nos elimina los decimales.

    // Respuesta Completa:
    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: products,
    };
    // Enviamos la respuesta como un json.
    res.json(response);

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

/* Ejemplo de REQ indicando que queremos la página 4 estableciendo un limite de 10 elementos
 por página (limit = 10 , pages = 4):
 http://localhost:3000/product?limit=10&page=4 */

//  ------------------------------------------------------------------------------------------

//  Endpoint para recuperar un product en concreto a través de su id ( modelo.findById()) (CRUD: READ):

router.get("/:id", async (req, res, next) => {
  // Si funciona la lectura...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const product = await Product.findById(id).populate(["owner", "buyer"]); //  Buscamos un product con un id determinado dentro de nuestro modelo con modelo.findById(id a buscar).
    if (product) {
      res.json(product); //  Si existe el product lo mandamos como respuesta en modo json.
    } else {
      res.status(404).json({}); //    Si no existe el product se manda un json vacio y un código 400.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/product/id del product a buscar

//  ------------------------------------------------------------------------------------------

//  Endpoint para buscar un product por el name ( modelo.findById({firstName: name})) (CRUD: Operación Custom. No es CRUD):

router.get("/name/:name", async (req, res, next) => {
  const name = req.params.name;
  // Si funciona la lectura...
  try {
    const product = await Product.find({ name: new RegExp("^" + name.toLowerCase(), "i") }).populate(["author", "publisher"]); //  Esperamos a que realice una busqueda en la que coincida el texto pasado por query params para la propiedad determinada pasada dentro de un objeto, porqué tenemos que pasar un objeto, sin importar mayusc o minusc.
    if (product?.length) {
      res.json(product); //  Si existe el product lo mandamos en la respuesta como un json.
    } else {
      res.status(404).json([]); //   Si no existe el product se manda un json con un array vacio porque la respuesta en caso de haber tenido resultados hubiera sido un array y un mandamos un código 404.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/product/name/titulo del libro a buscar

//  ------------------------------------------------------------------------------------------

//  Endpoint para añadir elementos (CRUD: CREATE):

router.post("/", isAuth, async (req, res, next) => {
  // Si funciona la escritura...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    const product = new Product(req.body); //     Un nuevo product es un nuevo modelo de la BBDD que tiene un Scheme que valida la estructura de esos datos que recoge del body de la petición.
    const createdProduct = await product.save(); // Esperamos a que guarde el nuevo product creado en caso de que vaya bien. Con el metodo .save().
    return res.status(201).json(createdProduct); // Devolvemos un código 201 que significa que algo se ha creado y el product creado en modo json.

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de POST para añadir un nuevo product (añadimos al body el nuevo product con sus propiedades que tiene que cumplir con el Scheme de nuestro modelo) identificado por su id:
 const newProduct = {name: "Prueba name", pages: 255}
 fetch("http://localhost:3000/product/",{"body": JSON.stringify(newProduct),"method":"POST","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data)) */

//  Endpoint para asociar una imágen a una user:
//  Hacemos uso del middleware que nos facilita multer para guardar la imágen en la carpeta de estáticos public.

router.post("/image-upload/:id", isAuth, upload.single("image"), async (req, res, next) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const imageFile = req.file;
    if (!imageFile) {
      throw new Error("No image file provided");
    }

    const originalname = req.file.originalname;
    const path = req.file.path;
    const newPath = path + "_" + originalname;
    fs.renameSync(path, newPath);
    // Move the uploaded file to the desired location

    // Add the image filename to the product's photos array
    product.photos.push(imageFile.filename);
    await product.save();

    res.json(product);
    console.log("Product modified successfully");
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos ejecutando cryptos:

router.delete("/reset", async (req, res, next) => {
  try {
    // La constante all recoge un boleano, si recogemos una query (all) y con valor (true), esta será true:
    const all = req.query.all === "true";

    // Si all es true resetearemos todos los datos de nuestras coleciones y las relaciones entre estas.
    if (all) {
      await resetUsers();
      await resetProducts();
      await resetChats();
      res.send("Datos reseteados y Relaciones reestablecidas");
    } else {
      await resetProducts();
      res.send("Datos Product reseteados");
    }
    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para eliminar product identificado por id (CRUD: DELETE):

router.delete("/:id", isAuth, async (req, res, next) => {
  // Si funciona el borrado...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }
    const productDeleted = await Product.findByIdAndDelete(id); // Esperamos a que nos devuelve la info del product eliminado que busca y elimina con el metodo findByIdAndDelete(id del product a eliminar).
    if (productDeleted) {
      res.json(productDeleted); //  Devolvemos el product eliminado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla el borrado...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo DELETE para eliminar un product  identificado por su id (no añadimos body a la busqueda y recogemos el id de los parametros de la ruta):

fetch("http://localhost:3000/product/id del product a borrar",{"method":"DELETE","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoint para actualizar un elemento identificado por id (CRUD: UPDATE):

router.put("/:id", isAuth, async (req, res, next) => {
  // Si funciona la actualización...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const productUpdated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Esperamos que devuelva la info del product actualizado al que tambien hemos pasado un objeto con los campos q tiene que acualizar en la req del body de la petición. {new: true} Le dice que nos mande el product actualizado no el antiguo. Lo busca y elimina con el metodo findByIdAndDelete(id del product a eliminar).
    if (productUpdated) {
      res.json(productUpdated); //  Devolvemos el product actualizado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla la actualización...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de PUT para actualizar datos concretos (en este caso el name) recogidos en el body,
de un product en concreto (recogemos el id de los parametros de la ruta ):

fetch("http://localhost:3000/product/id del product a actualizar",{"body": JSON.stringify({name:"El libro de las ilusiones."}),"method":"PUT","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

module.exports = { productRouter: router }; // Exportamos el router.
