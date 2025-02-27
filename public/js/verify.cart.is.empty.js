const btnSeeOrder = document.getElementById("see-order");
function getCartItems() {
	const cartItems = localStorage.getItem("cartItems");
	return cartItems ? JSON.parse(cartItems) : [];
}

btnSeeOrder.addEventListener("click", (e) => {
	e.preventDefault();

	const cartItems = getCartItems();
	if (cartItems.length === 0) {
		window.location.href = "/empty-cart.html";
	} else {
		window.location.href = btnSeeOrder.href;
	}
});
