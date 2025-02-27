import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerOrderPage = {
	renderOrderPage: (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/order.html"));
	},
};

export default controllerOrderPage;
