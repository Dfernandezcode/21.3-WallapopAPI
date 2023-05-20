// Importamos express:
const express = require("express");

// Importamos el modelo que nos sirve tanto para importar datos como para leerlos:
const { User } = require("../models/User.js");

// Importamos la función que nos sirve para resetear los users:
const { resetUsers } = require("../utils/resetUsers.js");

// Importamos la función que nos sirve para resetear las relaciones entre las coleciones
// Router propio de user suministrado por express.Router:
const router = express.Router();

// --------------------------------------------------------------------------------------------
// --------------------------------- ENDPOINTS DE /user ---------------------------------------
// --------------------------------------------------------------------------------------------

/*  Endpoint para recuperar todos los users de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

router.get("/", async (req, res, next) => {
  // Si funciona la lectura...
  try {
    // Recogemos las query params de esta manera req.query.parametro.
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const users = await User.find() // Devolvemos los users si funciona. Con modelo.find().
      .populate(["owner", "buyer"])
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit); // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit.

    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el usuario:
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
    const user = await User.findById(id).populate(["owner", "buyer"]); //  Buscamos un user con un id determinado dentro de nuestro modelo con modelo.findById(id a buscar).
    if (user) {
      res.json(user); //  Si existe el user lo mandamos como respuesta en modo json.
    } else {
      res.status(404).json({}); //    Si no existe el user se manda un json vacio y un código 400.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/id del user a buscar

//  ------------------------------------------------------------------------------------------

//  Endpoint para buscar un user por el name ( modelo.findById({firstName: name})) (CRUD: Operación Custom. No es CRUD):

router.get("/name/:name", async (req, res, next) => {
  const name = req.params.name;
  // Si funciona la lectura...
  try {
    const user = await User.find({ name: new RegExp("^" + name.toLowerCase(), "i") }).populate(["author", "publisher"]); //  Esperamos a que realice una busqueda en la que coincida el texto pasado por query params para la propiedad determinada pasada dentro de un objeto, porqué tenemos que pasar un objeto, sin importar mayusc o minusc.
    if (user?.length) {
      res.json(user); //  Si existe el user lo mandamos en la respuesta como un json.
    } else {
      res.status(404).json([]); //   Si no existe el user se manda un json con un array vacio porque la respuesta en caso de haber tenido resultados hubiera sido un array y un mandamos un código 404.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Endpoint para buscar user por email.
router.get("/email/:email", async (req, res, next) => {
  const email = req.params.email;
  // Si funciona la lectura...
  try {
    const user = await User.find({ email: new RegExp("^" + email.toLowerCase(), "i") }).populate(["author", "publisher"]); //  Esperamos a que realice una busqueda en la que coincida el texto pasado por query params para la propiedad determinada pasada dentro de un objeto, porqué tenemos que pasar un objeto, sin importar mayusc o minusc.
    if (user?.length) {
      res.json(user);
    } else {
      res.status(404).json([]);
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para añadir elementos (CRUD: CREATE):

router.post("/", async (req, res, next) => {
  // Si funciona la escritura...
  try {
    const user = new User(req.body); //     Un nuevo user es un nuevo modelo de la BBDD que tiene un Scheme que valida la estructura de esos datos que recoge del body de la petición.
    const createdUser = await user.save(); // Esperamos a que guarde el nuevo user creado en caso de que vaya bien. Con el metodo .save().
    return res.status(201).json(createdUser); // Devolvemos un código 201 que significa que algo se ha creado y el user creado en modo json.

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de POST para añadir un nuevo user (añadimos al body el nuevo user con sus propiedades que tiene que cumplir con el Scheme de nuestro modelo) identificado por su id:
 const newUser = {name: "Prueba name", pages: 255}
 fetch("http://localhost:3000/user/",{"body": JSON.stringify(newUser),"method":"POST","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data)) */

//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos ejecutando cryptos:

router.delete("/reset", async (req, res, next) => {
  try {
    // La constante all recoge un boleano, si recogemos una query (all) y con valor (true), esta será true:
    const all = req.query.all === "true";

    // Si all es true resetearemos todos los datos de nuestras coleciones y las relaciones entre estas.
    if (all) {
      await resetUsers();
      await resetUsers();
      res.send("Datos reseteados y Relaciones reestablecidas");
    } else {
      await resetUsers();
      res.send("Datos User reseteados");
    }
    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para eliminar user identificado por id (CRUD: DELETE):

router.delete("/:id", async (req, res, next) => {
  // Si funciona el borrado...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
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

/* Petición tipo DELETE para eliminar un user  identificado por su id (no añadimos body a la busqueda y recogemos el id de los parametros de la ruta):

fetch("http://localhost:3000/user/id del user a borrar",{"method":"DELETE","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoint para actualizar un elemento identificado por id (CRUD: UPDATE):

router.put("/:id", async (req, res, next) => {
  // Si funciona la actualización...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const userUpdated = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Esperamos que devuelva la info del user actualizado al que tambien hemos pasado un objeto con los campos q tiene que acualizar en la req del body de la petición. {new: true} Le dice que nos mande el user actualizado no el antiguo. Lo busca y elimina con el metodo findByIdAndDelete(id del user a eliminar).
    if (userUpdated) {
      res.json(userUpdated); //  Devolvemos el user actualizado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla la actualización...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de PUT para actualizar datos concretos (en este caso el name) recogidos en el body,
de un user en concreto (recogemos el id de los parametros de la ruta ):

fetch("http://localhost:3000/user/id del user a actualizar",{"body": JSON.stringify({name:"El libro de las ilusiones."}),"method":"PUT","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

module.exports = { userRouter: router }; // Exportamos el router.
