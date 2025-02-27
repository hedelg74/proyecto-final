import createConnection from "../../dbconnection/connection.js";

async function validateUserAccount(req, res, next) {
	const { username, email } = req.body;
	const connection = await createConnection();
	if (!connection) {
		return res
			.status(500)
			.json({ success: false, message: "Error al conectar a la base de datos." });
	}

	try {
		const query = "SELECT * FROM users WHERE username =? OR email =?";
		const [result] = await connection.query(query, [username, email]);

		// Verificamos si hay usuarios que coinciden
		if (result.length > 0) {
			console.log("Error de validación, cuenta ya existe.");
			return res.status(409).json({
				success: false,
				message: "El usuario o correo ya está registrado.",
				data: req.body,
			});
		}

		// Si no hay usuarios, continuamos
		next();
	} catch (e) {
		console.error("Error al validar cuenta de usuario: ", e.message);
		res.status(500).json({ success: false, message: e.message });
	} finally {
		await connection.end();
	}
}

export default validateUserAccount;
