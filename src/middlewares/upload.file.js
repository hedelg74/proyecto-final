import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de la raíz del proyecto
const projectRoot = path.resolve(__dirname, '../../');

const createDirectoryIfNeeded = (dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    } catch (err) {
      console.error(`Error al crear el directorio: ${err.message}`);
    }
  } else {
    console.log(`El directorio ya existe: ${dir}`);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const customPath = req.query.img_path || ''; // Obtén la ruta personalizada
    const baseDir = path.join(projectRoot, 'public'); // Usar la ruta base del proyecto
    const dir = path.join(baseDir, customPath); // Concatenar correctamente la ruta

    // Crear el directorio si no existe
    createDirectoryIfNeeded(dir);

    if (!dir.startsWith(baseDir)) {
      return cb(new Error('Ruta no permitida'));
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    //const ext = path.extname(file.originalname); // Extensión del archivo
    //const baseName = path.basename(file.originalname, ext); // Nombre base del archivo
    //const uniqueFilename = `${baseName}-${Date.now()}${ext}`; // Nombre único del archivo
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

const uploadFile = upload.fields([
  { name: 'file', maxCount: 1 },
  //{ name: 'img_path' }
]);



export default uploadFile;
