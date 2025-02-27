import { showDialog } from "./showdialog.message.js";


    const dataList = document.getElementById("data-list");
    export async function loadUsers() {
                try {
                    const response = await fetch("/mant-load-users");
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
                    // Eliminar tabindex del elemento actual
                    items.forEach((item, i) => item.setAttribute("tabindex", i === index ? "0" : "-1"));

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
                    }
                }

                
        
               

                function deleteItem(e) {
                    const itemId = e.target.getAttribute("data-id");
                    if (confirm("¿Está seguro de eliminar esta usario?")) deleteUser(itemId);
                    if (indexSeleccionado > 0) {
                        document.dispatchEvent(eventoArrowUp);
                    } else {
                        document.dispatchEvent(eventoArrowDown);
                    }
                    e.target.parentElement.parentElement.remove();
                }

                async function editItem(e) {
                    const itemId = Number(e.target.getAttribute("data-id"));
                    const editDialog = document.getElementById("edit-dialog");
                    editUser(itemId);
                    editDialog.showModal();
                }

                document.querySelector('#edit-dialog #cancel').addEventListener('click', closeEditDialog);
                function closeEditDialog() {
                        const editDialog = document.getElementById('edit-dialog');
                        editDialog.close();
                    }

                function editUser(params) {
                    fetch("/mant-edit-user", {
                        method: 'POST',
                        body: JSON.stringify({ id: params }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Error al editar usuario.');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            console.log(data)
                            const form = document.getElementById('edit-form');
                            const userId = document.getElementById('user-id');
                            userId.textContent = data.id;
                            form.elements['username'].value = data.username;
                            form.elements['email'].value = data.email;
                            form.elements['name'].value = data.name;
                            form.elements['last_name'].value = data.last_name;
                            form.elements['phone'].value = data.phone;
                            form.elements['created_at'].value = data.created_at;
                            form.elements['role'].value = data.role;
                            form.elements['is_active'].value = data.is_active;
                        

                        })
                        .catch((error) => {
                            console.error(error);
                            showDialog(false, error.message);
                        });

                }
                


                document.querySelector("#edit-form").addEventListener("submit", (event) => {
                    event.preventDefault();
                    const productId =Number( document.getElementById("user-id").textContent);
                    const formData = new FormData(event.target);
                    const formObject = Object.fromEntries(formData);
                    formObject.id=productId;
                    updateUser(formObject);
                    
                });

                async function updateUser(formObject) {

                    try {
                        const response = await fetch("/mant-update-user", {
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
                            document.querySelector("#edit-form").reset();
                            updateUserList(data.data);
                            const editDialog = document.getElementById("edit-dialog");
                            editDialog.close();
                        }
                    } catch (error) {
                        console.error(error);
                        showDialog(false, error.message);
                    }
                };

                document.getElementById('add-product').addEventListener('click', showAddDialog);
                async function showAddDialog(){
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


                    const inputPassword = document.getElementById("password");
                    const inputConfirmPassword = document.getElementById("confirm-password");

                    if (inputPassword.value !== inputConfirmPassword.value) {
                        showDialog(false, "Las contraseñas no coinciden");
                        return;
                    }

                    const formData = new FormData(event.target);
                    const formObject = Object.fromEntries(formData);
                    console.log(formObject)
                    
                    const url = "/mant-add-user";
                    addUser(url, formObject);
                });

                async function addUser(url, formData) {
                    try {
                        const response = await fetch(url, {
                        method: "POST",
                        body: JSON.stringify(formData),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                        });
                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(data.message + response.statusText);
                        }
                        const data = await response.json();
                        if (data) {

                            showDialog(data.success, data.message);
                            document.querySelector("#add-form").reset();
                            insertIntoUserList(data.data);
                            closeAddDialog();
                        }
                    } catch (error) {
                        console.error(error);
                        showDialog(false, error.message);
                    }
                }

               

                function insertIntoUserList(data) {
                    console.log(data)
                  
                    const item = document.createElement("li");
                    item.setAttribute("data-id",`${data[0]}`)
                    item.classList.add("grid","grid", "grid-cols-12", "p-1", "focus:text-white","focus:bg-blue-500", "focus:outline-none", "focus:ring-2", "focus:ring-blue-300", "focus:ring-offset-2", "w-full");
                    item.innerHTML = `
                    `+`<div class="id">${data[0]}</div>
                    `+`<div class="username">${data[1]}</div>
                    `+ `<div class="email col-span-2">${data[2]}</div>
                    `+ `<div class="name">${data[4]}</div>
                    `+ `<div class="last_name">${data[5]}</div>
                    `+ `<div class="phone">${data[6]}</div>
                    `+ `<div class="created_at">${data[7]}</div> 
                    `+ `<div class="role">${data[8]}</div> 
                    `+`<div class="is_active">${data[9]==="1" ? "Activo": "Inactivo"}</div>                   
                    `+`<button><i data-id=${data[0]} class="bi bi-pencil hover:text-green-500 edit"></i></button>
                    `+ `<button><i data-id=${data[0]} class="bi bi-trash hover:text-red-500 delete"></i></button>`;
                    lista.appendChild(item);
                    const newIndex = lista.children.length - 1;
                    item.setAttribute("tabindex", "-1");
                    items = Array.from(lista.children);
                    addLiEventClick(items);
                    //lista.children[newIndex].focus();
                    indexSeleccionado = newIndex;
                }

                function updateUserList(data) {
                   console.log(data)
                    
                    const item = document.querySelector(`#lista li[data-id="${data[8]}"`);
               
                    item.children[1].textContent = data[0];
                    item.children[2].textContent = data[1];
                    item.children[3].textContent = data[2];
                    item.children[4].textContent = data[3];
                    item.children[5].textContent = data[4];
                    item.children[7].textContent = data[5];
                    item.children[8].textContent = data[2]==="1" ? "Activo": "Inactivo" ;
                    
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

                async function deleteUser(id) {
                    try {
                        const response = await fetch("/mant-delete-user", {
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