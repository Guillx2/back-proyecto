// ARCHIVO PARA LISTAR LAS CATEGORÍAS --->   GET - /comprar

const listarCategorias = (req, res, next) => {
  res.send({
    message: "Listar las categorias",
  });
};

module.exports = listarCategorias;
