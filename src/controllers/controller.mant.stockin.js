
import createConnection from "../../dbconnection/connection.js";

const controllerMantStockIn = {
	loadStockIn: async (req, res, next) => {
		const connection = await createConnection();
		//const userId = req.session.userId;

		try {
			const query = "SELECT * FROM stock_in";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay entradas para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadStockInList: async (req, res, next) => {
		const connection = await createConnection();

		try {
			const query = "SELECT * FROM stock_in";

			const [data] = await connection.query(query);
			
			res.render("./partials/list.stockin.ejs", { data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadStockInById: async (req, res, next) => {
		const connection = await createConnection();
		const stockinId = req.body.id;

		
		try {
			const query = `
            SELECT
				e.id, 
                e.document,
                e.document_date,
                e.in_type,
				e.total_document,
				p.name,
				p.image_path,
				d.id AS detailId,
                d.product_id,
                d.quantity,
				d.price
            FROM 
                stock_in e
            INNER JOIN 
                stock_in_detail d ON e.id = d.stockin_id
			INNER JOIN
				product p ON d.product_id = p.id
            WHERE 
                e.id = ?`;

			const [data] = await connection.query(query, [stockinId]);
			console.log(data);
			
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay entradas para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addStockIn: async (req, res, next) => {
		const { document,document_date, in_type, total_document, detalle } = req.body;
		
		const connection = await createConnection();
		
		try {
			await connection.beginTransaction();
				const query = "INSERT INTO stock_in (document, document_date, in_type, total_document) VALUES (?, ?, ?, ?)";
				const data = [document,document_date, in_type, total_document];
				await connection.query(query, data);
				const [stockin] = await connection.query("SELECT LAST_INSERT_ID() as document_id");
				const document_id = stockin[0].document_id;
				data.unshift(document_id);

				const query2 = "INSERT INTO stock_in_detail (stockin_id, product_id, quantity, price) VALUES (?,?,?,?)";
				const data2 = detalle.map((item) => [document_id, item.product_id, item.quantity, item.price]);
				data2.forEach(async (item) => {
					await connection.query(query2, item);
				});
			
				const query3 = "UPDATE product SET stock= stock + ?, price=? WHERE id=?";
				const data3 = detalle.map((item) => [item.quantity, item.price, item.product_id]);
				data3.forEach(async (item) => {
					await connection.query(query3, item);
				});
			await connection.commit();

			res.status(200).json({ success: true, message: "Entrada ha sido agregada.", data });
		
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateStockIn: async (req, res, next) => {
		const { stockinId, document, document_date, in_type, total_document, detalle } = req.body;
		const connection = await createConnection();
		
		try {
			await connection.beginTransaction();
				const queryUpdateStockIn = "UPDATE stock_in SET document=?, document_date=?,in_type=?, total_document=? WHERE id=?";
				const data = [document, document_date, in_type, total_document, stockinId];
				await connection.query(queryUpdateStockIn, data);

				const queryUpdateDetail = "UPDATE stock_in_detail SET quantity=?, price=? WHERE id=? AND stockin_id=? AND product_id=?";
				const queryInsertDetail = "INSERT INTO stock_in_detail (stockin_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
			const queryUpdateProduct = "UPDATE product SET stock=(stock - ?) + ?, price=? WHERE id=?";
			const queryUpdateProductFirstTime = "UPDATE product SET stock=?, price=? WHERE id=?";
			
				
				const data2 = detalle.map((item) => [item.beforeQuantity, item.quantity, item.price, item.itemDetailId, stockinId, item.product_id, item.toDelete]);
				

			for (let item of data2) {
				if (item[6] === true) {
					await connection.query(`UPDATE product SET stock = stock - ? WHERE id = ?`, [item[1], item[5]]);
					await connection.query(`DELETE FROM stock_in_detail WHERE id = ? AND stockin_id = ? AND product_id = ?`, [item[3], stockinId, item[5]]);
				} else {
					const [stock] = await connection.query(`SELECT 
						p.id AS product_id,
						p.name AS product_name,
						COALESCE(e.total_stock_in, 0) AS total_stock_in,
						COALESCE(s.total_stock_out, 0) AS total_stock_out,
						COALESCE(e.total_stock_in, 0) - COALESCE(s.total_stock_out, 0) AS actual_stock
					FROM product p
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_in 
						FROM stock_in_detail 
						GROUP BY product_id) e 
					ON p.id = e.product_id
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_out 
						FROM stock_out_detail
						GROUP BY product_id) s 
					ON p.id = s.product_id
					WHERE p.id = ?;`, item[5]);

					  
					if (((stock[0].total_stock_in - item[0]) + item[1])< (stock[0].total_stock_out) ) {
						res.status(400).json({ success: false, message: `No se puede actualizar ${stock[0].product_id + " " + stock[0].product_name} del detalle porque no respaldaria sus movimientos.` });
						return;
					}
					
					const [result] = await connection.query(queryUpdateDetail, [item[1], item[2], item[3] ,item[4], item[5]]);
					if (result.affectedRows === 0) {
						const itemData = [item[4], item[5], item[1], item[2]];
						await connection.query(queryInsertDetail, itemData);
						await connection.query(queryUpdateProductFirstTime, [item[1], item[2], item[5]]);
					
					} 
					
					await connection.query(queryUpdateProduct, [item[0], item[1], item[2], item[5]]);
					
				}
			}
			
			await connection.commit();
			res.status(200).json({ success: true, message: "Entrada actualizada.", data });
				
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateStockInDetailById: async (req, res, next) => {
		
		const { stockin_id, product_id, quantity, price } = req.body;
		const connection = await createConnection();

		try {
			const [stock] = await connection.query(`SELECT 
					p.product_id,
					p.name AS product_name,
					e.total_stock_in,
					s.total_stock_out,
					e.total_stock_in - s.total_stock_out AS actual_stock
				FROM product p
				LEFT JOIN 
					(SELECT product_id, SUM(quantity) AS total_stock_in 
					FROM stock_in_detail 
					GROUP BY product_id) e 
				ON p.product_id = e.product_id
				LEFT JOIN 
					(SELECT product_id, SUM(cantidad) AS total_stock_out 
					FROM stock_out_detail
					GROUP BY product_id) s 
				ON p.product_id = s.product_id
				WHERE p.product_id = ?;`, [product_id]);

				
			if (stock[0].actual_stock  < stock[0].total_stock_out) {
				res.status(400).json({ success: false, message: `No se puede actualizar ${stock[0].product_id,+ " " + stock[0].product_name} del detalle porque no respaldaria sus movimientos.` });
				return;
			}

			await connection.beginTransaction();

			// Primero elimina los registros relacionados en stock_in_detail
			await connection.query(`
				UDATATE stock_in_detail
				SET quantity = ?, price = ?
				WHERE stockin_id = ? AND product_id = ?`, [quantity, price, stockin_id, product_id]);

        	await connection.commit();
			
			res.status(200).json({ success: true, message: "Detalle de entrada actualizado." });
			await connection.commit();
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	deleteStockIn: async (req, res, next) => {
		const connection = await createConnection();
		const stockinId = req.body.id;
		try {
			await connection.beginTransaction();
			
			const [stockinDetail] = await connection.query(`SELECT *
				FROM stock_in_detail
				INNER JOIN stock_in
				ON stock_in_detail.stockin_id = stock_in.id
				WHERE stock_in.id = ?`, [stockinId]);
			
			console.log(stockinDetail);

			for (let item of stockinDetail) {
				const [stock] = await connection.query(`SELECT 
						p.id AS product_id,
						p.name AS product_name,
						COALESCE(e.total_stock_in, 0) AS total_stock_in,
						COALESCE(s.total_stock_out, 0) AS total_stock_out,
						COALESCE(e.total_stock_in, 0) - COALESCE(s.total_stock_out, 0) AS actual_stock
					FROM product p
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_in 
						FROM stock_in_detail 
						GROUP BY product_id) e 
					ON p.id = e.product_id
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_out 
						FROM stock_out_detail
						GROUP BY product_id) s 
					ON p.id = s.product_id
					WHERE p.id = ?;`, [item.product_id]);

				
				if (stock[0].total_stock_out > ((stock[0].actual_stock - item.quantity)) ) {
						res.status(400).json({ success: false, message: `No se puede actualizar ${stock[0].product_id + " " + stock[0].product_name} del detalle porque no respaldaria sus movimientos.` });
						return;
				}
			}


			// Primero elimina los registros relacionados en stock_in_detail
			await connection.query(`
				DELETE stock_in_detail
				FROM stock_in_detail
				JOIN stock_in ON stock_in_detail.stockin_id = stock_in.id
				WHERE stock_in.id = ?`,  [stockinId]);

			// Luego elimina el registro en stock_in
			await connection.query(`DELETE FROM stock_in WHERE id = ?`, [stockinId]);

        	await connection.commit();
			
			res.status(200).json({ success: true, message: "Entrada eliminada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	deleteStockInDetailById: async (req, res, next) => {
		const connection = await createConnection();
		const { stockin_id, itemDetailId, product_id, itemDetailQty } = req.body;
		try {
			
			await connection.beginTransaction();

			const [stock] = await connection.query(`SELECT 
						p.id AS product_id,
						p.name AS product_name,
						COALESCE(e.total_stock_in, 0) AS total_stock_in,
						COALESCE(s.total_stock_out, 0) AS total_stock_out,
						COALESCE(e.total_stock_in, 0) - COALESCE(s.total_stock_out, 0) AS actual_stock
					FROM product p
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_in 
						FROM stock_in_detail 
						GROUP BY product_id) e 
					ON p.id = e.product_id
					LEFT JOIN 
						(SELECT product_id, SUM(quantity) AS total_stock_out 
						FROM stock_out_detail
						GROUP BY product_id) s 
					ON p.id = s.product_id
					WHERE p.id = ?;`, [product_id]);

				
			if (stock[0].total_stock_out > ((stock[0].actual_stock - itemDetailQty)) ) {
						res.status(400).json({ success: false, message: `No se puede actualizar ${stock[0].product_id + " " + stock[0].product_name} del detalle porque no respaldaria sus movimientos.` });
						return;
				}
			


			// Primero elimina los registros relacionados en stock_in_detail
			await connection.query(`
				DELETE FROM stock_in_detail
				WHERE stock_in_detail.id=? AND stock_in_detail.stockin_id = ? AND stock_in_detail.product_id=?`,  [itemDetailId, stockin_id, product_id]);
        	
			await connection.query(`UPDATE product SET stock = stock - ? WHERE id = ?`, [itemDetailQty, product_id]);

 			await connection.commit();
			
			res.status(200).json({ success: true, message: "Detalle de entrada eliminada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	}
};


export default controllerMantStockIn;
