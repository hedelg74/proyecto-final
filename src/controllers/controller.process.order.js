// orderProcessor.js
import createConnection from "../../dbconnection/connection.js";
import sendOrderConfirmationEmail from "./mailer.js";

const processOrder = async (req, res, next) => {
	const {
		formObject: { address: addressId },
		cartItems,
	} = req.body;
	const userId = req.session.userId;
	const connection = await createConnection();
	const created_at = new Date(Date.now());

	const total = cartItems.reduce((accumulator, item) => {
		return accumulator + item.quantity * item.price;
	}, 0);

	if (!userId) {
		return res.status(401).send("No autorizado");
	}

	try {
		const [customerInfo] = await connection.query("SELECT * FROM users WHERE id=?", [userId]);
		const [sendingAddress] = await connection.query("SELECT * FROM address WHERE user_id=? AND id=?", [userId, Number(addressId)]);

		// Insert order linked to the customer
		const values = [userId, created_at, sendingAddress[0].id, total];
		await connection.query("INSERT INTO orders (user_id, created_at, address_id, order_total) VALUES (?,?,?,?)", values);

		// Retrieve the last inserted order ID
		const [order] = await connection.query("SELECT LAST_INSERT_ID() as order_id");

		if (order.length > 0) {
			const orderId = order[0].order_id;
			const orderItemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)`;

			for (const item of cartItems) {
				const orderItemsValues = [orderId, item.id, item.quantity, item.price];
				await connection.query(orderItemsQuery, orderItemsValues);
			}

			// Send the order confirmation email
			await sendOrderConfirmationEmail(customerInfo, sendingAddress, cartItems, orderId);

			res.status(200).json({ success: true, message: "Tu pedido se ha procesado con exito." });
		} else {
			res.status(404).json({ success: false, message: "Orden no encontrada" });
		}
	} catch (error) {
		next(error);
	} finally {
		await connection.end();
	}
};

export default processOrder;
