import bcrypt from "bcrypt";
import createConnection from "../../dbconnection/connection.js";

const controllerSignUp = {
	registerUserAccount: async (req, res, next) => {
		const { username, email, password } = req.body;
		const connection = await createConnection();
		const passwordHash = await bcrypt.hash(password, 10);
		const query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
		try {
			await connection.query(query, [username, email, passwordHash]);
			res.status(200).json({ success: true, message: "Cuenta ha sido creada con exito." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
};

export default controllerSignUp;
