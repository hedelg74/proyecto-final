document.addEventListener("DOMContentLoaded", () => {
	const input = document.querySelector("#phone-number");

	// Función para obtener el valor de una cookie por su nombre
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(";").shift();
	}

	// Inicializar intl-tel-input
	window.itiInstance = window.intlTelInput(input, {
		initialCountry: "auto",
		separateDialCode: true,
		strictMode: true,
		geoIpLookup: function (success) {
			const countryCode = getCookie("country_code");

			if (countryCode) {
				// Si existe la cookie, usarla directamente
				success(countryCode);
			} else {
				fetch("https://ipinfo.io/json?token=ebc47a961f73b5") // Reemplaza con tu token de ipinfo.io
					.then((response) => response.json())
					.then((data) => {
						success(data.country);
						document.cookie = `country_code=${data.country}; path=/; max-age=2592000`; // 1 año
					})
					.catch(() => success("cr"));
			}
		},
		utilsScript: "/js/utils.js",
	});

	/*//iti.i18n='Hindi';

	// Escuchar el evento 'change' en el menú de selección de países
	// eslint-disable-next-line no-unused-vars
	input.addEventListener("countrychange", function (e) {
		const selectedCountryData = iti.getSelectedCountryData();
		updateCountryInfo(selectedCountryData);
	});

	function updateCountryInfo(data) {
		//document.querySelector('#city').value = data.city;
		//document.querySelector('#state').value = data.region;
		document.querySelector("#country").value = data.name || "";
		//document.querySelector('#postal-code').value = data.postal;
	}*/
});
