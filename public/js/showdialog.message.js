export function showDialog(success, message) {
	const myDialog = document.createElement("dialog");
	myDialog.classList.add("fixed", "m-auto", "flex", "justify-center", "items-center", "gap-4", "w-[400px]", "p-6", "bg-white", "border", "rounded-lg", "shadow-lg", "z-50");
	
	const myMessage = document.createElement("p");
	myMessage.classList.add("text-lg", "text-center");
	myMessage.textContent = message;

	const iError = document.createElement("i");
	iError.classList.add("bi", "bi-ban", "text-red-500", "text-4xl");

	const iSuccess = document.createElement("i");
	iSuccess.classList.add("bi", "bi-check-circle", "text-green-500", "text-4xl");

	if (success) {
		iError.classList.add("hidden");
	} else {
		iSuccess.classList.add("hidden");
	}

	myDialog.appendChild(iError);
	myDialog.appendChild(iSuccess);
	myDialog.appendChild(myMessage);

	document.body.appendChild(myDialog);

	myDialog.showModal();

	setTimeout(() => {
		myDialog.close();
		document.body.removeChild(myDialog);
	}, 3000);
}
