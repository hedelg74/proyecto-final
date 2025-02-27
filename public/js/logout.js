import { showDialog } from "./showdialog.message.js";

window.addEventListener("menuLoaded", () => {
	document.getElementById("logout").addEventListener("click", logOut);

	function logOut() {
		fetch("/logout", {
			method: "POST",
			credentials: "same-origin", // Incluye las cookies de la sesión en la solicitud
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					response.json().then((data) => {
						throw new Error(data.message + response.statusText);
					});
				} else {
					document.getElementById("profile").classList.toggle("hidden");
					document.getElementById("line-1").classList.toggle("hidden");
					document.getElementById("account").classList.toggle("hidden");

					document.getElementById("line-2").classList.toggle("hidden");
					document.getElementById("loginForm").classList.toggle("hidden");
					document.getElementById("logout").classList.toggle("hidden");
					document.getElementById("session-status").textContent = "Login";
					document.getElementById("line-3").classList.toggle("hidden");

					document.getElementById("signup").classList.toggle("hidden");
					document.getElementById("forgot-pwd").classList.toggle("hidden");

					console.log("Logout exitoso.");
				}
			})
			.catch((error) => {
				console.error(error);
				showDialog(false, error.message);
			});
	}
});
