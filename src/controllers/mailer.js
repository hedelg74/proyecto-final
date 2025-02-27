// mailer.js
import "dotenv/config";
import nodemailer from "nodemailer";

// Authentication parameters using environment variables
const senderEmail = process.env.GMAIL_MAIL; // Your email address
const senderPassword = process.env.GMAIL_PASSWORD; // Your email password

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

// Function to send confirmation email
const sendOrderConfirmationEmail = async (customerInfo, sendingAddress, cartItems, orderId) => {
	const transporter = await createTransporter();
	const recipientEmail = customerInfo[0].email;
	const emailSubject = `Arte-ttuckler - Confirmación de tu pedido #${orderId}`;

	const now = new Date();
	const formattedDateTime = now.toLocaleDateString() + " " + now.toLocaleTimeString();

	let shippingCost = 0.0,
		subTotal = 0.0,
		totalAmount = 0.0;

	let emailBody = `
  <p><strong>Gracias por tu pedido en Arte-ttuckler.</strong><hr>
  A continuación, te proporcionamos los detalles de tu compra:
  <br><br>
  <strong>Número de pedido: ${orderId}</strong><br>
  Fecha del pedido: ${formattedDateTime}<br>
  Método de pago: Transferencia bancaria, Simpe, Paypal.
  <br><br>
  <strong>Dirección de envío:</strong><br>
  ${customerInfo[0].name + " " + customerInfo[0].last_name}<br>
  ${sendingAddress[0].address_line1}<br>
  ${sendingAddress[0].address_line2}<br>
  ${sendingAddress[0].city}, ${sendingAddress[0].postal_code}, ${sendingAddress[0].state}, ${sendingAddress[0].country}<br>
  Teléfono: ${customerInfo[0].phone}
  <br><br>
  <strong>Productos pedidos:</strong>
  <table style="width: 80%; margin: 20px 0; font-size: 12px; font-family: Arial, sans-serif; border-collapse: collapse;">
      <thead style="background:gray; color:white;">
        <tr>
          <th>Imagen</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody style="border-bottom:solid 1px gray">`;

	// Loop through the cart items to add to the email body
	cartItems.forEach((item, index) => {
		emailBody += `<tr>
      <td style="text-align:center;"><img src="cid:image${index}" alt="${item.title}" style="width: 36px; height: 36px;"></td>
      <td style="text-align:center;">${item.title}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">$ ${item.price}</td>
     </tr>`;
		subTotal += Number(item.price);
	});

	totalAmount = subTotal + shippingCost;

	emailBody += `
  </tbody>
  <tfoot>
    <tr style="font-weight:bold;"><td>Subtotal</td><td colspan="3" style="text-align:right";>$ ${subTotal.toFixed(2)}</td></tr>
    <tr style="font-weight:bold;"><td>Envío</td><td colspan="3" style="text-align:right;">$ ${shippingCost.toFixed(2)}</td></tr>
    <tr style="font-weight:bold;"><td>Total</td><td colspan="3" style="text-align:right";>$ ${totalAmount.toFixed(2)}</td></tr>
  </tfoot>
  </table>
  <br><hr>
  <strong>Estado del pedido: Confirmado &#10004;</strong>
  <br><br>
  <strong style="background-color: yellow;">*** Pronto nos pondremos en contacto contigo para acordar la forma de pago y envío.</strong><br>
  Si tienes alguna duda o necesitas realizar alguna modificación en tu pedido, no dudes en contactarnos a <a href="mailto:hdelgados@gmail.com">hdelgados@gmail.com</a> <br>
  o llamando al +506-7218-7581.<br><br>
  <strong>Gracias nuevamente por tu compra.</strong><br>
  <br><br>
  Atentamente,<br>
  Arte-ttuckler<br>
  Email: <a href="mailto:hdelgados@gmail.com">hdelgados@gmail.com</a><br>
  Teléfono: +506-7218-7581<br>
  Sitio web: <a href="http://www.arte-ttucler.com">www.arte-ttuckler.com</a>
  </p>
  `;

	const mailOptions = {
		from: senderEmail,
		to: [recipientEmail, senderEmail],
		subject: emailSubject,
		html: emailBody,
		attachments: cartItems.map((item, index) => ({
			filename: item.title,
			path: item.image_path,
			cid: `image${index}`,
		})),
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Correo enviado exitosamente");
	} catch (error) {
		console.error("Error al enviar el correo:", error);
		throw error;
	}
};

export default sendOrderConfirmationEmail;
