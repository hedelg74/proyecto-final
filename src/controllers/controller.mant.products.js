
import createConnection from "../../dbconnection/connection.js";
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de la raíz del proyecto
const projectRoot = path.resolve(__dirname, '../../');

const controllerMantProducts = {
	loadProduct: async (req, res, next) => {
		const connection = await createConnection();
		try {
			const query = "SELECT * FROM product";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay productos para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	
	loadProductList: async (req, res, next) => {
		const connection = await createConnection();
		try {
			const query = "SELECT * FROM product";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.render("./partials/list.products.ejs", { data });
			} else {
				res.status(404).json({ success: false, message: "No hay productos para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	loadProductById: async (req, res, next) => {
		const connection = await createConnection();
		const productId = req.body.id;

		try {
			const query = "SELECT * FROM product WHERE id=?";

			const [data] = await connection.query(query,[productId]);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay producto para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadProductByQr: async (req, res, next) => {
		const connection = await createConnection();
		const qrCode = req.body.qrCode;

		try {
			const query = "SELECT * FROM product WHERE qr_code=?";

			const [data] = await connection.query(query,[qrCode]);
			if (data.length > 0) {
				const newQuery = `SELECT 
					category.name AS category, 
					sub_Category.name AS sub_category
				FROM 
					product 
				JOIN 
					category ON product.id_category = category.id 
				JOIN 
					sub_category ON product.id_sub_category = sub_category.id 
				WHERE 
					product.qr_code=?`;
				
				const [newData] = await connection.query(newQuery, [qrCode]);
				if (newData.length > 0) {
				
					data[0].category = newData[0].category;
					data[0].sub_category = newData[0].sub_category;
					

				};
				
				QRCode.toDataURL(qrCode, (err, url) => {
					if (err) {
						console.error('Error generando el QR:', err);
						res.status(500).json({ success: false, message: "Error generando el QR" });
						return;
					}
					data[0].urlQrCode = `${url}`;
					
					res.status(200).json({ success: true, data: data });
				});
			} else {
				res.status(404).json({ success: false, message: "No hay producto para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addProduct: async (req, res, next) => {
		const img_path = req.query.img_path + '/' + req.files.file[0].filename;
		const { name, description, category, sub_category, status } = req.body;
		
		const connection = await createConnection();
		// Generar un UUID para el código QR 
		const qrCode = uuidv4();
		const baseDir = path.join(projectRoot, 'public'); // Usar la ruta base del proyecto
		const qrCodes = '/qrcodes';
		const dir = path.join(baseDir, qrCodes); // Concatenar correctamente la ruta
		
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		
		try{
			const query = "INSERT INTO product (name, description, id_category, id_sub_category, product_status, image_path, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
			const data = [name, description, Number(category), Number(sub_category), Number(status), img_path, qrCode];
			await connection.query(query, data);
			// Generar el código QR .png
			QRCode.toFile(`${dir}/${qrCode}.png`, qrCode, (err) => {
				if (err) throw err;
				console.log('Código QR generado');
			});
			const [product] = await connection.query("SELECT LAST_INSERT_ID() as product_id");
			data.push(product[0].product_id);
			res.status(200).json({ success: true, message: "Producto agregado.", data});
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateProduct: async (req, res, next) => {
		const {id, name, description, price, category, sub_category, status, img_path} = req.body;
		const connection = await createConnection();
		try{

			const query = "UPDATE product SET name=?, description=?, price=?, id_category=?, id_sub_category=?, product_status=?, image_path=? WHERE id=?";
			const data = [name, description, Number(price),Number(category), Number(sub_category), Number(status), img_path, id];

			await connection.query(query, data);
			res.status(200).json({ success: true, message: "Producto actualizado.", data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	genQrCode: async (req, res, next) => {
		
		const connection = await createConnection();
		// Verificar si la carpeta qrcodes existe y crearla si no es así 
		const qrCodeDir = './qrcodes'; 
		if (!fs.existsSync(qrCodeDir)) {
			fs.mkdirSync(qrCodeDir, { recursive: true });
		}

		try{
			const products = await connection.query("SELECT * FROM product");
			products[0].forEach(async (product) => {
				const qrCode = uuidv4();
				await connection.query("UPDATE product SET qr_code=? WHERE id=?", [qrCode, product.id]);
			});
			
			res.status(200).json({ success: true, message: "Qr generados." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	
	deleteProduct: async (req, res, next) => {
		const connection = await createConnection();
		const productId = req.body.id;
		try {
			const [product] = await connection.query("SELECT product_id FROM stock_in_detail WHERE product_id=?", [productId]);
			if (product.length > 0) {
				res.status(400).json({ success: false, message: "No se puede eliminar el producto porque tiene stock." });
				return;
			}

			const query = "DELETE FROM product WHERE id=?";
			await connection.query(query, [productId]);
			res.status(200).json({ success: true, message: "Producto eliminado." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	}
};



export default controllerMantProducts;
