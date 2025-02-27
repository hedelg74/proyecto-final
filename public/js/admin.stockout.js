


import { showDialog } from "./showdialog.message.js";


    const dataList = document.getElementById("data-list");

    export async function loadStockOut() {
                try {
                    const response = await fetch("/mant-load-stockout-list");
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message + ": " + response.statusText);
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

    // Establecer tabindex inicial
    items.forEach((item, index) => {
        item.setAttribute("tabindex", index === indexSeleccionado ? "0" : "-1");
    });
    if (items.length > 0) items[indexSeleccionado].focus();
    // Agregar navegación con flechas
    lista.addEventListener("keydown", (e) => {
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
                window.scrollTo({ top: window.pageYOffset + focusedElement.getBoundingClientRect().top - offset, behavior: 'smooth' });
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

    function addLiEventClick(items) {
        items.forEach((item, index) => {
            item.addEventListener("click", () => {
                updateFocus(index);
            });
        });
    }
                
    addLiEventClick(items);

    function updateFocus(index) {
        // Eliminar tabindex del elemento actual
        items.forEach((item, i) => item.setAttribute("tabindex", i === index ? "0" : "-1"));

        // Enfocar el nuevo elemento
        lista.children[index].focus();
        indexSeleccionado = index;
    }

    lista.addEventListener("click", functionSelector);

    function functionSelector(e) {
        if (e.target.classList.contains("delete")) {
            if (confirm("¿Está seguro de eliminar esta entrada?")) deleteItem(e);
        } else if (e.target.classList.contains("edit")) {
            editItem(e);
        }
    }

    function deleteItem(e) {
        const itemId = e.target.getAttribute("data-id");
        deleteStockOut(itemId);
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
        await loadProducts("edit-dialog");
        editStockOut(itemId);
        manageAddDetail("edit-dialog");
        editDialog.showModal();
    }

    document.querySelector('#edit-dialog #cancel').addEventListener('click', closeEditDialog);
    function closeEditDialog() {
        const editDialog = document.getElementById('edit-dialog');
        editDialog.close();
    }

    function editStockOut(params) {  //PARA MOSTRAR LOS DATOS EN EL FORMULARIO DE EDICION
      
        fetch("/mant-edit-stockout", {
            method: 'POST',
            body: JSON.stringify({ id: params }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(async(response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        console.log(data);
                        throw new Error('Error al editar salida' + response.statusText + " " + data.message);
                    });
                }
                return response.json();
            })
            .then(async (data) => {
                const result = data.data;
               
                const form = document.getElementById('edit-form');
                const stockoutId = document.querySelector('#edit-dialog #stockout-id');
                            
                stockoutId.textContent = result[0].id;
                form.elements['document'].value = result[0].document;
                const isoString = result[0].document_date;
                const date = new Date(isoString);
                const formattedDate = date.toISOString().slice(0, 10);
                form.elements['date'].value = formattedDate
                const formatedTotal = Number(result[0].total_document).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
                document.querySelector("#edit-dialog #total-document").value = formatedTotal;
                form.elements['out_type'].value = result[0].out_type;
                const detail = document.querySelector("#edit-dialog #detail");
                detail.innerHTML = "";
                result.forEach((item) => {    
                   
                    const listItem = document.createElement("li");
                    listItem.setAttribute("tabindex", "0");
                    listItem.classList.add("product-item", "items-center", "grid", "grid-cols-7", "p-1", "focus:text-white", "focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2", "w-full", "overflow-hidden")
                    listItem.innerHTML = `
                    <img src="${item.image_path}" class="h-8 w-8 rounded min-w-0">
                    <div class="min-w-0">${item.product_id}</div>
                    <div class="min-w-0">${item.name}</div>
                    <div id="item-quantity" data-quantity="${item.quantity}" class="text-right min-w-0">${item.quantity}</div>
                    <div class="text-right min-w-0">${Number(item.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <i data-id=${item.detailId} class="bi bi-pencil hover:text-green-500 min-w-0 edit text-center cursor-pointer"></i>
                    <i data-id=${item.detailId} class="bi bi-trash hover:text-red-500 min-w-0 delete cursor-pointer"></i>`;
                    detail.appendChild(listItem);
                });
               

                form.elements['document'].focus();
                            
            })
            .catch((error) => {
                console.error(error);
                showDialog(false, error.message);
            });

    }
                

    document.getElementById('add-stockin').addEventListener('click', showAddDialog);
    async function showAddDialog() {
        await loadProducts("add-dialog");
        manageAddDetail("add-dialog");
        const addDialog = document.getElementById('add-dialog');
        addDialog.showModal();
    };

    document.querySelector('#add-dialog #cancel').addEventListener('click', closeAddDialog);
    function closeAddDialog() {
        const addDialog = document.getElementById('add-dialog');
        addDialog.close();
        setTimeout(() => {
            if (typeof indexSeleccionado !== 'undefined') {
                if (lista.childres > 0)  lista.children[indexSeleccionado].focus();
            }
        }, 3000);
                        
                        
    };

    document.querySelector("#add-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const dateValue = document.querySelector('#add-dialog #date').value;
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // Obtén la hora actual en formato HH:MM:SS

        // Combina la fecha del input y la hora actual
        const dateTimeString = `${dateValue}T${currentTime}`;

        // Asegúrate de que la cadena de fecha y hora sea válida
        const dateTime = new Date(dateTimeString);

        // Formatea la cadena de fecha y hora para SQL DATETIME
        const formattedDateTime = dateTime.toISOString().slice(0, 19).replace('T', ' ');
    
        document.querySelector('#add-dialog #document_date').value = formattedDateTime;
        
        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData);
        formObject.detalle = [];
        const items = Array.from(document.querySelectorAll("#add-dialog .product-item"));
        if(items.length > 0){
            items.forEach((item) => {
                const product_id = Number(item.children[1].textContent);
                const quantity = Number(item.children[3].textContent);
                const price = Number(item.children[4].textContent);
                formObject.detalle.push({ product_id, quantity, price });
            });
            const total_document = formObject.detalle.reduce((acc, item) => acc + item.quantity * item.price, 0);
            formObject.total_document = total_document;
        } else {
            showDialog(false, "No hay productos en la lista");
            return;
        }

        const url = "/mant-add-stockout";
        addStockOut(url, formObject);
    });
    
    
    async function addStockOut(url, formObject) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body:JSON.stringify(formObject),
            });
            if (!response.ok) {
                const data = await response.json();
               
                throw new Error(data.message + response.statusText);
            }
            const data = await response.json();
            if (data) {

                showDialog(data.success, data.message);
                document.querySelector("#add-form").reset();
                insertIntoStockOutList(data.data);
                closeAddDialog();
            }
        } catch (error) {
            console.error(error);
            showDialog(false, error.message);
        }
    }

    document.querySelector("#edit-form").addEventListener("submit", (event) => { //PREPARA LOS DATOS PARA ACTUALIZAR
        event.preventDefault();
        const dateValue = document.querySelector('#edit-dialog #date').value;
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // Obtén la hora actual en formato HH:MM:SS

        // Combina la fecha del input y la hora actual
        const dateTimeString = `${dateValue}T${currentTime}`;

        // Asegúrate de que la cadena de fecha y hora sea válida
        const dateTime = new Date(dateTimeString);

        // Formatea la cadena de fecha y hora para SQL DATETIME
        const formattedDateTime = dateTime.toISOString().slice(0, 19).replace('T', ' ');
    
        document.querySelector('#edit-dialog #document_date').value = formattedDateTime;
        
        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData);
        const stockoutId = document.querySelector("#edit-dialog #stockout-id");
        formObject.stockoutId = Number(stockoutId.value);
        formObject.detalle = [];
       
        const items = Array.from(document.querySelectorAll("#edit-dialog .product-item"));
        if(items.length > 0){
            items.forEach((item) => {
                const product_id = Number(item.children[1].textContent);
                const beforeQuantity = Number(item.children[3].getAttribute("data-quantity"));
                const quantity = Number(item.children[3].textContent);
                const price = Number(item.children[4].textContent);
                const detailId = Number(item.children[5].getAttribute("data-id"));
                const toDelete = item.classList.contains("text-red-500") ? true : false;
                formObject.detalle.push({ product_id, beforeQuantity ,quantity, price, detailId, toDelete });
            });
            const total_document = formObject.detalle.reduce((acc, item) => acc + item.quantity * item.price, 0);
            formObject.total_document = total_document;
        } else {
            showDialog(false, "No hay productos en la lista");
            return;
        }

        const url = "/mant-update-stockout";
        updateStockIn(url, formObject);
    });
    
    
    async function updateStockIn(url, formObject) { //PARA ACTUALIZAR LOS DATOS
        const editDialog = document.getElementById("edit-dialog");
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body:JSON.stringify(formObject),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message + response.statusText);
            }
            const data = await response.json();
            if (data) {

                showDialog(data.success, data.message);
                document.querySelector("#edit-form").reset();
                updateStockOutList(data.data);
                editDialog.close();
            }
        } catch (error) {
            console.error(error);
            showDialog(false, error.message);
        }
    }

    function updateStockOutList(data) {
       
        const item = document.querySelector(`#lista li[data-id="${data[4]}"]`);
        const date = new Date(data[1]);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formattedDate = new Intl.DateTimeFormat('es-CR', options).format(date);
        item.children[1].textContent = data[0];
        item.children[2].textContent = getInDocType(Number(data[2]));
        item.children[3].textContent = formattedDate;
        item.children[4].textContent = Number(data[3]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }


    function insertIntoStockOutList(data) {
    
        const item = document.createElement("li");
        item.classList.add("grid","items-center", "grid-cols-7","p-1", "focus:text-white","focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2d");
        const date = new Date(data[2]);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formattedDate = new Intl.DateTimeFormat('es-CR', options).format(date);
        console.log(data);
        item.innerHTML = `
        `+`<div>${data[0]}</div>
        `+ `<div>${data[1]}</div>
        `+ `<div>${getInDocType(Number(data[3]))}</div>
        `+`<div>${formattedDate}</div>
        `+`<div class="text-right">${Number(data[4]).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
        `+`<button><i data-id=${data[0]} class="bi bi-pencil hover:text-green-500 edit"></i></button>
        `+`<button><i data-id=${data[0]} class="bi bi-trash hover:text-red-500 delete"></i></button>`;
        lista.appendChild(item);
        const newIndex = lista.children.length - 1;
        item.setAttribute("tabindex", "-1");
        items = Array.from(lista.children);
        addLiEventClick(items);
        indexSeleccionado = newIndex;

    }
    
    function getInDocType(type) {
    switch (type) {
      case 1:
        return "Venta";
      case 2:
        return "Devolucion a proveedor";
      case 3:
        return "Consumo Interno";
      case 4:
        return "Donacion";
      case 5:
        return "Transferencia";
      case 6:
        return "Ajuste";
      case 7:
        return "Inventario Inicial";
      default:
        return "Desconocido";
    }
    
  }
    
    document.getElementById('search-input').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const searchType = document.getElementById('search-type').value;
        
        
        document.querySelectorAll(`.item .${searchType}`).forEach((item) => {
            let valueToSearch;
            if (searchType === 'document_date') {
                valueToSearch = item.textContent.toLowerCase().slice(0,10);
            } else {
                valueToSearch = item.textContent.toLowerCase();
            }
                
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

    async function deleteStockOut(id) {
        try {
            const response = await fetch("/mant-delete-stockout", {
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

     async function loadProducts(dialogName) {
        try {
            const response = await fetch("/mant-load-products");
            if (!response.ok) {
                const errData = await response.text();
                throw new Error(errData.message + response.statusText);
            }
            const data = await response.json();
            const result = data.data;
            const selectProduct = document.querySelector(`#${dialogName} #product`);
            while (selectProduct.options.length > 1) {
                selectProduct.remove(1);
            }  

            result.forEach((item) => {
                if (item.active === 1 || item.stock > 0) {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
                    option.setAttribute("data-imgPath", item.image_path);
                    option.setAttribute("data-price", item.price);
                    selectProduct.appendChild(option);
                }
            });
            
        } catch (error) {
            console.error(error);
            showDialog(false, error.message);
        }
}
    function manageAddDetail(dialogName) {
        
    
        const selectProduct = document.querySelector(`#${dialogName} #product`);
        const inputId = document.querySelector(`#${dialogName} #product_id`);
        const inputQuantity = document.querySelector(`#${dialogName} #quantity`);
        const inputPrice = document.querySelector(`#${dialogName} #price`);

        const outPutPrice = document.querySelector(`#${dialogName} #price`);
        
        inputId.addEventListener("input", (event) => {
            selectProduct.value = event.target.value;
            outPutPrice.textContent = Number(selectProduct.options[selectProduct.selectedIndex].getAttribute("data-price")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        })

        selectProduct.addEventListener("change", (event) => {
            inputId.value = event.target.value
            outPutPrice.textContent = Number(selectProduct.options[selectProduct.selectedIndex].getAttribute("data-price")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        })

        const addProduct = document.querySelector(`#${dialogName} #add-product`);
        const ulDetail = document.querySelector(`#${dialogName} #detail`);
        let itemDetailIndex = 0;
    
    
        addProduct.addEventListener("click", () => {
            if (inputId.value === "") {
                showDialog(false, "El producto no es válido");
                setTimeout(() => {
                    inputId.focus();
                }, 3001);
                return;
            } else if (inputQuantity.value <= 0) {
                showDialog(false, "La cantidad no es válida");
                setTimeout(() => {
                    inputQuantity.focus();
                }, 3001);
                return;
            }
            const productImg = document.createElement("img")
            productImg.id = "product-img";
            productImg.src = selectProduct.options[selectProduct.selectedIndex].getAttribute("data-imgPath");
            productImg.classList.add("h-8", "w-8", "rounded", "min-w-0");
            const productID = document.createElement("output")
            productID.id = "product-name";
            productID.classList.add("min-w-0");
            productID.value = inputId.value;
            const productName = document.createElement("output")
            productName.id = "product-name";
            productName.classList.add("min-w-0")
            productName.value = selectProduct.options[selectProduct.selectedIndex].text;
            const productQuantity = document.createElement("output")
            productQuantity.id = "product-quantity";
            productQuantity.classList.add("text-right", "min-w-0");
            productQuantity.setAttribute("data-quantity", 0);
            productQuantity.value = inputQuantity.value;
            const producPrice = document.createElement("output")
            producPrice.id = "product-price";
            producPrice.classList.add("text-right", "min-w-0");
            const formatedPrice = Number(inputPrice.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            producPrice.value = formatedPrice;
            
            const iEdit = document.createElement("i")
            iEdit.setAttribute("data-id", 0);
            iEdit.classList.add("bi", "bi-pencil", "hover:text-red-500", "text-center", "delete", "min-w-0");
           
            const iDelete = document.createElement("i")
            iDelete.setAttribute("data-id", 0);
            iDelete.classList.add("bi", "bi-trash", "hover:text-red-500", "delete", "min-w-0");
          
            const listItem = document.createElement("li");
            listItem.setAttribute("tabindex", "0");
    
            listItem.classList.add("product-item", "items-center", "grid", "grid-cols-7", "p-1", "focus:text-white", "focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2", "w-full", "overflow-hidden")
            listItem.classList.add("bg-blue-500", "text-white");
            listItem.appendChild(productImg);
            listItem.appendChild(productID);
            listItem.appendChild(productName);
            listItem.appendChild(productQuantity);
            listItem.appendChild(producPrice);
            listItem.appendChild(iEdit);
            listItem.appendChild(iDelete);
            console.log(listItem);
            clearListItemBackground();
            ulDetail.appendChild(listItem);
            clearDetailInputs();
            itemDetailIndex = ulDetail.children.length - 1;
            const total = calculateAddDialogTotalDocument();
            document.querySelector(`#${dialogName} #total-document`).textContent = total;
        
        
        });

        function clearDetailInputs() {
            inputId.value = "";
            selectProduct.value = "";
            inputQuantity.value = "0";
            inputPrice.value = "0.00";
            inputId.focus();
        };

        function clearListItemBackground() {
            const items = Array.from(document.querySelectorAll(`#${dialogName} .product-item`));
            items.forEach((item) => {
                item.classList.remove("bg-blue-500");
                item.classList.remove("text-white");
            });
        }

        ulDetail.addEventListener("click", functionSelectorDetail);
        function functionSelectorDetail(e) {
            if (e.target.classList.contains("delete")) {
                if (confirm("¿Está seguro de eliminar este producto?")) deleteItemDetail(e);
                              
            } else if (e.target.classList.contains("edit")) {
               editItemDetail(e);
            }
        }
        
        function deleteItemDetail(e) {

            if (dialogName === "edit-dialog") {
                e.target.parentElement.classList.toggle("text-red-500");
                e.target.parentElement.classList.toggle("line-through");

                const total = calculateAddDialogTotalDocument();
                document.querySelector(`#${dialogName} #total-document`).textContent = total;
               
            } else {
                e.target.parentElement.remove();
                const total = calculateAddDialogTotalDocument();
                document.querySelector(`#${dialogName} #total-document`).textContent = total;
            }
        }    
            
        async function deleteStockOutDetailById(stockin_id, itemDetailId, product_id, itemDetailQty,e) { 
            try {
                const response = await fetch("/mant-delete-stockout-detail-by-id", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stockin_id, itemDetailId, product_id, itemDetailQty }),   
                });
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message + response.statusText);
                }
                const data = await response.json();
                if (data) {
                    e.target.parentElement.remove();
                    const total = calculateAddDialogTotalDocument();
                    document.querySelector(`#${dialogName} #total-document`).textContent = total;
                    showDialog(data.success, data.message);
                }
            } catch (error) {
                console.error(error);
                showDialog(false, error.message);
            }    
                
        }
            


        
        function editItemDetail(e) {
            const editDialog = document.getElementById("edit-detail-dialog");
            const quantity = e.target.parentElement.children[3].textContent;
            const price = e.target.parentElement.children[4].textContent;
            const quantityInput = document.querySelector("#edit-detail-dialog #quantity");
            quantityInput.addEventListener("input", function () {
					if (this.value < 1) {
						this.value = 1;
					}
			});
            const priceInput = document.querySelector("#edit-detail-dialog #price");
            quantityInput.value = quantity;
            priceInput.value = price;
            const btnSave = document.querySelector("#edit-detail-dialog #save-detail");
            btnSave.addEventListener("click", () => {
                e.target.parentElement.children[3].textContent = quantityInput.value;
                e.target.parentElement.children[4].textContent = priceInput.value;
                const total = calculateAddDialogTotalDocument();
                document.querySelector(`#${dialogName} #total-document`).textContent = total;
                editDialog.close();
            });
            const btnCancel = document.querySelector("#edit-detail-dialog #cancel-detail");
            btnCancel.addEventListener("click", () => {
                editDialog.close();
            });

            editDialog.showModal();
        }
        
        function calculateAddDialogTotalDocument() {
            const items = Array.from(document.querySelectorAll(`#${dialogName} .product-item`));
            const total = items.reduce((acc, item) => {
                if (item.classList.contains("text-red-500")) return acc;
                const quantity = Number(item.children[3].textContent);
                const price = Number(item.children[4].textContent);
                return acc + quantity * price;
            }, 0);
            return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

   
        ulDetail.addEventListener("click", (e) => {
            clearListItemBackground();
            updateFocusDetail(Array.from(ulDetail.children).indexOf(e.target.parentElement));
            
        });

        ulDetail.addEventListener("keydown", (e) => {
      
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const totalItems = ulDetail.children.length;
                if (e.key === "ArrowDown") {
                    itemDetailIndex = (itemDetailIndex + 1) % totalItems;
                } else if (e.key === "ArrowUp") {
                    itemDetailIndex = (itemDetailIndex - 1 + totalItems) % totalItems;
                }
                updateFocusDetail(itemDetailIndex);
            }
        });
        
        function updateFocusDetail(index) {
        
            const items = Array.from(ulDetail.children).filter(el => el.tagName === "LI");
            items[index].focus();
            itemDetailIndex = index;
        };
    }

                            
};