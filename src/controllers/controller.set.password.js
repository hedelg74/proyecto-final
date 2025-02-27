import bcrypt from "bcrypt";
import createConnection from "../../dbconnection/connection.js";

const controllerSetPassword = async (req, res, next) => {
	const { token, password } = req.body;

	const connection = await createConnection();
	try {
		const query = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()";
		const [result] = await connection.query(query, [token]);

		if (result.length === 0) {
			return res.render("./message", {
				message: {
					header: "Informacion",
					body: "El enlace de recuperación es inválido o ha expirado",
					link: "/",
					page: " <i class='bi bi-house-up'></i> Inicio",
				},
			});
		}

		//Hashear la nueva contraseña
		const hashedPassword = await bcrypt.hash(password, 10);

		//Actualizar la contraseña en la base de datos
		const updateQuery = "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = ?";
		await connection.query(updateQuery, [hashedPassword, token]);

		return res.render("./message.ejs", {
			message: {
				header: "Informacion",
				body: "Tu contraseña ha sido restablecida con éxito.",
				link: "/login-page",
				page: "<i class='bi bi-person text-[#15cfc6]'></i>Iniciar Sesion",
			},
		});
	} catch (error) {
		next(error);
	} finally {
		await connection.end();
	}
};

export default controllerSetPassword;
