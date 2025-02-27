function checkCartItems(req, res, next) {
	const cartItems = req.session.cartItems || [];

	if (cartItems.length === 0) {
		// Si el carrito está vacío, redirige o muestra un mensaje de error
		return res.redirect("/empty-cart"); // Redirige a una página donde informes al usuario
	}

	// Si hay productos en el carrito, continúa
	next();
}

export default checkCartItems;
