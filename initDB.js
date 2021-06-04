// Este script se va a encargar de borrar las tablas que hay en la base de datos y crearlas de nuevo vacías

// Carga de las librerías faker y lodash:
const faker = require("faker");
const { random } = require("lodash");

// Con esto nos comunicamos con la base de datos mediante el archivo db.js:
const getDB = require("./db");

// Importamos el formato de la fecha del archivo helpers.js:
const { formatDateToDB } = require("./helpers");
// poner ${formatDateToDB(now)} para hacer el cambio de fecha

// Esta función se va a encargar de hacer cosas en la base de datos:
let connection;

async function main() {
  try {
    connection = await getDB();
    //Para que nos borre las tablas (antes de volver a crearlas):

    await connection.query("DROP TABLE IF EXISTS categorias");
    await connection.query("DROP TABLE IF EXISTS reserva");
    await connection.query("DROP TABLE IF EXISTS guardados");
    await connection.query("DROP TABLE IF EXISTS chat");
    // (DUDA) Para que funcionase he tenido que mover las tablas "anuncios" y "usuarios" de esta manera. Poniéndolas por orden me daba un error ("Cannot drop table 'usuarios' referenced by a foreign key constraint 'anuncios_idUsuario_fk1' on table 'anuncios'.)
    await connection.query("DROP TABLE IF EXISTS anuncios");
    await connection.query("DROP TABLE IF EXISTS usuarios");

    console.log("Tablas borradas.");

    // Creamos la tabla "usuarios":
    await connection.query(`
        CREATE TABLE usuarios (
            idUsuario INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            fechaRegistro DATETIME NOT NULL,
            userName VARCHAR(50) NOT NULL,
                -- para que no se pueda repetir el userName
                CONSTRAINT usuarios_userName_uq2 UNIQUE(userName),
            nombre VARCHAR(60) NOT NULL,
            apellidos VARCHAR(120) NOT NULL,
            foto VARCHAR(500),
            ciudad VARCHAR(200) NOT NULL,
            pais VARCHAR(200) NOT NULL,
            codigoPostal INT NOT NULL,
            fechaNacimiento DATE,
            email VARCHAR(100),
                -- para que no se pueda repetir el email
                CONSTRAINT usuarios_email_uq2 UNIQUE(email),
            contraseña VARCHAR(60) NOT NULL
            );
        `);

    // Creamos la tabla "anuncios":
    await connection.query(`
        CREATE TABLE anuncios (
            idAnuncio INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            fechaPublicacion DATETIME NOT NULL,
            titulo VARCHAR(150) NOT NULL,
            descripcion VARCHAR(500) NOT NULL,
            precio DECIMAL(8, 2) DEFAULT 0.0 NOT NULL,
            provincia VARCHAR(300) NOT NULL,
            localidad VARCHAR(300) NOT NULL,
            categoria VARCHAR(100) NOT NULL,
            foto VARCHAR(500), 
            idUsuario INT UNSIGNED NOT NULL,
                CONSTRAINT anuncios_idUsuario_fk1
                    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario)
            );
        `);
    // Creamos la tabla "categorias"
    await connection.query(`
        CREATE TABLE categorias (
            idCategoria INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            nombre ENUM ('Consolas y Videojuegos', 'Informática', 'Teléfonos', 'TV y Vídeo', 'Sonido') NOT NULL,            
            idAnuncio INT UNSIGNED NOT NULL,
                CONSTRAINT categorias_idAnuncio_fk1
                    FOREIGN KEY (idAnuncio) REFERENCES anuncios(idAnuncio)
    );
`);

    // Creamos la tabla "reserva":
    // (DUDA) ¿"reservado" es NULL o NOT NULL? No se sabe si va a ser true hasta que el usuario reserve...(?)
    await connection.query(`
    CREATE TABLE reserva ( 
        idReserva INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        idUsuario INT UNSIGNED NOT NULL,
            CONSTRAINT reserva_idUsuario_fk2
                FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
        idAnuncio INT UNSIGNED NOT NULL,
            CONSTRAINT reserva_idAnuncio_fk2
                FOREIGN KEY (idAnuncio) REFERENCES anuncios(idAnuncio),
        reservado BOOLEAN DEFAULT FALSE
    );
`);

    // Creamos la tabla "guardados":
    await connection.query(`
    CREATE TABLE guardados (
        idGuardado INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        idUsuario INT UNSIGNED NOT NULL,
            CONSTRAINT guardados_idUsuario_fk3
                FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
        idAnuncio INT UNSIGNED NOT NULL,
            CONSTRAINT reserva_idAnuncio_fk3
                FOREIGN KEY (idAnuncio) REFERENCES anuncios(idAnuncio),
        fechaGuardado DATETIME NOT NULL
    );
`);

    // Creamos la tabla "chat":
    await connection.query(`
    CREATE TABLE chat (
        idChat INT PRIMARY KEY AUTO_INCREMENT,
        mensaje VARCHAR(500) NOT NULL,
        fechaEnviado DATETIME NOT NULL,
        idUsuario INT UNSIGNED NOT NULL,
            CONSTRAINT chat_idUsuario_fk4
                FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario)
    );
`);

    console.log("Tablas creadas.");

    // Ahora introducimos datos iniciales de prueba (con "faker" y "lodash"):

    // DATOS DE PRUEBA TABLA "usuarios":
    const usuarios = 100;

    for (let i = 0; i < usuarios; i++) {
      // -- pasamos la fecha de formato js a formato SQL con "date-fns" y el archivo "helpers.js" ---
      const now = new Date();
      const userName = faker.internet.userName();
      const nombre = faker.name.firstName();
      const apellidos = faker.name.lastName();
      const ciudad = faker.address.city();
      const pais = faker.address.country();
      const cp = random(10000, 20000);
      const email = faker.internet.email();
      const contraseña = faker.internet.password();

      await connection.query(`
        INSERT INTO usuarios (fechaRegistro, userName, nombre, apellidos, ciudad, pais, codigoPostal, email, contraseña)
            VALUES ("${formatDateToDB(
              now
            )}", "${userName}", "${nombre}", "${apellidos}", "${ciudad}", "${pais}", "${cp}", "${email}", "${contraseña}")
        `);
    }
    console.log("Datos de prueba introducidos en la tabla 'usuarios'.");
    // DATOS DE PRUEBA TABLA "anuncios":
    const anuncios = 30;

    for (let i = 0; i < anuncios; i++) {
      const now = new Date();
      const titulo = faker.commerce.productName();
      const descripcion = faker.commerce.productDescription();
      const precio = random(10, 10000);
      const provincia = faker.address.state();
      const localidad = faker.address.city();
      // --- quiero que me liste las categorías que yo puse en la base de datos, no unas random. ¿Cómo se hace eso? ---
      const categoria = faker.lorem.word();
      // el idUsuario se tiene que poner de otra forma para que coja el id de un usuario existente (creo)
      const idUsuario = random(1, 100);

      await connection.query(`
            INSERT INTO anuncios (fechaPublicacion, titulo, descripcion, precio, provincia, localidad, categoria, idUsuario)
                VALUES ("${formatDateToDB(
                  now
                )}", "${titulo}", "${descripcion}", "${precio}", "${provincia}", "${localidad}", "${categoria}", "${idUsuario}")`);
    }
    console.log("Datos de prueba introducidos en la tabla 'anuncios'.");

    // DATOS DE PRUEBA TABLA "categorias":
    const categorias = 5;

    for (let i = 0; i < categorias; i++) {
      const idAnuncio = random(1, 30);

      await connection.query(`
            INSERT INTO categorias (idAnuncio)
                VALUES ( "${idAnuncio}")`);
    }
    // --- solo me sale la categoría "Consolas y Videojuegos" en la base de datos. ¿Cómo se hace para que me las ponga todas? ---
    console.log("Datos de prueba introducidos en la tabla 'categorias'.");

    // DATOS DE PRUEBA TABLA "reserva":
    const reservas = 20;

    for (let i = 0; i < reservas; i++) {
      const idUsuario = random(1, 100);
      const idAnuncio = random(1, 30);

      await connection.query(`
            INSERT INTO reserva (idUsuario, idAnuncio)
                VALUES ("${idUsuario}", "${idAnuncio}")`);
    }

    console.log("Datos de prueba introducidos en la tabla 'reserva'.");

    // DATOS DE PRUEBA TABLA "guardados":
    const guardados = 10;

    for (let i = 0; i < guardados; i++) {
      const now = new Date();
      const idUsuario = random(1, 100);
      const idAnuncio = random(1, 30);

      await connection.query(`
            INSERT INTO guardados (idUsuario, idAnuncio, fechaGuardado)
                VALUES ("${idUsuario}", "${idAnuncio}", "${formatDateToDB(
        now
      )}")`);
    }

    console.log("Datos de prueba introducidos en la tabla 'guardados'.");
    // DATOS DE PRUEBA TABLA "chat":
    const mensajes = 20;

    for (let i = 0; i < mensajes; i++) {
      const mensaje = faker.lorem.sentence();
      const now = new Date();
      const idUsuario = random(1, 100);

      await connection.query(`
            INSERT INTO chat (mensaje, fechaEnviado, idUsuario)
                VALUES ("${mensaje}", "${formatDateToDB(
        now
      )}", "${idUsuario}")`);
    }

    console.log("Datos de prueba introducidos en la tabla 'chat'.");
  } catch (error) {
    console.error(error);
  } finally {
    // Libera la conexión
    if (connection) connection.release();
    process.exit();
  }
}

main();
