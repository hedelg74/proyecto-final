// Escucha el evento personalizado
window.addEventListener("menuLoaded", () => {
	const link = document.querySelector("#see-cart");
	const msg = document.getElementById("message");
	const cartt = document.querySelector("#cart");

	function getCartItems() {
		const cartItems = localStorage.getItem("cartItems");
		return cartItems ? JSON.parse(cartItems) : [];
	}

	link.addEventListener("click", function (event) {
		const cartItems = getCartItems();
		event.preventDefault();
		if (cartItems.length > 0) {
			window.location.href = link.href;
		} else {
			msg.classList.toggle("hidden");
		}
	});

	cartt.addEventListener("mouseleave", function () {
		msg.classList.add("hidden");
	});
});
