const express = require("express");
const bcrypt = require("bcrypt");

const { User } = require("../models/User.js");
const { Product } = require("../models/Product.js");

const { isAuth } = require("../middlewares/auth.middleware");
const { checkParams } = require("../middlewares/checkParams.middleware");

const { generateToken } = require("../utils/token");
const { resetUsers } = require("../utils/resetUsers.js");

const router = express.Router();

// --------------------------------------------------------------------------------------------
// ------------------------------- ENDPOINTS DE /user ---------------------------------------
// --------------------------------------------------------------------------------------------

/*  Endpoint para recuperar todos los users de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

router.get("/", checkParams, async (req, res, next) => {
  // Si funciona la lectura...
  try {
    const { page, limit } = req.query;

    const users = await User.find() // Devolvemos los users si funciona. Con modelo.find().
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit); // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit. // Con populate le indicamos que si recoge un id en la propiedad señalada rellene con los campos de datos que contenga ese id
    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el user:

    const totalElements = await User.countDocuments(); //  Esperamos aque realice el conteo del número total de elementos con modelo.countDocuments()
    const totalPagesByLimit = Math.ceil(totalElements / limit); // Para saber el número total de páginas que se generan en función del limit. Math.ceil() nos elimina los decimales.

    // Respuesta Completa:
    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: users,
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
 http://localhost:3000/user?limit=10&page=4 */

//  ------------------------------------------------------------------------------------------

//  Endpoint para recuperar un user en concreto a través de su id ( modelo.findById()) (CRUD: READ):

router.get("/:id", async (req, res, next) => {
  // Si funciona la lectura...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const user = await User.findById(id); //  Buscamos un documentos con un id determinado dentro de nuestro modelo con modelo.findById(id a buscar).
    if (user) {
      const temporalUser = user.toObject();
      const includeProducts = req.query.includeProducts === "true";

      if (includeProducts) {
        const products = await Product.find({ owner: id });
        temporalUser.products = products;
      }
      res.json(temporalUser);
    } else {
      res.status(404).json({});
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/id del user a buscar

//  ------------------------------------------------------------------------------------------

//  Endpoint para buscar un user por el nombre ( modelo.findById({name: name})) (CRUD: Operación Custom. No es CRUD):

router.get("/name/:name", async (req, res, next) => {
  const userName = req.params.name;
  // Si funciona la lectura...
  try {
    // const user = await user.find({ firstName: name }); //Si quisieramos realizar una busqueda exacta, tal y como está escrito.
    const user = await User.find({ name: new RegExp("^" + userName.toUpperCase(), "i") }); // Devolvemos los books si funciona. Con modelo.find().

    //  Esperamos a que realice una busqueda en la que coincida el texto pasado por query params para la propiedad determinada pasada dentro de un objeto, porqué tenemos que pasar un objeto, sin importar mayusc o minusc.
    if (user) {
      res.json(user);
    } else {
      res.status(404).json([]); //   Si no existe el user se manda un json con un array vacio porque la respuesta en caso de haber tenido resultados hubiera sido un array y un mandamos un código 404.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/name/nombre del user a bususer

//  ------------------------------------------------------------------------------------------

//  Endpoint para añadir elementos (CRUD: CREATE):

router.post("/", async (req, res, next) => {
  // Si funciona la escritura...
  try {
    const user = req.body;
    user.name = user.name.toUpperCase(); //     Un nuevo user es un nuevo modelo de la BBDD que tiene un Scheme que valida la estructura de esos datos que recoge del body de la petición.
    const document = new User(user);
    const createdUser = await document.save(); // Esperamos a que guarde el nuevo user creado en caso de que vaya bien. Con el metodo .save().
    return res.status(201).json(createdUser); // Devolvemos un código 201 que significa que algo se ha creado y el user creado en modo json.

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de POST para añadir un nuevo user (añadimos al body el nuevo user con sus propiedades que tiene que cumplir con el Scheme de nuestro modelo) identificado por su id:
 const newUser = {name: "Prueba Nombre", country: "Prueba country"}
 fetch("http://localhost:3000/user/",{"body": JSON.stringify(newUser),"method":"POST","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data)) */

//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos de user:

router.delete("/reset", async (req, res, next) => {
  // Si funciona el reseteo...
  try {
    await resetUsers();
    res.send("Datos User reseteados");

    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para eliminar user identificado por id (CRUD: DELETE):

router.delete("/:id", isAuth, async (req, res, next) => {
  // Si funciona el borrado...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userDeleted = await User.findByIdAndDelete(id); // Esperamos a que nos devuelve la info del user eliminado que busca y elimina con el metodo findByIdAndDelete(id del user a eliminar).
    if (userDeleted) {
      res.json(userDeleted); //  Devolvemos el user eliminado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla el borrado...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo DELETE para eliminar un user (no añadimos body a la busqueda y recogemos el id de los parametros de la ruta) identificado por su id:

fetch("http://localhost:3000/user/id del user a borrar",{"method":"DELETE","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoint para actualizar un elemento identificado por id pasando antes por el middleware de auntetificación (CRUD: UPDATE):

router.put("/:id", isAuth, async (req, res, next) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userUpdated = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Esperamos que devuelva la info del user actualizado al que tambien hemos pasado un objeto con los campos q tiene que acualizar en la req del body de la petición. {new: true} Le dice que nos mande el user actualizado no el antiguo. Lo busca y elimina con el metodo findByIdAndDelete(id del user a eliminar).
    if (userUpdated) {
      Object.assign(userUpdated, req.body); //  Al userUpdate le pasamos las propiedades que vengan de req.body
      await userUpdated.save(); // Guardamos el usuario actualizado
      //  Quitamos password de la respuesta
      const userToSend = userUpdated.toObject();
      delete userToSend.password;
      res.json(userToSend); //  Devolvemos el autor actualizado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla la actualización...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de PUT para actualizar datos concretos (en este caso el tlf) recogidos en el body,
de un user en concreto (recogemos el id de los parametros de la ruta ):

fetch("http://localhost:3000/user/id del user a actualizar",{"body": JSON.stringify({country: "Prueba country"}),"method":"PUT","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoint para login de autors:

router.post("/login", async (req, res, next) => {
  // Si funciona la escritura...
  try {
    const { email, password } = req.body; // Recoge email y password del body de la req
    // Comprobamos que nos mandan el email y el autor.
    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" }); // Un return dentro de luna función hace que esa función no continue.
    }
    // Comprobamos que existe el autor
    const user = await User.findOne({ email }).select("+password"); // Le decimos que nos muestre la propiedad password que por defecto en el modelo viene con select: false.
    if (!user) {
      return res.status(401).json({ error: "Email y/o password incorrectos" });
    }
    // Comprobamos que la password que nos envian se corresponde con la que tiene el usuario.
    const match = bcrypt.compare(password, user.password); // compara el password encriptado con la password enviada sin encriptar.
    if (match) {
      // Quitamos password de la respuesta.
      const userWithoutPass = user.toObject(); // Nos devuelve esta entidad pero modificable.
      delete userWithoutPass.password; // delete elimina la propiedad de un objeto.

      // Generamos token jwt
      const jwtToken = generateToken(user._id, user.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o password incorrectos" }); // Código 401 para no autorizado
    }

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

// Exportamos
module.exports = { userRouter: router };
