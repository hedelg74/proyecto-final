/* eslint-disable no-unused-vars */
window.addEventListener("menuLoaded", () => {
	
      const themeToggle = document.querySelector('#theme-toggle');
      const rootElement = document.documentElement;

      if (localStorage.getItem('theme') === 'dark') {
        rootElement.classList.add('dark');
        themeToggle.checked = true;
      }

      themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
          rootElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          rootElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      });
    
	const mainMenu = document.querySelector(".submenu-one");
	const submenuContent = mainMenu.querySelector(".children-one");
	const submenuToggleArrow = mainMenu.querySelector(".bi-chevron-right");
	const divUser = document.getElementById("user");
	const ulDropDown = document.getElementById("dropdown");
	const divCartContainer = document.querySelector(".cart-container");
	const ulSubMenuCart = document.querySelector(".submenu-cart");

	ulSubMenuCart.addEventListener("click", (e) => {
		e.stopPropagation();
	});

	divCartContainer.addEventListener("click", () => {
		if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
			ulSubMenuCart.classList.toggle("hidden");
			
		}
	});

	ulDropDown.addEventListener("click", (e) => {
		e.stopPropagation();
	});

	divUser.addEventListener("click", (e) => {
			ulDropDown.classList.toggle("hidden");
			
		
	});

	document.addEventListener("click", (e) => {
		if (!divUser.contains(e.target)) {
			ulDropDown.classList.add("hidden");
		}

		if (!divCartContainer.contains(e.target)) {
			ulSubMenuCart.classList.add("hidden");
		}
	});

	mainMenu.addEventListener("click", function () {
		let submenuHeight = 0;
		mainMenu.classList.toggle("active");
		submenuToggleArrow.classList.toggle("arrow");

		if (mainMenu.classList.contains("active")) {
			if (submenuContent.clientHeight === 0) {
				submenuHeight = submenuContent.scrollHeight;
			}
		} else {
			closeAllMenus();
		}

		submenuContent.style.height = `${submenuHeight}px`;
	});

	const nestedSubmenus = submenuContent.querySelectorAll(".submenu-two");

	// Definir esMobile fuera del evento
	let isMobile = window.matchMedia("(max-width: 768px)");

	// Actualizar isMobile en el evento de redimensionado
	window.addEventListener("resize", () => {
		isMobile = window.matchMedia("(max-width: 768px)");
	});

	nestedSubmenus.forEach((submenu) => {
		submenu.addEventListener("click", function (event) {
			event.stopPropagation();
			submenu.classList.toggle("active");

			const nestedContent = submenu.querySelector(".children-two");
			const nestedToggleArrow = submenu.querySelector(".bi-chevron-right");

			if (isMobile.matches) {
				nestedToggleArrow.classList.toggle("arrow");
			}

			let nestedHeight = 0;

			if (submenu.classList.contains("active")) {
				if (nestedContent.clientHeight === 0) {
					nestedContent.style.display = "block";
					nestedHeight = nestedContent.scrollHeight;
					nestedContent.style.height = `${nestedHeight}px`;
				}
			} else {
				nestedContent.style.height = `${nestedHeight}px`;
				setTimeout(() => {
					nestedContent.style.display = "none";
				}, 300);
			}

			submenuContent.style.height = "auto";
		});
	});

	mainMenu.addEventListener("mouseleave", closeAllMenus);

	function closeAllMenus() {
		mainMenu.classList.remove("active");
		submenuToggleArrow.classList.remove("arrow");
		submenuContent.style.height = "0px";

		// Restablecer el estado de todos los submenús .submenu-two
		nestedSubmenus.forEach((submenu) => {
			submenu.classList.remove("active");

			const nestedToggleArrows = submenu.querySelectorAll(".bi-chevron-right");
			nestedToggleArrows.forEach((arrow) => {
				arrow.classList.remove("arrow");
			});
		});

		const nestedContents = document.querySelectorAll(".children-two");
		nestedContents.forEach((content) => {
			content.style.height = "0px";
			content.style.display = "none";
		});
	}

	document.querySelectorAll("#main-menu a").forEach((link) => {
		link.addEventListener("click", function (event) {
			const href = this.getAttribute("href");
			//const currentURL = window.location.href.split("#")[0]; // URL actual sin fragmento
			//const targetURL = this.href.split("#")[0]; // URL del enlace sin fragmento
			console.log(href);
			if (href === "#") {
				// Si el enlace es simplemente "#", previene el comportamiento por defecto
				event.preventDefault();
				return;
			} //else if (href.startsWith("#") || currentURL === targetURL) {
			// Si el enlace es un ancla o va a la misma página
			//event.preventDefault();

			if (isMobile.matches) {
				const menuCheckbox = document.getElementById("input-check");
				menuCheckbox.checked = false;
			} else {
				closeAllMenus(); // Llama a la función que cierra el menú
			}

			const targetElement = document.querySelector(href);
			if (targetElement) {
				const navHeight = document.querySelector("nav").offsetHeight; // Altura de la barra de navegación
				const targetPosition = targetElement.getBoundingClientRect().top;
				//window.pageYOffset - navHeight;

				// Desplazamiento manual ajustado
				window.scrollTo({
					top: targetPosition - 80,
					behavior: "smooth",
				});
			}
			//}
		});
	});
});
