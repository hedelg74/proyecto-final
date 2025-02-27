import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import createConnection from "../../dbconnection/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerLogin = {
	login: async (req, res, next) => {
		const { email, password } = req.body;
		const connection = await createConnection();
		const query = "SELECT * FROM users WHERE email = ? AND is_active = 1";
		try {
			const [user] = await connection.query(query, [email]);
			if (user.length === 0) {
				return res.status(401).json({ message: "Email o contrasena no validos o no está activado." });
			}
			// Comparar la contraseña ingresada con el hash almacenado
			if (await bcrypt.compare(password, user[0].password_hash)) {
				const token = generateToken(user[0].id, user[0].username, user[0].role); // Generar un token, payload con user id y name

				res.cookie("token", token, {
					httpOnly: true, // No accesible desde JavaScript del lado del cliente
					secure: false, //true, // Solo se envía a través de HTTPS
					sameSite: "Strict", // Restringe el envío de cookies en solicitudes cruzadas
					maxAge: 3600000, // Establece la duración de la cookie (1 hora en milisegundos)
				});

				req.session.userId = user[0].id;
				const redirectTo = req.session.returnTo || "/";
				console.log("Redirecting to: ", redirectTo);
				delete req.session.returnTo;

				return res.status(200).json({ redirect: redirectTo, username: user[0].username, role: user[0].role });
			} else {
				return res.status(401).json({ success: false, message: "Email o contrasena no validos." });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	renderLoginPage: (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/login.html"));
	},
};

function generateToken(userId, userName, userRole) {
	const token = jwt.sign({ id: userId, userName: userName, userRole: userRole }, process.env.JWT_SECRET_KEY, {
		expiresIn: "1h",
	});
	return token;
}

export default controllerLogin;
