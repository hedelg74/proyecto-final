import { showDialog } from "./showdialog.message.js";

let addressArray = [];

async function verifyProfileConfig() {
	try {
		const response = await fetch("/users/personal-data");
		if (!response.ok) {
			if (response.status === 404) {
				showDialog(
					false,
					"Antes de continuar, por favor registrate y completa la configuración de tu perfil. Asegúrate de que todos los campos necesarios estén llenos para poder realizar esta acción.",
				);
			} else {
				const errData = await response.json();
				throw new Error(errData.message + response.statusText);
			}
		}
		const data = await response.json();
		const { name, last_name, phone } = data;
		if (!(name && last_name && phone)) {
			showDialog(false, "Antes de continuar, por favor completa la configuración de tu perfil. Asegúrate de que todos los campos necesarios estén llenos para poder realizar esta acción.");
			return false;
		}
		if (addressArray.length === 0) {
			showDialog(false, "Antes de continuar, por favor completa la configuración de tu perfil. Asegúrate de que todos los campos necesarios estén llenos para poder realizar esta acción.");
			return false;
		}
		return true;
	} catch (error) {
		console.error(error);
	}
}

async function loadAddress() {
	try {
		const response = await fetch("/user/load-address");
		if (!response.ok) {
			const errData = await response.json();
			throw new Error(errData.message + response.statusText);
		}
		const data = await response.json();
		if (data) {
			addressArray = data.map((obj) => ({
				obj,
			}));
			addAddressOption(addressArray);
			searchDefaultAddress(addressArray);
		}
	} catch (error) {
		console.error(error);
	}
}

function addAddressOption(addresses) {
	const selectElement = document.getElementById("address-options");

	addresses.forEach((address) => {
		const nuevaOpcion = document.createElement("option");
		nuevaOpcion.value = address.obj.id;
		nuevaOpcion.textContent = address.obj.type;
		selectElement.appendChild(nuevaOpcion);
	});
}

function searchDefaultAddress(addresses) {
	const defaultAddress = addresses.find((address) => address.obj.is_default);
	if (defaultAddress) {
		const selectAddress = document.getElementById("address-options");
		const option = Array.from(selectAddress.options).find((option) => option.text === defaultAddress.obj.type);

		if (option) {
			option.selected = true; // Marcar la opción como seleccionada
		}
	}
}

document.addEventListener("DOMContentLoaded", await loadAddress);

/*--------------------------------------------------------------------------
	# Manejador del evento 'submit' del formulario
--------------------------------------------------------------------------------*/

document.querySelector("form").addEventListener("submit", handleFormSubmit);

// Función principal para manejar el envío del formulario
async function handleFormSubmit(event) {
	event.preventDefault();
	if (await verifyProfileConfig()) {
		const formData = new FormData(event.target);
		const formObject = Object.fromEntries(formData);
		const cartItems = getCartItemss();
		const completedData = combineFormDataAndCart(formObject, cartItems);

		sendDataToServer(completedData);
	}

	// Obtener los elementos del carrito desde localStorage
	function getCartItemss() {
		return JSON.parse(localStorage.getItem("cartItems")) || [];
	}

	// Combinar los datos del formulario y del carrito
	function combineFormDataAndCart(formObject, cartItems) {
		return {
			formObject, // Datos del formulario
			cartItems, // Datos del carrito
		};
	}

	// Enviar los datos al servidor usando fetch
	function sendDataToServer(data) {
		return fetch("/process-order", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (!response.ok) {
					response.json().then((errData) => {
						throw new Error(errData.message + response.statusText);
					});
				}
				localStorage.removeItem("cartItems"); // Descomentar para vaciar el carrito
				window.location.href = "/thankyou.html";
			})
			.catch((error) => {
				console.error(error);
				showDialog(false, error.message);
			});
	}
}
