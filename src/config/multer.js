const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Verificación de directorios subidos
const crearDirectorios = () => {
  const directorios = [
    "src/uploads",
    "src/uploads/productos",
    "src/uploads/usuarios",
  ];
  directorios.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    crearDirectorios();
    let carpeta = "src/uploads/productos";
    if (file.fieldname === "avatar_usuario") {
      carpeta = "src/uploads/usuarios";
    }
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const nombreUnico = `${timestamp}-${random}${extension}`;
    cb(null, nombreUnico);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de archivo no permitido. Solo se acpetan: JPG, PNG, WEB"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
});

module.exports = {
  subirImagenProducto: upload.single("imagen_producto"),
  subirAvatarUsuario: upload.single("avatar_usuario"),
  subirMultiplesImagenes: upload.array("imagenes_producto", 5),
};
