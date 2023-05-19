Project requirements.

    -Un usuario debe poder registrarse indicando nombre y apellidos, email y contraseña
        -

    -Por supuesto, si hay un registro habrá un login… un usuario podrá hacer login con su usuario y contraseña
    -Independientemente de si el usuario está logado o no, podrá buscar productos
    -Un usuario que esté logado, deberá poder indicar que ha vendido un producto, para ello deberá indicar a quien se lo ha vendido.

    Ahora que ya sabes la operativa de nuestra aplicación, debes ocuparte de hacer el API lo mejor posible, ten en cuenta que debes controlar tooooodas las situaciones posibles.

Por ejemplo:

Un usuario que no esté logado no debe poder subir productos, iniciar conversaciones… etc Si el usuario logado es Fran (por poner un ejemplo) no puede marcar que ha vendido un producto de Edu, o que está iniciando una conversación entre Gon y Pedro… etc Si el usuario logado es Gon, no puede indicar que Edu vende un producto… No se puede realizar una venta de un producto que ya está vendido No se deben poder subir productos a los que les falten datos o que tengan el precio negativo… etc … Y cualquier lógica que se te ocurra que debas controlar en la aplicación EXTRAS

Añade funcionalidad para que un usuario pueda marcar / desmarcar un producto como favorito Añade un usuario admin que pueda hacer todas las operaciones Añade categorías a los productos para que un producto se pueda etiquetar dentro de una categoría (coches, muebles, ropa… etc) Añade filtros a las busquedas: precio, categoria… Añade ubicación a tus productos, puedes hacerlo por latitud / longitud, o por codigo postal

User

    - Name
    - Password
    - Email

Product

    - Product name
    - Price
    - Description
    - Photos
    - Buyer => User
    - Seller => User

Chat

    - Buyer => User
    - Seller => User
    - Product => Product
    - Messages => Messages

Messages

    - Date
    - Messages
    - Sender => User
    - Reciever => User
