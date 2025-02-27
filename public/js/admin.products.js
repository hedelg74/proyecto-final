import { showDialog } from "./showdialog.message.js";


	const dataList = document.getElementById("data-list");
	export async function loadProducts() {
				try {
					const response = await fetch("/mant-load-products-list");
					if (!response.ok) {
						const errData = await response.text();
						throw new Error(errData.message + response.statusText);
					}
					const data = await response.text();
					
					dataList.innerHTML = data;
					handlePanelActions();
				} catch (error) {
					console.error(error);
					showDialog(false, error.message);
				}
			}
					

			function handlePanelActions() {
				const lista = document.getElementById("lista");
				let items = Array.from(lista.children);
				let indexSeleccionado = 0;

		
			
				items[indexSeleccionado].focus();
				// Agregar navegación con flechas
				document.addEventListener("keydown", (e) => {
					if (e.key === "ArrowDown" || e.key === "ArrowUp") {
						e.preventDefault(); // Prevenir el desplazamiento de la página
						
						const totalItems = items.length;
						
						if (e.key === "ArrowDown") {
							indexSeleccionado = (indexSeleccionado + 1) % totalItems; // Ir al siguiente
						} else if (e.key === "ArrowUp") {
							indexSeleccionado = (indexSeleccionado - 1 + totalItems) % totalItems; // Ir al anterior
						}
						
						updateFocus(indexSeleccionado);

						const focusedElement = document.activeElement; 
						// Desplazar la página para mantener el elemento enfocado visible
						const offset = 500; 
						// Ajusta este valor según la altura del elemento fijo 
						if (focusedElement && focusedElement.tagName === 'LI') { 
							window.scrollTo({ top:window.pageYOffset + focusedElement.getBoundingClientRect().top  - offset, behavior: 'smooth' }); 
						}
					}
				});

				// Crear un evento simulado para "ArrowUp"
				const eventoArrowUp = new KeyboardEvent("keydown", {
					key: "ArrowUp", // Tecla simulada
					code: "ArrowUp",
					bubbles: true, // Permitir que burbujee en el DOM
					cancelable: true, // Hacerlo cancelable
				});
				const eventoArrowDown = new KeyboardEvent("keydown", {
					key: "ArrowDown",
					code: "ArrowDown",
					bubbles: true,
					cancelable: true,
				});

				function addLiEventClick(items){
					items.forEach((item, index) => {
						item.addEventListener("click", () => {
						updateFocus(index);
					});
				});
				}
				
				addLiEventClick(items);

				function updateFocus(index) {

					// Enfocar el nuevo elemento
					lista.children[index].focus();
					indexSeleccionado = index;
				}

				lista.addEventListener("click", functionSelector);

				function functionSelector(e) {
					if (e.target.classList.contains("delete")) {
						deleteItem(e);
					} else if (e.target.classList.contains("edit")) {
						editItem(e);
					} else { 
						if (e.target.classList.contains("print")) {
							printQRCode();
						}
					}
				}

				
        
				function printQRCode() {
					const qrCodeText = document.getElementById('hiddenQR').value;
					QRCode.toDataURL(qrCodeText, { errorCorrectionLevel: 'H' }, function (err, url) {
						if (err) {
							console.error(err);
							return;
						}
				
									// Calcula el centro de la pantalla
					const width = 400;
					const height = 400;
					const left = (window.innerWidth / 2) - (width / 2);
					const top = (window.innerHeight / 2) - (height / 2);

					// Abre una nueva ventana centrada
					const win = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);
						win.document.write(`
						<!DOCTYPE html>
						 <head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Código QR</title>
							<link href="./css/output.css" rel="stylesheet" />
						</head>
							<body class="m-auto h-screen flex justify-center items-center bg-white">
								<div class="text-center p-4">
									<h1 class="text-2xl font-bold mb-4">Código QR</h1>
									<img src="${url}" alt="QR Code" class="w-72 h-72 mb-4">
									<br>
									<button onclick="window.print();" class="bg-blue-500 text-white py-2 px-4 text-lg rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
										Imprimir
									</button>
								</div>
							</body>
						</html>
					`);
					
					// Cierra el flujo de escritura en el documento
					win.document.close();
				});
				}

        


				function deleteItem(e) {
					const itemId = e.target.getAttribute("data-id");
					if (confirm("¿Está seguro de eliminar esta producto?")) deleteProduct(itemId);
					if (indexSeleccionado > 0) {
						document.dispatchEvent(eventoArrowUp);
					} else {
						document.dispatchEvent(eventoArrowDown);
					}
					e.target.parentElement.parentElement.remove();
				}

				async function editItem(e) {
					const itemId = e.target.getAttribute("data-id");
					const editDialog = document.getElementById("edit-dialog");
					await loadCategories("edit-dialog");
					await loadSubCategories("edit-dialog");
					editProduct(itemId);
					editDialog.showModal();
				}

				document.querySelector('#edit-dialog #cancel').addEventListener('click', closeEditDialog);
				function closeEditDialog() {
						const editDialog = document.getElementById('edit-dialog');
						editDialog.close();
					}

				function editProduct(params) {
					fetch("/mant-edit-product", {
						method: 'POST',
						body: JSON.stringify({ id: params }),
						headers: {
							'Content-Type': 'application/json'
						}
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error('Error al editar producto');
							}
							return response.json();
						})
						.then((data) => {
						
							const form = document.getElementById('edit-form');
							const productId = document.getElementById('product-id');
							form.elements['img_path'].value = data.data[0].image_path;
							form.elements['name'].value = data.data[0].name;
							form.elements['description'].value = data.data[0].description|| "Sin descripcion";
							form.elements['stock'].value = data.data[0].stock;
							form.elements['price'].value = data.data[0].price;
							form.elements['category'].value = data.data[0].id_category;
							form.elements['sub_category'].value = data.data[0].id_sub_category;
							form.elements['status'].value = data.data[0].product_status;
						
							form.elements['create_at'].textContent =new Date( data.data[0].created_at).toLocaleString("es-ES",{timeZone:"America/Mexico_City"});
							productId.textContent = data.data[0].id;
						
							const img = document.getElementById('product-img');
							img.src = data.data[0].image_path;
						})
						.catch((error) => {
							console.error(error);
							showDialog(false, error.message);
						});

				}
				
				async function loadCategories(dialog) {
                    try {
                        const response = await fetch('/mant-load-category');
                        if (!response.ok) {
                            throw new Error('Error en la respuesta del servidor');
                        }
                        const categories = await response.json();
						if(categories){
							const selectCategory =document.querySelector(`#${dialog} #category`);
							removeOptions(selectCategory);
							categories.data.forEach(item=>{
								const newCategory=document.createElement("option");
								newCategory.value=item.id;
								
								newCategory.textContent=item.name;
								selectCategory.appendChild(newCategory);
							});
							

						}
						
                    } catch (error) {
                        console.error(error);
						showDialog(error.message);
                    }
                }
				async function loadSubCategories(dialog) {
                    try {
                        const response = await fetch('/mant-load-subcategory');
                        if (!response.ok) {
                            throw new Error('Error en la respuesta del servidor');
                        }
                        const categories = await response.json();
						if(categories){
							const selectSubCategory =document.querySelector(`#${dialog} #sub_category`);
							removeOptions(selectSubCategory);
							categories.data.forEach(item=>{
								const newSubCategory=document.createElement("option");
								newSubCategory.value=item.id;
								
								newSubCategory.textContent=item.name;
								selectSubCategory.appendChild(newSubCategory);
							});
							

						}
						
                    } catch (error) {
                        console.error(error);
						showDialog(error.message);
                    }
                }
				function removeOptions(selectElement) {
					const options = selectElement.options;

					for (let i = options.length - 1; i > 0; i--) {
						selectElement.remove(i);
					}
				}


				document.querySelector("#edit-form").addEventListener("submit", (event) => {
					event.preventDefault();
					const productId =Number( document.getElementById("product-id").textContent);
					const formData = new FormData(event.target);
					const formObject = Object.fromEntries(formData);
					formObject.id=productId;
					updateProduct(formObject);
					
				});

				async function updateProduct(formObject) {
					try {
						const response = await fetch("/mant-update-product", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(formObject),
						});
						if (!response.ok) {
							const data = await response.json();
							throw new Error(data.message + response.statusText);
						}
						const data = await response.json();
						if (data) {
						
							showDialog(data.success, data.message);
							const editDialog = document.getElementById("edit-dialog");
							updateProductList(data.data);
							editDialog.close();
							setTimeout(() => { 
							if (typeof indexSeleccionado !== 'undefined') {  
								lista.children[indexSeleccionado].focus(); 
							} 
						}, 3010);

						}
					} catch (error) {
						console.error(error);
						showDialog(false, error.message);
					}
				};

				document.getElementById('add-product').addEventListener('click', showAddDialog);
				async function showAddDialog(){
					await loadCategories("add-dialog");
					await loadSubCategories("add-dialog");
					const addDialog = document.getElementById('add-dialog');
					addDialog.showModal();
				};

				document.querySelector('#add-dialog #cancel').addEventListener('click', closeAddDialog);
				function closeAddDialog() {
						const addDialog = document.getElementById('add-dialog');
						addDialog.close();
						setTimeout(() => { 
							if (typeof indexSeleccionado !== 'undefined') {  
								lista.children[indexSeleccionado].focus(); 
							} 
						}, 3010);
						
						
				};

				document.querySelector("#add-form").addEventListener("submit", (event) => {
					event.preventDefault();
					const formData = new FormData(event.target);
					const selectCategory = document.getElementById("add-form").querySelector("#category");
					const category = selectCategory.options[selectCategory.selectedIndex].textContent;
					const selectSubCategory = document.getElementById("add-form").querySelector("#sub_category");
					const subCategory = selectSubCategory.options[selectSubCategory.selectedIndex].textContent;		
					const customPath = (`/images/${category}/${subCategory}`).toLowerCase();
					const url = `/mant-add-product?img_path=${encodeURIComponent(customPath)}`;
					addProduct(url, formData);
					});

				async function addProduct(url, formData) {
					try {
						const response = await fetch(url, {
						method: "POST",
						body: formData,
						});
						if (!response.ok) {
							const data = await response.json();
							throw new Error(data.message + response.statusText);
						}
						const data = await response.json();
						if (data) {

							showDialog(data.success, data.message);
							document.querySelector("#add-form").reset();
							insertIntoProductList(data.data);
							closeAddDialog();
						}
					} catch (error) {
						console.error(error);
						showDialog(false, error.message);
					}
				}

				document.getElementById("add-form").querySelector("#filename").addEventListener("change", (event) => {
					const file = event.target.files[0];
					const imgPreview = document.getElementById("add-dialog").querySelector("#product-img");
					if (file) {
						const fileURL = URL.createObjectURL(file);
						imgPreview.src = fileURL;
					} else {
      					imgPreview.src = ""; 
     
					}					
				});

				function insertIntoProductList(data) {
				
					
					const item = document.createElement("li");
					item.classList.add("item", "grid","items-center", "grid-cols-10", "p-1", "focus:text-white", "focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2", "w-full");
					item.setAttribute("data-id", `${data[7]}`)
					item.setAttribute("tabindex","0")
					item.innerHTML = `<div><img src="${data[5]}" alt="image" class="h-16 w-16 rounded"></div>
					`+`<div class="id">${data[7]}</div>
					`+`<div class="name">${data[0]}</div>
					`+`<div class="description">${data[1]}</div>
					`+`<div class="text-right">0</div>
					`+`<div class="text-right">$0.00</div>
					`+`<div class="status text-right">${data[4]===1 ? "Activo" : "Inactivo"}</div>
					`+`<button><i data-id=${data[6]} class="bi bi-pencil hover:text-green-500 edit"></i></button>
					`+ `<button><i data-id=${data[6]} class="bi bi-trash hover:text-red-500 delete"></i></button>
					`+ `<i data-id=${data[6]} class="bi bi-printer hover:text-red-500 print">QR</i>
					<input type="hidden" id="hiddenQR" value=${data[6]} hidden>`;
					lista.appendChild(item);
					const newIndex = lista.children.length - 1;
					item.setAttribute("tabindex", "-1");
					items = Array.from(lista.children);
					addLiEventClick(items);
					//lista.children[newIndex].focus();
					indexSeleccionado = newIndex;
				}

				function updateProductList(data) {
                  
                    
                    const item = document.querySelector(`#lista li[data-id="${data[7]}"`);
               
                    item.children[2].textContent = data[0];
                    item.children[3].textContent = data[1];
					item.children[6].textContent = data[5] === 1 ? "Activo" : "Inactivo";
					updateFocus(indexSeleccionado);
					console.log(indexSeleccionado);
                    
                }

				
				document.getElementById("scan-qrcode").addEventListener("click", showScanDialog);
				function showScanDialog() {
					const scanDialog = document.getElementById("scan-dialog");
					scanDialog.showModal();
					startScanner();
				}

				document.getElementById("close-scan-dialog").addEventListener("click", closeScanDialog);
				function closeScanDialog() {
					const scanDialog = document.getElementById("scan-dialog");
					const criteria = document.getElementById("result").querySelector("#product_id").textContent;
					scanDialog.close();
					findItemList("id",criteria);
					
				}

				function onScanSuccess(qrCode) {
					
					fetch('mant-qr-code', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ qrCode: qrCode })
					})
					.then(response => response.json())
					.then(data => {
						const resultDiv = document.getElementById('result');
						//resultDiv.innerHTML = JSON.stringify(data, null, 2);
						const divOutputChildren=resultDiv.getElementsByTagName("output");
						const imgProduct=document.getElementById("img_product");
						imgProduct.src=data.data[0].image_path;
						divOutputChildren[0].textContent=data.data[0].id;
						divOutputChildren[1].textContent=data.data[0].name;
						divOutputChildren[2].textContent=data.data[0].description;
						divOutputChildren[3].textContent=data.data[0].price;
						divOutputChildren[4].textContent=data.data[0].stock;
						divOutputChildren[5].textContent=data.data[0].category || data.data[0].id_category;
						divOutputChildren[6].textContent=data.data[0].sub_category || data.data[0].id_sub_category;
						divOutputChildren[7].textContent=data.data[0].created_at;
						const status= data.data[0].product_status === 1 ?  "Activo" : "Inactivo";
						divOutputChildren[8].textContent=status;
						divOutputChildren[9].textContent=data.data[0].qr_code;
						divOutputChildren[10].textContent=data.data[0].image_path;
						
						
					})
					.catch(error => console.error('Error:', error));
				}

				function startScanner() {
					// eslint-disable-next-line no-undef
					var html5QrcodeScanner = new Html5QrcodeScanner(
						"reader", { fps: 10, qrbox:{width: 250, height: 250}}, false);
					html5QrcodeScanner.render(onScanSuccess);
				}

				function findItemList(field, criteria){
					const itemSearchdTarget=document.querySelectorAll(`#lista .item .${field}`)
					itemSearchdTarget.forEach((item, index)=>{
						if (item.textContent.includes(`${criteria}`)){
							indexSeleccionado=index;
						};
						updateFocus(indexSeleccionado)
					});
				};

				document.getElementById('search-input').addEventListener('input', function() {
					const query = this.value.toLowerCase();
					const searchType = document.getElementById('search-type').value;
					
					
					document.querySelectorAll(`.item .${searchType}`).forEach((item) => {
						const valueToSearch = item.textContent.toLowerCase();
						item.parentElement.style.display = valueToSearch.includes(query) ? '' : 'none';
						if (valueToSearch === query) {
							item.parentElement.classList.add('bg-blue-500');
							item.parentElement.classList.add('text-white');
						}else{
							item.parentElement.classList.remove('bg-blue-500');
							item.parentElement.classList.remove('text-white');
						}
					});
				});

				async function deleteProduct(id) {
					try {
						const response = await fetch("/mant-delete-product", {
							method: "DELETE",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ id: id }),
						});
						if (!response.ok) {
							const data = await response.json();
							throw new Error(data.message + response.statusText);
						}
						const data = await response.json();
						if (data) {
							showDialog(data.success, data.message);
						}
					} catch (error) {
						console.error(error);
						showDialog(false, error.message);
					}
				}

				 
							
			};