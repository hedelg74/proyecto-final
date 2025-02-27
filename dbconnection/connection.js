// config/connection.js
import "dotenv/config";
import mysql2 from "mysql2/promise";

const createConnection = async () => {
	try {
		const connection = await mysql2.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: process.env.DB_PORT,
			//connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
			//queueLimit: process.env.DB_QUEUE_LIMIT || 0
		});

		/* const connection = createConnection({
      host: process.env.CLEARDB_DATABASE_URL ? process.env.CLEARDB_DATABASE_URL.split('@')[1].split('/')[0] : 'localhost',
      user: process.env.CLEARDB_DATABASE_URL ? process.env.CLEARDB_DATABASE_URL.split(':')[1].split('@')[1] : 'root',
      password: process.env.CLEARDB_DATABASE_URL ? process.env.CLEARDB_DATABASE_URL.split(':')[2].split('@')[0] : 'Hedel1974#',
      database: process.env.CLEARDB_DATABASE_URL ? process.env.CLEARDB_DATABASE_URL.split('/')[1] : 'arte_tucklerdb',
      port: 3306, // El puerto por defecto para MySQL
    }); */
		console.log("Conectado a la base de datos");
		return connection;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};

export default createConnection;
