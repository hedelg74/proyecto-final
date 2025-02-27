import { showDialog } from "./showdialog.message.js";

/*---------------------------------------------------------------------
	#USERS LOAD-RU
-----------------------------------------------------------------------*/

async function loadUser() {
	try {
		const response = await fetch("/users/personal-data");
		if (!response.ok) {
			const errData = await response.json();
			throw new Error(errData.message + response.statusText);
		}
		const data = await response.json();
		if (data) fillUserForm(data);
	} catch (error) {
		console.error(error);
	}
}

function fillUserForm(userData) {
	const { name, last_name, phone } = userData;
	document.getElementById("name").value = name;
	document.getElementById("last-name").value = last_name;
	window.itiInstance.setNumber(phone);
	//document.getElementById("phone-number").value = phone;
}

document.getElementById("form-profile").addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const formObject = Object.fromEntries(formData);
	formObject["phone-number"] = window.itiInstance.getNumber();

	try {
		const response = await fetch("/users/profile", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formObject),
		});
		if (!response.ok) {
			const errData = await response.json();
			throw new Error(errData.message + response.statusText);
		}
		const data = await response.json();
		if (data) showDialog(data.success, data.message);
	} catch (error) {
		console.error(error);
		showDialog(false, error.message);
	}
});

/*-----------------------------------------------------------------------
	#USER CHANGE-PASSWORD-U
-------------------------------------------------------------------------*/

document.getElementById("form-password").addEventListener("submit", async (event) => {
	event.preventDefault();
	const inputPassword = document.getElementById("password");
	const inputConfirmPassword = document.getElementById("confirm-password");

	if (inputPassword.value !== inputConfirmPassword.value) {
		showDialog(false, "Las contraseñas no coinciden");
		return;
	}

	const formData = new FormData(event.target);
	try {
		const response = await fetch(`/user/password`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(Object.fromEntries(formData)),
		});
		if (!response.ok) {
			const errData = await response.json();
			throw new Error(errData.message + response.statusText);
		}
		const data = await response.json();
		if (data) showDialog(data.success, data.message);
	} catch (error) {
		console.error(error);
		showDialog(false, error.message);
	}
});

/*-------------------------------------------------------------------------------
	#ADDRESSES LOAD-CRU
-------------------------------------------------------------------------------*/

let addressArray = [];
let addressOptionsHasChanged = false;
let initialDataLoad = false;

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
			if (!initialDataLoad) searchDefaultAddress(addressArray);
			initialDataLoad = true;
		}
	} catch (error) {
		console.error(error);
	}
}

function addAddressOption(addresses) {
	const selectElement = document.getElementById("address-options");
	removeOptions(selectElement);
	addresses.forEach((address) => {
		const nuevaOpcion = document.createElement("option");
		nuevaOpcion.value = address.obj.id;
		nuevaOpcion.textContent = address.obj.type;
		selectElement.appendChild(nuevaOpcion);
	});
	if (!addressOptionsHasChanged) {
		selectElement.selectedIndex = 0;
	} else {
		const inputAddressType = document.getElementById("address-type");
		const option = Array.from(selectElement.options).find((option) => option.text === inputAddressType.value);

		if (option) {
			option.selected = true; // Marcar la opción como seleccionada
		}
	}
}

function removeOptions(selectElement) {
	const options = selectElement.options;

	for (let i = options.length - 1; i > 0; i--) {
		selectElement.remove(i);
	}
}

function searchDefaultAddress(addresses) {
	const defaultAddress = addresses.find((address) => address.obj.is_default);
	fillAddressForm(defaultAddress || addresses[0]);
}

function searchAddressByType(addresses, addressId) {
	const address = addresses.find((address) => address.obj.id == addressId);
	fillAddressForm(address);
}

function fillAddressForm(address) {
	const { id, is_default, type, address_line1, address_line2, city, state, country, postal_code } = address.obj;
	document.getElementById("address-id").value = id;
	document.getElementById("isDefault").checked = Boolean(is_default);
	document.getElementById("address-type").value = type;
	document.getElementById("address_line1").value = address_line1;
	document.getElementById("address_line2").value = address_line2;
	document.getElementById("city").value = city;
	document.getElementById("state").value = state;
	document.getElementById("country").value = country;
	document.getElementById("postal-code").value = postal_code;
}

document.getElementById("address-options").addEventListener("change", (e) => {
	const addressId = e.target.value;
	addressOptionsHasChanged = true;
	searchAddressByType(addressArray, addressId);
});

document.addEventListener("DOMContentLoaded", () => {
	loadUser();
	loadAddress();
});

document.querySelector("#form-address").addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const formObject = Object.fromEntries(formData);
	switch (event.submitter.id) {
		case "add":
			if (event.submitter.textContent === "Guardar") {
				document.querySelector("#form-address").removeAttribute("novalidate");
				const form = document.querySelector("#form-address");

				// Si la validación pasa, continúa con el proceso
				if (form.checkValidity()) {
					event.submitter.textContent = "Agregar";
					document.getElementById("update").textContent = "Actualizar";
					await addAddress(formObject);
				} else {
					form.reportValidity(); // Esto dispara la validación visualmente y muestra los errores
				}
			} else {
				event.submitter.textContent = "Guardar";
				document.getElementById("update").textContent = "Deshacer";
				document.querySelector("#form-address").setAttribute("novalidate", true);
				document.querySelector("#form-address").reset();
			}
			break;
		case "update":
			if (event.submitter.textContent === "Actualizar") {
				await updateAddress(formObject);
			} else {
				event.submitter.textContent = "Actualizar";
				document.getElementById("add").textContent = "Agregar";
				initialDataLoad = false;
				await loadAddress();
				initialDataLoad = true;
				document.querySelector("#form-address").removeAttribute("novalidate");
			}
			break;
	}
});

async function addAddress(formObject) {
	try {
		const response = await fetch("/user/add-address", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formObject),
		});
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message + response.statusText);
		}
		const data = await response.json();
		if (data) {
			loadAddress();
			showDialog(data.success, data.message);
		}
	} catch (error) {
		console.error(error);
		showDialog(false, error.message);
	}
}

async function updateAddress(formObject) {
	try {
		const response = await fetch("/user/update-address", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formObject),
		});
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message + response.statusText);
		}
		const data = await response.json();
		if (data) {
			loadAddress();
			showDialog(data.success, data.message);
		}
	} catch (error) {
		console.error(error);
		showDialog(false, error.message);
	}
}
