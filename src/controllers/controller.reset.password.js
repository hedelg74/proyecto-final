import createConnection from "../../dbconnection/connection.js";

const controllerResetPassword = async (req, res) => {
	const { token } = req.query;
	const connection = await createConnection();
	try {
		const query = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()";
		const [result] = await connection.query(query, [token]);

		if (result.length === 0) {
			res.render("./message.ejs", {
				message: {
					header: "Informacion",
					body: "El enlace de recuperación es inválido o ha expirado",
					link: "/",
					page: "Inicio",
				},
			});
			return res.status(400);
		}

		// Mostrar formulario para nueva contraseña
		res.render("./set-password.ejs", { token });
	} catch (error) {
		console.error("Ha ocurrido un error: ", error);
		return res.status(500);
	} finally {
		await connection.end();
	}
};

export default controllerResetPassword;
