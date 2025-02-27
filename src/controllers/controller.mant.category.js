
import createConnection from "../../dbconnection/connection.js";

const controllerMantCategory = {
	loadCategory: async (req, res, next) => {
		const connection = await createConnection();
		//const userId = req.session.userId;

		try {
			const query = "SELECT * FROM category";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay categorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadCategoryList: async (req, res, next) => {
		const connection = await createConnection();
		//const userId = req.session.userId;

		try {
			const query = "SELECT * FROM category";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.render("./partials/list.categories.ejs", { data });
			} else {
				res.status(404).json({ success: false, message: "No hay categorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadCategoryById: async (req, res, next) => {
		const connection = await createConnection();
		const categoryId = req.body.id;

		
		try {
			const query = "SELECT * FROM category WHERE id=?";

			const [data] = await connection.query(query,[categoryId]);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay categorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addCategory: async (req, res, next) => {
		const { name } = req.body;
		console.log("CatER", req.body);
		const connection = await createConnection();
		
		try {
			const query = "INSERT INTO category (name) VALUES (?)";
			const data = [name];
			await connection.query(query, data);
			const [category] = await connection.query("SELECT LAST_INSERT_ID() as category_id");
			data.unshift(category[0].category_id);
			res.status(200).json({ success: true, message: "Categoria ha sido agregada.", data });
		
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateCategory: async (req, res, next) => {
		const { name, id } = req.body;
		const connection = await createConnection();
		
		try {
			
			const query = "UPDATE Category SET name=? WHERE id=?";
			const data = [name, Number(id)];

			await connection.query(query, data);
			res.status(200).json({ success: true, message: "Categoria actualizada.", data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	deleteCategory: async (req, res, next) => {
		const connection = await createConnection();
		const categoryId = req.body.id;
		try {
			const [category] = await connection.query("SELECT id_category FROM product WHERE id_category=?", [categoryId]);
			if (category.length > 0) {
				res.status(400).json({ success: false, message: "No se puede eliminar la categoria porque ya esta en uso." });
				return;
			}

			const query = "DELETE FROM category WHERE id=?";
			await connection.query(query, [categoryId]);
			res.status(200).json({ success: true, message: "Categoria eliminada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	}
};


export default controllerMantCategory;
