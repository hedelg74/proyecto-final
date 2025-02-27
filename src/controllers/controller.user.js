import bcrypt from "bcrypt";
import createConnection from "../../dbconnection/connection.js";

const controllerUser = {
	loadPersonalData: async (req, res, next) => {
		const connection = await createConnection();
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		try {
			const query = "SELECT * FROM users WHERE id=?";

			const [data] = await connection.query(query, userId);
			if (data.length > 0) {
				res.status(200).json(...data);
			} else {
				res.status(404).json({ success: false, message: "No hay usuarios para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	updatePersonalData: async (req, res, next) => {
		const { name, "last-name": lastName, "phone-number": phone } = req.body;

		const connection = await createConnection();
		const date = new Date(Date.now());
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		const query = "UPDATE users SET name=?, last_name=?, phone=?, updated_at=? WHERE id=?";
		const datos = [name, lastName, phone, date, userId];
		try {
			await connection.query(query, datos);
			res.status(200).json({ success: true, message: "Tus datos han sido actualizados." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	updatePassword: async (req, res, next) => {
		const { password } = req.body;
		const connection = await createConnection();
		const date = new Date(Date.now());
		const userId = req.session.userId;

		if (!userId) {
			return res.status(401).send("No autorizado");
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const query = "UPDATE users SET password_hash=?, updated_at=? WHERE id=?";
		const datos = [passwordHash, date, userId];

		try {
			await connection.query(query, datos);
			res.status(200).json({ success: true, message: "Contrasena actualizada." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadUserList: async (req, res, next) => {
		const connection = await createConnection();

		try {
			const query = "SELECT * FROM users";

			const [data] = await connection.query(query);
			
			res.render("./partials/list.users.ejs", { data });
			
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	loadUserById: async (req, res, next) => {
		const connection = await createConnection();
		const userId = req.body.id;
		

		try {
			const query = "SELECT * FROM users WHERE id=?";

			const [data] = await connection.query(query, [userId]);
			if (data.length > 0) {
				res.status(200).json(...data);
			} else {
				res.status(404).json({ success: false, message: "No hay usuarios para mostrar" });
			}
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	updateUser: async (req, res, next) => {
		const { id, username, email, name, last_name, phone, role, is_active  } = req.body;
		const connection = await createConnection();
		const date = new Date(Date.now());

		//const passwordHash = await bcrypt.hash(password, 10);
		const query = "UPDATE users SET username=?, email=?, name=?, last_name=?, phone=?, role=?, is_active=?, updated_at=? WHERE id=?";
		const data = [username, email, name, last_name, phone, role, is_active, date, id];

		try {
			await connection.query(query, data);
			res.status(200).json({ success: true, message: "Usuario ha sido actualizado con exito.", data});
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},

	addUser: async (req, res, next) => {
		const { username, password, email, name, last_name, phone, role, is_active  } = req.body;
		const connection = await createConnection();
		const date = new Date(Date.now());
		console.log(password)
		const passwordHash = await bcrypt.hash(password, 10);
		const query = "INSERT INTO users (username, email, password_hash, name, last_name, phone, created_at, role, is_active, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		const data = [username, email, passwordHash, name, last_name, phone, date, role, is_active, date];

		try {
			await connection.query(query, data);
			const [user] = await connection.query("SELECT LAST_INSERT_ID() as user_id");
			const user_id = user[0].user_id;
			data.unshift(user_id);
			res.status(200).json({ success: true, message: "Usuario ha sido creado con exito.", data});
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	},
	deleteUser: async (req, res, next) => {
		const connection = await createConnection();
		const userId = req.body.id;
		try {
			
			const query = "DELETE FROM users WHERE id=?";
			await connection.query(query, [userId]);
			res.status(200).json({ success: true, message: "Usuario eliminado." });
		} catch (error) {
			next(error);
		} finally {
			await connection.end();
		}
	}

}

		
	


export default controllerUser;
