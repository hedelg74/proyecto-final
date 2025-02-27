
import createConnection from "../../dbconnection/connection.js";

const controllerMantCategory = {
	loadSubCategory: async (req, res, next) => {
		const connection = await createConnection();

		try {
			const query = "SELECT * FROM sub_category";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.status(200).json({success:true, data});
			} else {
				res.status(404).json({ success: false, message: "No hay Subcategorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadSubCategoryList: async (req, res, next) => {
		const connection = await createConnection();
		//const userId = req.session.userId;

		try {
			const query = "SELECT * FROM sub_category";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.render("./partials/list.subcategories.ejs", { data });
			} else {
				res.status(404).json({ success: false, message: "No hay subcategorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadSubCategoryById: async (req, res, next) => {
		const connection = await createConnection();
		const subCategoryId = req.body.id;

		
		try {
			const query = "SELECT * FROM sub_category WHERE id=?";

			const [data] = await connection.query(query,[subCategoryId]);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay Subcategorias para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addSubCategory: async (req, res, next) => {
		const { name } = req.body;
		const connection = await createConnection();
		try {
			const query = "INSERT INTO sub_category (name) VALUES (?)";
			const data = [name];
			await connection.query(query, data);
			const [subcategory] = await connection.query("SELECT LAST_INSERT_ID() as subcategory_id");
			data.unshift(subcategory[0].subcategory_id);
			res.status(200).json({ success: true, message: "Subcategoria ha sido agregada.", data });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateSubCategory: async (req, res, next) => {
		const { name, id } = req.body;
		const connection = await createConnection();
		
		try {
			
			const query = "UPDATE sub_category SET name=? WHERE id=?";
			const data = [name, Number(id)];

			await connection.query(query, data);
			res.status(200).json({ success: true, message: "Subcategoria actualizada.", data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	deleteSubCategory: async (req, res, next) => {c
		const connection = await createConnection();
		const categoryId = req.body.id;
		try {
			const [category] = await connection.query("SELECT id_sub_category FROM product WHERE id_sub_category=?", [categoryId]);
			if (category.length > 0) {
				res.status(400).json({ success: false, message: "No se puede eliminar la subcategoria porque ya esta en uso." });
				return;
			}

			const query = "DELETE FROM sub_category WHERE id=?";
			await connection.query(query, [categoryId]);
			res.status(200).json({ success: true, message: "Subcategoria eliminada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	}
}

export default controllerMantCategory;
