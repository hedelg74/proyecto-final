
	document.querySelector("#loginForm").addEventListener("submit", handleFormSubmit);

	async function handleFormSubmit(event) {
		event.preventDefault();

		const formData = new FormData(event.target);
		const formObject = Object.fromEntries(formData);

		fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formObject),
		})
			.then(async(response) => {
				if (!response.ok) {
					return response.json().then((data) => {
						const logErrMsg = document.getElementById("login-error-message");
						logErrMsg.textContent = data.message;
						logErrMsg.classList.remove("hidden");
						setTimeout(() => {
							logErrMsg.classList.toggle("hidden");
						}, 3000);
						throw new Error(data.message + response.statusText); // Para otros errores
					});
				}
				return response.json();
			})
			.then((data) => {
				
				if (data && data.redirect) {
					if (window.location.pathname === "/") {
						document.getElementById("profile").classList.toggle("hidden");
						document.getElementById("profile").classList.toggle("block");

						document.getElementById("line-1").classList.toggle("hidden");
						document.getElementById("account").classList.toggle("hidden");
						document.getElementById("account").classList.toggle("block");
						if (data.role === "admin") {
							document.getElementById("admin-panel").classList.toggle("hidden");
							document.getElementById("admin-panel").classList.toggle("block");
						}

						document.getElementById("line-2").classList.toggle("hidden");
						document.getElementById("loginForm").classList.toggle("hidden");

						document.getElementById("logout").classList.toggle("hidden");
						document.getElementById("logout").classList.toggle("block");

						document.getElementById("session-status").textContent = data.username;
						document.getElementById("line-3").classList.toggle("hidden");

						document.getElementById("signup").classList.toggle("hidden");
						document.getElementById("forgot-pwd").classList.toggle("hidden");

						document.getElementById("loginForm").reset(); // Limpiar el formulario
					} else {
						window.location.href = data.redirect; // Redirigir manualmente
					}
				}
			})
			.catch((error) => console.error(error));
	}

