import "dotenv/config";
import jwt from "jsonwebtoken";

const controllerAuth = (req, res, next) => {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({ success: false, message: "Token no proporcionado." });
		}

		jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
			if (err) {
				req.session.returnTo = req.originalUrl;
				console.log("(Client-auth) error, token no válido");
				return res.status(401).json({ success: false, message: "(Client-auth) token no válido." });
			}

			req.user = decoded;
			console.log(req.user);
			req.session.userId = req.user.id;
			console.log(req.session.userId);

			return res.status(200).json({ success: true, message: "(Client-auth) token válido.", username: req.user.userName, role: req.user.userRole });
		});
	} catch (error) {
		next(error);
	}
};

export default controllerAuth;
