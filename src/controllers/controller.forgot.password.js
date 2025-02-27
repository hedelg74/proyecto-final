import crypto from "crypto";
import "dotenv/config";
import nodemailer from "nodemailer";
import createConnection from "../../dbconnection/connection.js";

const controllerForgotPasssword = async (req, res) => {
	const userEmail = req.body.email;
	const expirationTime = new Date(Date.now() + 86400000); // expires in one day
	const token = crypto.randomBytes(32).toString("hex");
	const connection = await createConnection();

	try {
		const query = "SELECT username, name, last_name FROM users WHERE email=?";
		const [user] = await connection.query(query, [userEmail]);
		if (user.length > 0) {
			const query = "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?";
			await connection.query(query, [token, expirationTime, userEmail]);
			const name = user[0].name + " " + user[0].last_name;
			await sendPasswordResetEmail(name, userEmail, `https://f0e0-190-113-102-47.ngrok-free.app/reset-password?token=${token}`);

			return res.render("./message.ejs", {
				message: {
					header: "Informacion",
					body: "Se ha enviado un correo de recuperacion a: ",
					email: userEmail,
					link: "/login",
					page: "<i class='bi bi-person text-[#15cfc6]'></i>Iniciar Sesion",
				},
			});
		} else {
			throw new Error("Error: Al recuperar datos de usuario.");
		}
	} catch (e) {
		console.log("Ha ocurrido un error: ", e);
		return res.render("./message.ejs", {
			message: {
				header: "Informacion",
				body: "Ha ocurrido un error al enviar correo de recuperacion de contrasena.",
				email: "",
				link: "/",
				page: "Inicio",
			},
		});
	} finally {
		await connection.end();
	}
};

export default controllerForgotPasssword;

// Authentication parameters using environment variables
const senderEmail = process.env.GMAIL_MAIL;
const senderPassword = process.env.GMAIL_PASSWORD;

// Create and configure the transporter with email credentials
async function createTransporter() {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "login",
			user: senderEmail,
			pass: senderPassword,
		},
	});

	return transporter;
}

async function sendPasswordResetEmail(name, email, url) {
	const transporter = await createTransporter();
	const clientName = name;
	const recipientEmail = email;
	const emailSubject = "Arte-ttuckler - Recuperacion de contrasena";

	//const now = new Date();
	//const formattedDateTime = now.toLocaleDateString() + " " + now.toLocaleTimeString();

	let emailBody = `
    <h1>Hola ${clientName},</h1>

    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no solicitaste este cambio, simplemente puedes ignorar este correo.

    Para restablecer tu contraseña, haz clic en el siguiente enlace:

    <a href="${url}">${url}</a><br>

    Este enlace es válido por <strong>24 horas</strong>. Después de este tiempo, deberás solicitar una nueva recuperación.

    Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en ponerte en contacto con nuestro soporte.<br><br>

    Gracias,<br>
    Atentamente,<br>
    <strong>Arte-ttuckler</strong><br>
    Email: <a href="mailto:hdelgados@gmail.com">hdelgados@gmail.com</a><br>
    Teléfono: +506-7218-7581<br>
    Sitio web: <a href="http://www.arte-ttucler.com">www.arte-ttuckler.com</a>
    </p>
    `;

	const mailOptions = {
		from: senderEmail,
		to: [recipientEmail],
		subject: emailSubject,
		html: emailBody,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Correo enviado exitosamente");
	} catch (error) {
		console.error("Error al enviar el correo:", error);
		throw error;
	}
}
