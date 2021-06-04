// CREACIÓN DEL SERVIDOR

require("dotenv").config();

const express = require("express");

const morgan = require("morgan");

// Controladores:
const listarCategorias = require("./controladores/categorias");

const { PORT } = process.env;

// Crear la app de express:
const app = express();

// Aplicación de middlewares:
app.use(morgan("dev"));

// RUTAS DE LA API:
app.get("/comprar", listarCategorias);

// Crear middlewar de error:
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.httpStatus || 500).send({
    status: "error",
    message: "error.message",
  });
});

// Middleware de 404
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

// Cargar los controladores:

// // RUTAS DE LA API:
// // GET - /categorias ---> devuelve los elementos de la tabla categorias:
// app.get("/categorias", listaCategorias);

// // GET - /categorias/:id ---> muestra los artículos de una categoría concreta:
// app.get("/categorias/:id", listaCategorias);

// // POST - /categorias/:id/filtro ---> muestra los artículos de una categoría con filtros aplicados:

// // GET - /anuncio/:id ---> muestra un anuncio (ficha de un artículo)
// app.get("/anuncio/:id", listarAnuncios);

// // POST - /anuncio ---> crea un anuncio (publicación):
// app.post("/anuncio", crearAnuncio);

// // PUT - /anuncio/:id ---> edita un anuncio:
// app.put("/anuncio", editarAnuncio);

// // DELETE - /anuncio/:id ---> borra un anuncio:
// app.delete("/anuncio/:id", borrarAnuncio);

// // GET - /usuario/:id ---> muestra el perfil del usuario:
// app.get("/usuario", mostrarUsuario);

// // DELETE - /usuario/:id ---> borrar un usuario:
// app.delete("usuario/:id", borrarUsuario);

// // POST - /usuario ---> crear un usuario:
// app.post("/usuario", crearUsuario);

// // PUT - /usuario/:id ---> edita un usuario (el perfil):
// app.put("/usuario/id", editarUsuario);

// // (((((((((( INICIAR SESIÓN ???????? ))))))))))

// // (((((((((( VALIDAR EMAIL ????????? ))))))))))

// Iniciar el servidor:
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}.`);
});
