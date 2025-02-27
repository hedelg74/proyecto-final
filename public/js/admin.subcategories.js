import { showDialog } from "./showdialog.message.js";


    const dataList = document.getElementById("data-list");

    export async function loadSubCategories() {
                try {
                    const response = await fetch("/mant-load-subcategory-list");
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

    // Establecer tabindex inicial
    items.forEach((item, index) => {
        item.setAttribute("tabindex", index === indexSeleccionado ? "0" : "-1");
    });
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
            if (confirm("¿Está seguro de eliminar esta subcategoria?")) deleteItem(e);
        } else if (e.target.classList.contains("edit")) {
            editItem(e);
        }
    }

    function deleteItem(e) {
        const itemId = e.target.getAttribute("data-id");
        deleteSubCategory(itemId);
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
        editCategory(itemId);
        editDialog.showModal();
    }

    document.querySelector('#edit-dialog #cancel').addEventListener('click', closeEditDialog);
    function closeEditDialog() {
        const editDialog = document.getElementById('edit-dialog');
        editDialog.close();
    }

    function editCategory(params) {
        fetch("/mant-edit-subcategory", {
            method: 'POST',
            body: JSON.stringify({ id: params }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al editar categoria');
                }
                return response.json();
            })
            .then((data) => {
                        
                const form = document.getElementById('edit-form');
                const subCcategoryId = document.getElementById('subcategory-id');
                            
                form.elements['name'].value = data.data[0].name;
                subCcategoryId.textContent = data.data[0].id;
                            
            })
            .catch((error) => {
                console.error(error);
                showDialog(false, error.message);
            });

    }
                
            
    document.querySelector("#edit-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const categoryId = Number(document.getElementById("subcategory-id").textContent);
        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData);
        formObject.id = categoryId;
        updateCategory(formObject);
        closeEditDialog();
                    
    });

                

    async function updateCategory(formObject) {
        try {
            const response = await fetch("/mant-update-subcategory", {
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
                const item = lista.children[indexSeleccionado];
                item.children[1].textContent = data.data[0];
                showDialog(data.success, data.message);
            }
        } catch (error) {
            console.error(error);
            showDialog(false, error.message);
        }
    };

    document.getElementById('add-subcategory').addEventListener('click', showAddDialog);
    async function showAddDialog() {
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
        }, 3000);
                        
                        
    };

    document.querySelector("#add-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const formObject = Object.fromEntries(formData);
        const url = "/mant-add-subcategory";
        addSubCategory(url, formObject);
    });
    
    
    async function addSubCategory(url, formObject) {
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
                insertIntocategoryList(data.data);
                closeAddDialog();
            }
        } catch (error) {
            console.error(error);
            showDialog(false, error.message);
        }
    }


    function insertIntocategoryList(data) {
    
        const item = document.createElement("li");
        item.classList.add("grid","grid", "grid-cols-8","p-1", "focus:text-white","focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2d");
        item.innerHTML = `
        `+`<div>${data[0]}</div>
        `+`<div>${data[1]}</div>
        `+`<button><i data-id=${data[0]} class="bi bi-pencil hover:text-green-500 edit"></i></button>
        `+`<button><i data-id=${data[0]} class="bi bi-trash hover:text-red-500 delete"></i></button>`;
        lista.appendChild(item);
        const newIndex = lista.children.length - 1;
        item.setAttribute("tabindex", "-1");
        items = Array.from(lista.children);
        addLiEventClick(items);
        indexSeleccionado = newIndex;
    }
    
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

    async function deleteSubCategory(id) {
        try {
            const response = await fetch("/mant-delete-subcategory", {
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