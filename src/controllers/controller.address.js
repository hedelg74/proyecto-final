import createConnection from "../../dbconnection/connection.js";
//	id	user_id	type	address_line1	address_line2	city	state	postal_code	country	is_default	created_at

const controllerAddress = {
	loadAddress: async (req, res, next) => {
		const connection = await createConnection();
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		try {
			const query = "SELECT * FROM address WHERE user_id=?";

			const [data] = await connection.query(query, userId);
			if (data.length > 0) {
				res.status(200).json(data);
			} else {
				res.status(404).json({ success: false, message: "No hay direcciones para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addAddress: async (req, res, next) => {
		const { type, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
		const connection = await createConnection();
		const date = new Date(Date.now());
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		try {
			if (!(await validateAddress(undefined, userId, type))) {
				const query = "INSERT INTO address (user_id, type, address_line1, address_line2, city, state, postal_code, country, is_default, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)";
				const datos = [userId, type, addressLine1, addressLine2, city, state, postalCode, country, isDefault, date];
				await connection.query(query, datos);
				res.status(200).json({ success: true, message: "Direccion de envio agegada." });
			} else {
				res.status(409).json({ success: false, message: "Direccion ya existe." });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updateAddress: async (req, res, next) => {
		const { type, addressLine1, addressLine2, city, state, postalCode, country, isDefault, addressId } = req.body;
		const connection = await createConnection();
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		try {
			if (!(await validateAddress(addressId, userId, type))) {
				if (isDefault) {
					await connection.query("UPDATE address SET is_default=NULL WHERE user_id=?", [userId]);
				}
				console.log("actualizadno");
				const query = "UPDATE address SET type=?, address_line1=?, address_line2=?, city=?, state=?, postal_code=?, country=?, is_default=? WHERE id=? AND user_id=?";
				const datos = [type, addressLine1, addressLine2, city, state, postalCode, country, isDefault, Number(addressId), userId];

				await connection.query(query, datos);
				res.status(200).json({ success: true, message: "Direccion de envio actualizada." });
			} else {
				res.status(409).json({ success: false, message: "Direccion ya existe." });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
};

async function validateAddress(addressId, userId, type) {
	const connection = await createConnection();
	const query = "SELECT * FROM address WHERE user_id=? AND type=?";
	try {
		const [address] = await connection.query(query, [userId, type]);

		if (address.length > 0) {
			if (addressId !== undefined) {
				if (addressId != address[0].id) {
					return true; //Ya existe otra direccion del mismo tipo
				} else return false;
			} else return true;
		} else return false;
	} catch (error) {
		throw new Error(error.message || "Error al validar la dirección");
	} finally {
		await connection.end();
	}
}

export default controllerAddress;
