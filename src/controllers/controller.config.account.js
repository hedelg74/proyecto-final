import createConnection from "../../dbconnection/connection.js";

const controllerConfigAccount = async (req, res) => {
	const { name } = req.body;
	const connection = await createConnection();
	try {
	} catch (error) {
		console.error("Ha ocurrido un error: ", error);
		res.status(500);
	}
};

export default controllerConfigAccount;
