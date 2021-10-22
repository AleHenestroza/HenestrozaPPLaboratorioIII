const $ = id => {
	return document.getElementById(id);
};

const cargaInicial = () => {
	cargaPersonas();
	cargaLocalidades();
};

const cargaPersonas = () => {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		// Sintaxis function() para no perder acceso al objeto "this"
		if (this.readyState == 4 && this.status == 200) {
			$('divSpinner').hidden = true;
			// Parseo la respuesta
			const res = JSON.parse(this.responseText);
			// Cargo las personas que vienen de la respuesta
			res.forEach(function (persona) {
				crearFila(persona);
			});
		}
	};
	xhttp.open('GET', 'http://localhost:3000/personas');
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

const cargaLocalidades = () => {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		// Sintaxis function() para no perder acceso al objeto "this"
		if (this.readyState == 4 && this.status == 200) {
			$('divSpinner').hidden = true;
			// Parseo la respuesta
			const res = JSON.parse(this.responseText);
			// Cargo las personas que vienen de la respuesta
			res.forEach(function (localidad) {
				crearOptionLocalidades(localidad);
			});
		}
	};
	xhttp.open('GET', 'http://localhost:3000/localidades');
	xhttp.send();
};

const crearOptionLocalidades = localidad => {
	const option = document.createElement('option');
	option.value = localidad.id;
	option.innerText = localidad.nombre;
	$('selectLocalidades').appendChild(option);
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

const updatePersona = (fila, personaJson) => {
	const req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (req.status == 200 && req.readyState == 4) {
			$('divSpinner').hidden = true;
			fila.childNodes[1].innerText = personaJson.nombre;
			fila.childNodes[2].innerText = personaJson.apellido;
			fila.childNodes[3].innerText = personaJson.localidad.nombre;
			fila.childNodes[4].innerText = personaJson.sexo;
			cerrarFormPersona();
		}
	};
	req.open('POST', 'http://localhost:3000/editar');
	req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	req.send(JSON.stringify(personaJson));
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

		updatePersona(fila, jsonPersona);
	}
};

const eliminarPersona = (fila, id) => {
	const jsonIdPersona = { id: id };
	const req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (req.status == 200 && req.readyState == 4) {
			$('divSpinner').hidden = true;
			$('tabla').removeChild(fila);
			cerrarFormPersona();
		}
	};
	req.open('POST', 'http://localhost:3000/eliminar');
	req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	req.send(JSON.stringify(jsonIdPersona));
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

	// Agrego event listeners a los botones (pasandoles la fila y el id de la persona seleccioanda)
	$('btnModificar').onclick = function () {
		$('divSpinner').hidden = false;
		modificarPersona(fila, id);
	};
	$('btnEliminar').onclick = function () {
		$('divSpinner').hidden = false;
		eliminarPersona(fila, id);
	};
};

window.addEventListener('load', cargaInicial);
