
// Access the custom attribute
const currentPage = window.location.pathname;
// DOM Elements
const cartList = document.querySelector("#cart-list tbody"); // Table and table body
const totalElement = document.getElementById("total");
const salesTaxElement = document.getElementById("sales-tax");
const cartItemsNode = document.querySelector("#n-cart-items");

// Retrieve items from localStorage or initialize an empty array if none exist
const getCartItems = () => {
	const cartItems = localStorage.getItem("cartItems");
	return cartItems ? JSON.parse(cartItems) : [];
};

// Load the shopping cart at the start
const loadShoppingCart = () => {
	const cartItems = getCartItems();
	cartItems.forEach(insertCartItem);
	updateTotal();
};

// Insert an item into the cart
const insertCartItem = (item) => {
	const productRow = document.getElementById(`${item.id}`);
	const totalItemsRequired = Number(cartItemsNode.getAttribute("data-nItems"));

	if (productRow) {
		updateProductQuantity(productRow, item.quantity);
	} else {
		createCartRow(item, totalItemsRequired);
	}
};

// Update the quantity of a product in the cart
const updateProductQuantity = (productRow, currentProductQuantity) => {
	const previousProductQuantity = Number(productRow.children[2].getAttribute("data-quantity"));
	const totalProductQuantity = previousProductQuantity + currentProductQuantity;

	productRow.children[2].setAttribute("data-quantity", `${totalProductQuantity}`);
	productRow.children[2].innerText = `${totalProductQuantity}x`;
	setCartItemCount(totalProductQuantity);
};

// Create a row for a new product in the cart
const createCartRow = (item, totalItemsRequired) => {
	const row = document.createElement("tr");
	row.classList.add("text-sm");
	row.setAttribute("id", `${item.id}`);

	const imgSize = currentPage === "shoppingcart.html" ? "h-20 w-20" : "h-8 w-8";
	row.innerHTML = `
        <td class="text-center">
            <img src="${item.image_path}" class="${imgSize} mt-1 rounded">
        </td>
        <td class="text-center">${item.title}</td>
        <td class="text-center pr-4" data-quantity="${item.quantity}">
            ${item.quantity}x
        </td>
        <td class="price text-right">
            $ ${item.price}
        </td>
    `;

	setCartItemCount(totalItemsRequired + Number(item.quantity));
	cartList.appendChild(row);
};

// Update the total of the cart
const updateTotal = () => {
	let total = 0;
	let itemCount = 0;

	const products = cartList.querySelectorAll("tr");

	products.forEach((product) => {
		const quantity = parseFloat(product.querySelector("td[data-quantity]").getAttribute("data-quantity"));
		const price = parseFloat(product.querySelector(".price").innerText.replace("$", ""));

		total += quantity * price;
		itemCount += quantity;
	});

	const tax = total * 0.13;
	salesTaxElement.textContent = `$${tax.toFixed(2)}`;
	totalElement.textContent = `$${total.toFixed(2)}`;
	setCartItemCount(itemCount);
};

// Update the number of items in the cart
const setCartItemCount = (itemCount) => {
	cartItemsNode.setAttribute("data-nItems", `${itemCount}`);
	cartItemsNode.innerText = itemCount;
};

// Load the cart when the script starts
loadShoppingCart();
