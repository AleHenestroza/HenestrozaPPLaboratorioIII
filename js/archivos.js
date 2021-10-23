const $ = id => {
	return document.getElementById(id);
};

const hideSpinner = () => {
	$('divSpinner').classList.remove('spinner-display');
	$('divSpinner').classList.add('hidden');
};

const showSpinner = () => {
	$('divSpinner').classList.add('spinner-display');
	$('divSpinner').classList.remove('hidden');
};

const getPersonas = (resolve, reject) => {
	const xhttp = new XMLHttpRequest();
	// onload() implica ya un readyState == 4
	xhttp.onload = function () {
		// Sintaxis function() para no perder acceso al objeto "this"
		// 200 <= status < 300 indica una respuesta exitosa del servidor (la mas comun es 204)
		if (this.status >= 200 && this.status < 300) {
			// Parseo la respuesta
			const personas = this.response;
			resolve(JSON.parse(personas));
		} else {
			reject(this.statusText);
		}
	};
	xhttp.open('GET', 'http://localhost:3000/personas', true);
	xhttp.send();
};

const crearFila = persona => {
	const fila = document.createElement('tr');
	const id = document.createElement('td');
	const nombre = document.createElement('td');
	const apellido = document.createElement('td');
	const localidad = document.createElement('td');
	const sexo = document.createElement('td');

	id.innerText = persona.id;
	nombre.innerText = persona.nombre;
	apellido.innerText = persona.apellido;
	localidad.innerText = persona.localidad.nombre;
	sexo.innerText = persona.sexo;

	fila.appendChild(id);
	fila.appendChild(nombre);
	fila.appendChild(apellido);
	fila.appendChild(localidad);
	fila.appendChild(sexo);

	fila.addEventListener('dblclick', desplegarFormFila);

	$('tabla').appendChild(fila);
};

const cargaPersonas = () => {
	const request = new Promise(getPersonas);
	request
		.then(personas => {
			personas.forEach(persona => {
				crearFila(persona);
			});
			hideSpinner();
		})
		.catch(error => {
			alert(`Hubo un error al cargar los datos.\n${error}`);
		});
};

const getLocalidades = (resolve, reject) => {
	const xhttp = new XMLHttpRequest();
	// onload() implica ya un readyState == 4
	xhttp.onload = function () {
		// Sintaxis function() para no perder acceso al objeto "this"
		// 200 <= status < 300 indica una respuesta exitosa del servidor (la mas comun es 204)
		if (this.status >= 200 && this.status < 300) {
			// Parseo la respuesta
			const personas = this.response;
			resolve(JSON.parse(personas));
		} else {
			reject(this.statusText);
		}
	};
	xhttp.open('GET', 'http://localhost:3000/localidades', true);
	xhttp.send();
};

const crearOptionLocalidades = localidad => {
	const option = document.createElement('option');
	option.value = localidad.id;
	option.innerText = localidad.nombre;
	$('selectLocalidades').appendChild(option);
};

const cargaLocalidades = () => {
	const request = new Promise(getLocalidades);
	request
		.then(localidades => {
			localidades.forEach(localidad => {
				crearOptionLocalidades(localidad);
			});
			hideSpinner();
		})
		.catch(error => {
			alert(`Hubo un error al cargar los datos.\n${error}`);
		});
};

const cerrarFormPersona = () => {
	$('divFormPersona').classList.add('hidden');
};

const validarInputs = () => {
	let flagNombre = true;
	let flagSexo = true;
	let flagApellido = true;

	if ($('txtNombre').value.length < 3) {
		$('txtNombre').style.borderColor = 'red';
		flagNombre = false;
	}

	if ($('txtApellido').value.length < 3) {
		$('txtApellido').style.borderColor = 'red';
		flagApellido = false;
	}

	if (!($('male').checked || $('female').checked)) {
		flagSexo = false;
	}
	return flagNombre && flagApellido && flagSexo;
};

const updatePersona = personaJson => {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.onload = function () {
			if (req.status >= 200 && req.status < 300) {
				resolve();
			} else {
				reject();
			}
		};
		req.open('POST', 'http://localhost:3000/editar');
		req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		req.send(JSON.stringify(personaJson));
	});
};

const modificar = (fila, personaJson) => {
	const request = updatePersona(personaJson);
	request
		.then(() => {
			hideSpinner();
			fila.childNodes[1].innerText = personaJson.nombre;
			fila.childNodes[2].innerText = personaJson.apellido;
			fila.childNodes[3].innerText = personaJson.localidad.nombre;
			fila.childNodes[4].innerText = personaJson.sexo;
			cerrarFormPersona();
		})
		.catch(error => {
			alert(error);
		});
};

const modificarPersona = (fila, id) => {
	if (validarInputs()) {
		const nombreInput = $('txtNombre').value;
		const apellidoInput = $('txtApellido').value;
		const localidadText = $('selectLocalidades').selectedOptions[0].text; // La forma mas facil de obtener el texto de la opcion seleccionada;
		const localidadInput = {
			id: $('selectLocalidades').value,
			nombre: localidadText,
		};
		let sexoInput;
		if ($('male').checked) {
			sexoInput = sexoInput = 'Male';
			$('female').checked = false;
		} else {
			sexoInput = sexoInput = 'Female';
			$('male').checked = false;
		}

		const jsonPersona = {
			id: id,
			nombre: nombreInput,
			apellido: apellidoInput,
			localidad: localidadInput,
			sexo: sexoInput,
		};

		modificar(fila, jsonPersona);
	}
};

const desplegarFormFila = event => {
	$('divFormPersona').classList.remove('hidden');
	$('btnCerrar').onclick = cerrarFormPersona;

	const fila = event.target.parentNode;
	const id = fila.childNodes[0].innerText;
	const nombre = fila.childNodes[1].innerText;
	const apellido = fila.childNodes[2].innerText;
	const localidad = fila.childNodes[3].innerText;
	const sexo = fila.childNodes[4].innerText;

	$('txtNombre').value = nombre;
	$('txtApellido').value = apellido;

	const localidades = $('selectLocalidades');
	// Itero sobre cada opcion del select para marcar la que deberia estar seleccionada
	// Tengo que convertir el listado de opciones a un Array para poder iterar sobre el con la funcion forEach()
	Array.from(localidades.options).forEach(opcion => {
		if (opcion.innerText == localidad) opcion.selected = true;
	});

	if (sexo == 'Female') {
		$('female').checked = true;
		$('male').checked = false;
	} else {
		$('male').checked = true;
		$('female').checked = false;
	}

	// Agrego event listeners a modificar
	$('btnModificar').onclick = function () {
		showSpinner();
		modificarPersona(fila, id);
	};
};

const cargaInicial = () => {
	cargaPersonas();
	cargaLocalidades();
};

window.addEventListener('load', cargaInicial);
