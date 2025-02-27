import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerProfilePage = {
	renderPage: (req, res) => {
		console.log(req.session.userId);
		res.sendFile(path.join(__dirname, "../../public/profile.html"));
	},
};

export default controllerProfilePage;
