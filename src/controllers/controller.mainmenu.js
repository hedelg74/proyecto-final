import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerMainMenu = {
	renderMainMenu: (req, res) => {
		res.sendFile(path.join(__dirname, "../../public/menu.html"));
	},
};

export default controllerMainMenu;
