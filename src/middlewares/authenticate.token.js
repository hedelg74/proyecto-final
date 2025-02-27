// authMiddleware.js
import "dotenv/config";
import jwt from "jsonwebtoken";

// Middleware para verificar el token
function authenticateToken(req, res, next) {
	const token = req.cookies.token; // Asumimos que cookieParser ya fue usado

	if (!token) {
		req.session.returnTo = req.originalUrl;
		return res.redirect("/login-page");
		//return res.sendStatus(401); // Si no hay token, retornar 401
	}
	// Verifica el token
	jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
		if (err) {
			req.session.returnTo = req.originalUrl;
			console.log("(middleware-auth) error de token");
			return res.redirect("/login-page"); // Redirigir al login si el token ha expirado o erroneo
		}

		// Si el token es válido, almacena la información del usuario en la solicitud
		req.user = decoded;
	});

	next(); // Continúa al siguiente middleware
}

export default authenticateToken;
