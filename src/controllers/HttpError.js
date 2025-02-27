// Clase de Error personalizado
export class HttpError extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}
