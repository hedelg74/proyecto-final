import { syncCartWithServer } from "./syncCartWithServer.js";

//const currentPath = window.location.pathname;
let cartItemsNode = null;
window.addEventListener("menuLoaded", () => {
	cartItemsNode = document.querySelector("#n-cart-items");
	cartItemsNode.innerText = seeCartItemsNode.textContent;
});

const cart = document.getElementById("see-cart"); //div cart

const cartList = document.querySelector("#see-cart-list tbody"); // table and body of the table

const clearCartButton = document.querySelector("#openModal");

const totalElement = document.getElementById("see-total");
const modalBackground = document.getElementById("modalBackground");
const myModal = document.getElementById("myModal");

const seeCartItemsNode = document.querySelector("#see-n-cart-items");

function loadEventListeners() {
	cart.addEventListener("click", functionSelector);
	clearCartButton.addEventListener("click", () => {
		const cartItems = getCartItems();

		if (cartItems.length === 0) {
			return;
		} else openModal();
	});

	// Prevent click propagation on the background
	modalBackground.addEventListener("click", function (event) {
		event.stopPropagation();
	});
}

// Retrieve items from the cart from localStorage or initialize an empty array if none exist
function getCartItems() {
	const cartItems = localStorage.getItem("cartItems");
	return cartItems ? JSON.parse(cartItems) : [];
}

// Save cart items to localStorage
function saveCartItems(cartItems) {
	localStorage.setItem("cartItems", JSON.stringify(cartItems));
	syncCartWithServer(); // sincronizamos con el servidor
}

// Modify the quantity of an item in the cart by its id and update localStorage
function updateCart(id, newAmount) {
	let cartItems = getCartItems();
	// Find the index of the element with id
	let index = cartItems.findIndex((element) => element.id === id);

	if (index !== -1) {
		cartItems[index].quantity = newAmount;
	}
	console.log(cartItems);
	saveCartItems(cartItems);
}

// Remove an item from the cart by its id and update localStorage
function removeFromCart(id) {
	let cartItems = getCartItems();
	cartItems = cartItems.filter((item) => item.id !== id);
	saveCartItems(cartItems);
}

// Clear the cart from localStorage
function clearCart() {
	localStorage.removeItem("cartItems");
	syncCartWithServer();
}

function loadShoppingCart() {
	const cartItems = getCartItems();

	if (cartItems.length > 0) {
		cartItems.forEach((item) => insertCart(item));
		updateTotal();
	}
}

loadShoppingCart();

loadEventListeners();

function insertCart(item) {
	let totalRequiredItems = Number(seeCartItemsNode.getAttribute("data-nItems"));

	const productRow = document.getElementById(`${item.id}`);
	if (productRow) {
		const previousRequiredQuantity = Number(productRow.children[2].getAttribute("data-quantity"));
		const currentRequiredQuantity = Number(item.quantity);
		const totalRequiredProduct = previousRequiredQuantity + currentRequiredQuantity;
		const totalGeneralRequired = currentRequiredQuantity + totalRequiredItems;

		setCartNitems(totalGeneralRequired);
		productRow.children[2].setAttribute("data-quantity", `${totalRequiredProduct}`);
		productRow.children[2].innerText = totalRequiredProduct.toString() + "x";
	} else {
		const row = document.createElement("tr");
		row.setAttribute("id", `${item.id}`);
		let imgSize = "h-20 w-20";

		row.innerHTML = `
                <td class="text-center">
                    <img src="${item.image_path}" class="${imgSize} mt-1 rounded max-md:h-8 max-md:w-8">
                </td>

                <td class="text-center">
                    ${item.title}
                </td>

                <td class="text-center pr-4" data-quantity="${item.quantity}">
                    ${item.quantity}x
                </td>
                <td>
                    <button id="decrement" data-id="${item.id}" class="decrement px-2 text-[#dc3545] hover:border-[#dc3545] border-2  border-[#728cb0] rounded">&ndash;</button>
                    &nbsp;
                    <button id="increment" data-id="${item.id}" class="increment px-2 text-[#28a745] hover:border-[#28a745] border-2 border-[#728cb0] rounded">+</button>
                </td>
                <td class="precio text-right">
                    $ ${item.price}
                </td>

                <td>
                    <button class="px-4 hover:text-[#dc3545] hover:border-[#dc3545] border-2 border-transparent rounded"><i data-id="${item.id}" class="bi bi-trash delete"></i></button>
                </td>

            `;
		totalRequiredItems += Number(item.quantity);
		setCartNitems(totalRequiredItems);
		cartList.appendChild(row);
	}
}

function deleteItem(e) {
	const itemId = e.target.getAttribute("data-id");
	e.target.parentElement.parentElement.parentElement.remove();
	updateTotal();
	removeFromCart(itemId);
}

function functionSelector(e) {
	if (e.target.classList.contains("delete")) {
		deleteItem(e);
	} else updateQuantity(e);
}

function updateQuantity(e) {
	const itemId = e.target.getAttribute("data-id");
	const totalRequiredItems = Number(seeCartItemsNode.getAttribute("data-nItems"));
	let currentRequiredQuantity = 0;
	const productRow = document.getElementById(`${itemId}`);
	if (productRow) {
		const previousRequiredQuantity = Number(productRow.children[2].getAttribute("data-quantity"));

		if (e.target.classList.contains("increment")) {
			currentRequiredQuantity = 1;
		} else if (e.target.classList.contains("decrement")) {
			if (previousRequiredQuantity > 1) {
				currentRequiredQuantity = -1;
			} else return;
		}

		const totalRequiredProduct = previousRequiredQuantity + currentRequiredQuantity;
		const totalGeneralRequired = currentRequiredQuantity + totalRequiredItems;
		setCartNitems(totalGeneralRequired);
		productRow.children[2].setAttribute("data-quantity", `${totalRequiredProduct}`);
		productRow.children[2].innerText = totalRequiredProduct.toString() + "x";
		updateTotal();
		updateCart(itemId, totalRequiredProduct);
	}
}

function emptyCart() {
	while (cartList.firstChild) {
		cartList.removeChild(cartList.firstChild);
	}
	updateTotal();
	clearCart();
	return false;
}

function updateTotal() {
	let total = 0;
	let nItems = 0;

	const products = cartList.querySelectorAll("tr");

	for (const product of products) {
		// Access the elements inside the <tr> correctly
		const quantity = parseFloat(product.querySelector("td[data-quantity]").getAttribute("data-quantity"));
		const price = parseFloat(product.querySelector(".precio").innerText.replace("$", ""));

		// Add to the total
		total += quantity * price;
		nItems += quantity;
	}
	totalElement.textContent = `$${total.toFixed(2)}`;
	setCartNitems(nItems);
}

function setCartNitems(nItems) {
	seeCartItemsNode.setAttribute("data-nItems", `${nItems}`);
	if (cartItemsNode) cartItemsNode.innerText = nItems;

	seeCartItemsNode.innerText = nItems;
}

document.getElementById("openModal").addEventListener("click", openModal);
document.getElementById("confirmAction").addEventListener("click", confirmAction);
document.getElementById("closeModal").addEventListener("click", closeModal);

function openModal() {
	modalBackground.classList.remove("hidden");
	myModal.classList.remove("hidden");
}

function closeModal() {
	modalBackground.classList.add("hidden");
	myModal.classList.add("hidden");
}

function confirmAction() {
	emptyCart();
	closeModal();
}
