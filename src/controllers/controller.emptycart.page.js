import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerEmptyCartPage = {
	renderEmptyCartPage: (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/emptycart.html"));
	},
};

export default controllerEmptyCartPage;
