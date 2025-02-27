// Función para sincronizar el carrito de localStorage con el servidor al cargar la página
export function syncCartWithServer() {
	const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

	fetch("/sync-cart", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ cartItems }),
	})
		.then((response) => {
			response.json().then((data) => {
				if (!response.ok) {
					throw new Error(data.message + response.statusText);
				}
			});
		})
		.catch((error) => {
			console.error(error);
		});
}

// Llama a la función cada vez que la página se cargue
document.addEventListener("DOMContentLoaded", function () {
	syncCartWithServer();
});
