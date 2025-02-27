// server.js
import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "path";

import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

import routerAddress from "./src/routes/route.address.js";
import routeAdminPanelPage from "./src/routes/route.admin.panel.page.js";
import routerAuth from "./src/routes/route.auth.js";
import routerConfigAccount from "./src/routes/route.config.account.js";
import routerEmptyCartPage from "./src/routes/route.emptycart.page.js";
import routerForgotPassword from "./src/routes/route.forgot.password.js";
import routerHomePage from "./src/routes/route.home.page.js";
import routerLogin from "./src/routes/route.login.js";
import routerLogOut from "./src/routes/route.logout.js";
import routerOrderPage from "./src/routes/route.order.page.js";
import routerProcessOrder from "./src/routes/route.process.order.js";
import routeProducts from "./src/routes/route.products.js";
import routerProfilePage from "./src/routes/route.profile.page.js";
import routerResetPassword from "./src/routes/route.reset.password.js";
import routerSetPassword from "./src/routes/route.set.password.js";
import routerSignUp from "./src/routes/route.signup.js";
import routerSyncCart from "./src/routes/route.syncart.js";
import routerUser from "./src/routes/route.user.js";
import routerMainMenu from "./src/routes/router.mainmenu.js";
import routerMantProducts from "./src/routes/router.mant.products.js";
import routerMantCategory from "./src/routes/router.mant.category.js";
import routerMantSubCategory from "./src/routes/router.mant.subcategory.js";
import routerMantStockIn from "./src/routes/router.mant.stockin.js";
import routerMantStockOut from "./src/routes/router.mant.stockout.js"

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(cookieParser());

import bodyParser from 'body-parser';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//app.use(express.json());
//app.use(express.urlencoded({ extended: true })); // Middleware para manejar datos enviados por formularios

app.use(
	session({
		secret: process.env.SESSION_SECRET_KEY,
		resave: false, // Evitar gurdar la seccion si no hay cambios
		saveUninitialized: true, // Guarda la session aunque no este inicializada
		cookie: { secure: false }, // Configura secure: true si estás usando HTTPS
	}),
);

app.set("view engine", "ejs"); // Configurar EJS como motor de plantillas
app.set("views", path.join(__dirname, "views")); // Configurar la carpeta donde estarán las vistas (por defecto es ./views)

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules/intl-tel-input/build"))); // , Servir los archivos estáticos (intl-tel-input)
app.use(express.static(path.join(__dirname, "node_modules/html5-qrcode")));


app.use(routerMainMenu);
app.use(routerSyncCart);
app.use(routerAuth);
app.use(routerLogin);
app.use(routerSignUp);
app.use(routerLogOut);
app.use(routerForgotPassword);
app.use(routerResetPassword);
app.use(routerSetPassword);
app.use(routerUser);
app.use(routerAddress);
app.use(routerConfigAccount);

app.use(routeProducts);
app.use(routerProcessOrder);
app.use(routerMantProducts);
app.use(routerMantCategory);
app.use(routerMantSubCategory);
app.use(routerMantStockIn);
app.use(routerMantStockOut);
app.use(routerHomePage);
app.use(routerEmptyCartPage);
app.use(routerOrderPage);
app.use(routerProfilePage);
app.use(routeAdminPanelPage);


app._router.stack.forEach((r) => {
  if (r.route) {
    console.log(r.route.path);
  }
});

// Middleware para manejo de rutas no encontradas (404)
app.use((req, res, next) => {
	const error = new Error("Ruta no encontrada");
	error.status = 404;
	next(error); // Pasa el error al siguiente middleware
});

// Middleware centralizado para manejo de errores
app.use((error, req, res, next) => {
	const status = error.status || 500;
	const message = error.message || "Algo salió mal en el servidor";

	console.error(error);
	// Si el error es 404, muestra la página personalizada 404.html
	if (status === 404) {
		res.status(404).sendFile(path.join(__dirname, "./public/404.html")); // Ruta hacia tu archivo 404.html
	} else {
		// Si no es un error 404, devuelve un mensaje en formato JSON
		res.status(status).json({ success: false, message: message });
	}
});

/*app.use((req, res) => {
	res.sendFile(path.join(__dirname, "./public/404.html")); //Servimmos page 404.html
});*/

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
