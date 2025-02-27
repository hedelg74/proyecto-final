import { showDialog } from "./showdialog.message.js";

async function loadMainMenu() {
	return fetch("/main-menu", { method: "GET" })
		.then(async (response) => {
			if (!response.ok) {
				return response.json().then((data) => {
					throw new Error(`${data.message} ${response.statusText}`);
				});
			}
			return response.text();
		})
		.then((data) => {
			document.getElementById("main-menu").innerHTML = data;
			window.dispatchEvent(new Event("menuLoaded"));
		})

		.catch((error) => {
			console.error("Failed to load main menu:", error);
			showDialog(false, error.message);
		});
}

async function loadMenuAndScript() {
  await loadMainMenu(); // Carga el menú
  const script = document.createElement('script');
  script.src = './js/login.js';
  document.body.appendChild(script);
}

loadMenuAndScript();
