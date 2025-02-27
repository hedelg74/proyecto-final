import createConnection from "../../dbconnection/connection.js";


const controllerProducts = {
	
	loadProducts: async (req, res, next) => {
		const connection = await createConnection(); // Obtener la conexión
		try {
			const [products] = await connection.query(`SELECT 
					c.id AS id_category,
					c.name AS category,
					s.id AS id_subcategory,
					s.name AS subcategory,
					p.id,
					p.name,
					p.price,
					p.image_path
				FROM 
					product p
				JOIN 
					sub_category s ON p.id_sub_category = s.id
				JOIN 
					category c ON p.id_category = c.id
				ORDER BY 
					c.name, s.name, p.id;
				`);
			res.status(200).json(products);
		} catch (err) {
			next(err);
		} finally {
			await connection.end();
		}
	},

	macrameCollares: async (req, res, next) => {
		const connection = await createConnection(); // Obtener la conexión
		try {
			const [products] = await connection.query("SELECT * FROM product WHERE id_category=3 AND id_sub_category=2 AND product_status=1");
			res.status(200).json(products);
		} catch (err) {
			next(err);
		} finally {
			await connection.end();
		}
	},
	macrameDijes: async (req, res, next) => {
		const connection = await createConnection(); // Obtener la conexión
		try {
			const [products] = await connection.query("SELECT * FROM product WHERE id_category=3 AND id_sub_category=9 AND product_status=1");
			res.status(200).json(products);
		} catch (err) {
			next(err);
		} finally {
			await connection.end();
		}
	},
	macrameBrazaletes: async (req, res, next) => {
		const connection = await createConnection(); // Obtener la conexión
		try {
			const [products] = await connection.query("SELECT * FROM product WHERE id_category=3 AND id_sub_category=8 AND product_status=1");
			res.status(200).json(products);
		} catch (err) {
			next(err);
		} finally {
			await connection.end();
		}
	},
};

export default controllerProducts;
