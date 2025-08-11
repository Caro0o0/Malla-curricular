document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos todos los ramos
    const ramos = document.querySelectorAll('.semestre li');
    // Obtenemos los ramos aprobados del almacenamiento local o un array vacío si no hay ninguno
    let approvedRamos = JSON.parse(localStorage.getItem('approvedRamos')) || [];

    // Función para actualizar la UI de los ramos
    const updateRamoStatus = () => {
        ramos.forEach(ramo => {
            const ramoName = ramo.dataset.ramo;
            const prerequisitos = JSON.parse(ramo.dataset.prerequisitos);
            
            // Verificamos si el ramo ya ha sido aprobado
            if (approvedRamos.includes(ramoName)) {
                ramo.classList.add('aprobado');
                ramo.classList.remove('bloqueado');
            } else {
                // Verificamos si los prerequisitos están aprobados
                const prerequisitosCumplidos = prerequisitos.every(prerequisito => approvedRamos.includes(prerequisito));
                
                if (prerequisitosCumplidos || prerequisitos.length === 0) {
                    ramo.classList.remove('bloqueado');
                    ramo.classList.add('disponible'); // Un estado visual para ramos disponibles, si se desea
                    ramo.style.cursor = 'pointer';
                } else {
                    ramo.classList.add('bloqueado');
                    ramo.classList.remove('aprobado');
                    ramo.style.cursor = 'not-allowed';
                }
            }
        });
    };

    // Función para manejar el clic en un ramo
    const handleRamoClick = (e) => {
        const clickedRamo = e.target;
        const ramoName = clickedRamo.dataset.ramo;
        const prerequisitos = JSON.parse(clickedRamo.dataset.prerequisitos);

        // Si el ramo ya está aprobado, no hacemos nada
        if (approvedRamos.includes(ramoName)) {
            return;
        }

        // Verificamos si los prerequisitos están cumplidos
        const prerequisitosFaltantes = prerequisitos.filter(prerequisito => !approvedRamos.includes(prerequisito));

        if (prerequisitosFaltantes.length > 0) {
            // Si faltan requisitos, mostramos una alerta
            showPrerequisitoAlert(ramoName, prerequisitosFaltantes);
        } else {
            // Si todos los requisitos están cumplidos, aprobamos el ramo
            approvedRamos.push(ramoName);
            localStorage.setItem('approvedRamos', JSON.stringify(approvedRamos));
            updateRamoStatus();
        }
    };

    // Función para mostrar la alerta de requisitos faltantes
    const showPrerequisitoAlert = (ramoName, prerequisitosFaltantes) => {
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert');
        alertDiv.innerHTML = `
            <h3>Ramo bloqueado: ${ramoName}</h3>
            <p>Debes aprobar los siguientes ramos primero:</p>
            <ul>
                ${prerequisitosFaltantes.map(req => `<li>${req}</li>`).join('')}
            </ul>
            <button onclick="this.parentElement.remove()">Entendido</button>
        `;
        document.body.appendChild(alertDiv);
    };

    // Asignar el evento click a todos los ramos
    ramos.forEach(ramo => {
        ramo.addEventListener('click', handleRamoClick);
    });

    // Inicializar el estado de los ramos al cargar la página
    updateRamoStatus();
});
