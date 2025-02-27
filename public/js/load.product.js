
export async function loadProducts(apiUrl, containerId) {
	try {
		const response = await fetch(apiUrl);

		if (!response.ok) {
			const errData = response.json();
			throw new Error(errData.message + response.statusText);
		}
		const products = await response.json();

		if (products) {
			const divContainer = document.getElementById(containerId);
			//divContainer.classList.add("grid", "sm:grid-cols-2", "md:grid-cols-3", "lg:grid-cols-4", "justify-center", "gap-y-10", "m-10");

			//const hrLine = document.createElement("hr");
			//document.body.appendChild(hrLine);
			let actualStringCategorySubcategory = "";


			products.forEach((product) => {
				const figure = document.createElement("figure");
				const img = document.createElement("img");
				const figureCaption = document.createElement("figcaption");
				const quantityInput = document.createElement("input");
				const addButton = document.createElement("button");
				const priceQuantityDiv = document.createElement("div");
				const cartIcon = document.createElement("i");
				const priceLabelTitle = document.createElement("label");
				const priceLabel = document.createElement("label");

				img.src = product.image_path;
				img.alt = product.name;
				img.classList.add("rounded", "block", "transform", "scale-120", "bg-[#B6B6F2]", "h-52", "w-52", "m-2");

				quantityInput.value = "1";
				quantityInput.classList.add("quantity", "text-center", "w-10", "border", "border-1", "border-gray-500", "rounded", "bg-[#2a3139]", "text-[#d4d8de]");
				quantityInput.setAttribute("type", "number");
				quantityInput.setAttribute("id", "quantity");
				quantityInput.setAttribute("min", "1");
				quantityInput.required = true;
				quantityInput.addEventListener("input", function () {
					if (this.value < 1) {
						this.value = 1;
					}
				});

				priceLabelTitle.textContent = "Price $";
				priceLabel.textContent = product.price;
				priceLabel.setAttribute("for", "quantity");
				priceLabel.classList.add("price");
				cartIcon.classList.add("bi", "bi-cart-plus");

				figureCaption.classList.add("flex", "justify-center", "gap-4", "text-sm", "text-[#ffffff]");
				figureCaption.appendChild(priceLabelTitle);
				figureCaption.appendChild(priceLabel);
				figureCaption.appendChild(quantityInput);

				addButton.appendChild(cartIcon);
				addButton.append(" Agregar");
				addButton.classList.add("add-to-cart", "p-2", "m-5", "rounded", "text-sm", "text-[#15cfc6]", "bg-[#153937]", "hover:bg-[#15cfc6]", "hover:text-[#153937]", "transition-transition-colors");
				addButton.setAttribute("data-id", `${product.id}`);
			

				priceQuantityDiv.appendChild(figureCaption);
				priceQuantityDiv.classList.add("flex", "justify-center");

				figure.appendChild(img);
				figure.appendChild(priceQuantityDiv);
				figure.appendChild(addButton);
				figure.classList.add(
					"bg-[#252a33]",
					"rounded",
					"flex",
					"flex-col",
					"items-center",
					"w-60",
					"border",
					"border-1",
					"border-[#242430]",
					"hover:border-[#4377bb]",
					"transform",
					"hover:scale-y-105",
				);
				//console.log((actualStringCategorySubcategory !== (product.category + "-" + product.subcategory)));
				if (actualStringCategorySubcategory !== (product.category + "-" + product.subcategory)) {
					
					actualStringCategorySubcategory = (product.category + "-" + product.subcategory);
					const productSection = document.createElement("section");
					
					productSection.setAttribute("id", `${actualStringCategorySubcategory.toLowerCase()}`);
					productSection.innerHTML =`
						<!-- Tiutlo de coleccion -->
						<h1 class="mt-32 relative left-10 text-2xl font-sans font-thin text-[#D0AB73]"><i class="bi bi-collection"></i> Colleccion ${actualStringCategorySubcategory}</h1>
						<hr class="mt-2 border-[#D0AB73]" />
						<!-- Cont(enedor de imagenes -->
						<div id="img-container-${actualStringCategorySubcategory.toLowerCase()}" class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center gap-y-10 m-10">
							<!-- Aqui van las imagenes -->
						</div>`
					divContainer.appendChild(productSection);
				}
			
				
				
				const productContainer = document.getElementById(`img-container-${actualStringCategorySubcategory.toLowerCase()}`);
				productContainer.appendChild(figure);


			});
		}
	} catch (error) {
		console.error(error);
	}
}
