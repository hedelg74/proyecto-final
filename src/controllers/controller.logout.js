const controllerLogOut = (req, res, next) => {
	try {
		// Eliminar la cookie llamada 'token'
		res.clearCookie("token", {
			httpOnly: true,
			secure: true,
			sameSite: "Strict",
			path: "/", // Asegúrate de que coincida con las opciones de la cookie original
		});

		// Opcional: destruir la sesión si estás usando sesiones basadas en cookies
		req.session = null;

		res.status(200).send({ success: true, message: "Logout exitoso" });
	} catch (error) {
		// Manejo de error
		next(error);
	}
};

export default controllerLogOut;
