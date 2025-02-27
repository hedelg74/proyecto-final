

import createConnection from "../../dbconnection/connection.js";

const controllerMantStockOut = {
	loadStockOut: async (req, res, next) => {
		const connection = await createConnection();
		//const userId = req.session.userId;

		try {
			const query = "SELECT * FROM stock_out";

			const [data] = await connection.query(query);
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay salidas para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadStockOutList: async (req, res, next) => {
		const connection = await createConnection();

		try {
			const query = "SELECT * FROM stock_out";

			const [data] = await connection.query(query);
			
			res.render("./partials/list.stockout.ejs", { data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadStockOutById: async (req, res, next) => {
		const connection = await createConnection();
		const stockoutId = req.body.id;

		
		try {
			const query = `
            SELECT
				s.id, 
                s.document,
                s.document_date,
                s.out_type,
				s.total_document,
				p.name,
				p.image_path,
				d.id AS detailId,
                d.product_id,
                d.quantity,
				d.price
            FROM 
                stock_out s
            INNER JOIN 
                stock_out_detail d ON s.id = d.stockout_id
			INNER JOIN
				product p ON d.product_id = p.id
            WHERE 
                s.id = ?`;

			const [data] = await connection.query(query, [stockoutId]);
			
			if (data.length > 0) {
				res.status(200).json({ success: true, data });
			} else {
				res.status(404).json({ success: false, message: "No hay detalle de salida para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addStockOut: async (req, res, next) => {
		const { document,document_date, out_type, total_document, detalle } = req.body;
		
		const connection = await createConnection();
		
		try {
			await connection.beginTransaction();
				const query = "INSERT INTO stock_out (document, document_date, out_type, total_document) VALUES (?, ?, ?, ?)";
				const data = [document,document_date, out_type, total_document];
				await connection.query(query, data);
			
				const [stockout] = await connection.query("SELECT LAST_INSERT_ID() as document_id");
				const document_id = stockout[0].document_id;
				data.unshift(document_id);

				const query2 = "INSERT INTO stock_out_detail (stockout_id, product_id, quantity, price) VALUES (?,?,?,?)";
				const data2 = detalle.map((item) => [document_id, item.product_id, item.quantity, item.price]);
				data2.forEach(async (item) => {
					await connection.query(query2, item);
				});
			
				const query3 = "UPDATE product SET stock= stock - ? WHERE id=?";
				const data3 = detalle.map((item) => [item.quantity, item.product_id]);
				data3.forEach(async (item) => {
					await connection.query(query3, item);
				});
			await connection.commit();

			res.status(200).json({ success: true, message: "Salida ha sido agregada.", data });
		
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateStockOut: async (req, res, next) => {
		const { stockoutId, document, document_date, out_type, total_document, detalle } = req.body;
		const connection = await createConnection();
		
		try {
			await connection.beginTransaction();
			const queryUpdateStockOut = "UPDATE stock_out SET document=?, document_date=?,out_type=?, total_document=? WHERE id=?";
			const data = [document, document_date, out_type, total_document, stockoutId];
			await connection.query(queryUpdateStockOut, data);

			const queryUpdateDetail = "UPDATE stock_out_detail SET quantity=?, price=? WHERE id=? AND stockout_id=? AND product_id=?";
			const queryInsertDetail = "INSERT INTO stock_out_detail (stockout_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
			const queryUpdateProduct = "UPDATE product SET stock=(stock + ?) - ? WHERE id=?";
			    
			
				
			const data2 = detalle.map((item) => [item.beforeQuantity, item.quantity, item.price, item.detailId, stockoutId, item.product_id, item.toDelete]);
				
	
			
			for (let item of data2) {
				if (item[6] === true) {
					await connection.query(`UPDATE product SET stock = stock + ? WHERE id = ?`, [item[1], item[5]]);
					await connection.query(`DELETE FROM stock_out_detail WHERE id = ? AND stockout_id = ? AND product_id = ?`, [item[3], stockoutId, item[5]]);
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

					
					         
					if (((stock[0].total_stock_out - item[0]) + item[1]) > (stock[0].total_stock_in)) {
						res.status(400).json({ success: false, message: `No se puede actualizar Id:${stock[0].product_id + " Nombre:" + stock[0].product_name} porque no hay stock suficiente (stock= ${stock[0].actual_stock}).` });
						return;
					}
					
					const [result] = await connection.query(queryUpdateDetail, [item[1], item[2], item[3], item[4], item[5]]);
					if (result.affectedRows === 0) {
						console.log("Insertando nuevo detalle");
						const itemData = [item[4], item[5], item[1], item[2]];
						await connection.query(queryInsertDetail, itemData);
					
					}
					await connection.query(queryUpdateProduct, [item[0], item[1], item[5]]);
				
				
				}
		
			}
			await connection.commit();
			res.status(200).json({ success: true, message: "Salida actualizada.", data });
				
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateStockOutDetailById: async (req, res, next) => {
		
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

	deleteStockOut: async (req, res, next) => {
		const connection = await createConnection();
		const stockoutId = req.body.id;
		try {
			await connection.beginTransaction();
			
				const [stockOut] = await connection.query(`SELECT quantity, product_id
					FROM stock_out_detail
					INNER JOIN stock_out
					ON stock_out_detail.stockout_id = stock_out.id
					WHERE stock_out.id = ?`, [stockoutId]);
					
				for (let item of stockOut) {
					await connection.query(`UPDATE product SET stock = stock + ? WHERE id = ?`, [item.quantity, item.product_id]);
				}
				// Primero elimina los registros relacionados en stock_out_detail
				await connection.query(`
					DELETE stock_out_detail
					FROM stock_out_detail
					JOIN stock_out ON stock_out_detail.stockout_id = stock_out.id
					WHERE stock_out.id = ?`,  [stockoutId]);

				// Luego elimina el registro en stock_out
				await connection.query(`DELETE FROM stock_out WHERE id = ?`, [stockoutId]);

			await connection.commit();
				
			res.status(200).json({ success: true, message: "Salida eliminada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	deleteStockOutDetailById: async (req, res, next) => {
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


export default controllerMantStockOut;
