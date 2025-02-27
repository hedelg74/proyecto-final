import path from "path";
import { fileURLToPath } from "url";
//import conn from "../../dbconnection/connection.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerHomePage = {
	renderHomePage: (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/index.html"));
	},
};

export default controllerHomePage;
