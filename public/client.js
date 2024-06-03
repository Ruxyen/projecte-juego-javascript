const socket = io();

let currentSalaId = null;
let isSalaCreator = false;

 // Función para mostrar la pantalla de carga
 function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.visibility = 'visible';
}

// Función para ocultar la pantalla de carga
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 1s ease-in-out';

    // Ocultar completamente después de la transición
    setTimeout(function () {
        loadingScreen.style.visibility = 'hidden';
    }, 1000); // 1000 ms = 1 segundo (duración de la transición)
}

document.addEventListener('DOMContentLoaded', (event) => {
    const urlPath = window.location.pathname;
    const parts = urlPath.split('/');
    if (parts.length === 3 && parts[1] === 'sala' && parts[2] !== '') {
        currentSalaId = parts[2];
        // Aquí necesitarías alguna lógica para determinar si el usuario es el creador o no
        updateUIForRole(isSalaCreator);
    } else {
        document.getElementById('createGame').style.display = 'block';
        document.getElementById('joinGame').style.display = 'block';
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('main-container').style.display = 'none';
    }
});

function displayElement(id, style) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = style;
    } else {
        // En lugar de lanzar un error, puedes optar por registrar un mensaje de advertencia o simplemente ignorarlo.
        console.warn(`Intento de actualizar un elemento no encontrado: ${id}. Ignorando.`);
    }
}
function updateUIForRole(isCreator) {
    const updateElementDisplay = (id, displayStyle) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = displayStyle;
        } else {
            console.error(`Elemento no encontrado: ${id}`);

        }
    };

    const startGameButton = document.getElementById('startGameButton');
    const leaveRoomButton = document.getElementById('leaveRoomButton');
    const closeRoomButton = document.getElementById('closeRoomButton');

    if (startGameButton) startGameButton.style.display = isCreator ? 'block' : 'none';
    if (leaveRoomButton) leaveRoomButton.style.display = isCreator ? 'none' : 'block';
    if (closeRoomButton) closeRoomButton.innerText = isCreator ? 'CERRAR SALA' : 'SALIR DE SALA';
    if (closeRoomButton) closeRoomButton.onclick = isCreator ? closeRoom : leaveRoom;

    // Actualiza la UI según el rol del usuario
    displayElement('salaInfo', 'block');
    displayElement('main-container', isCreator ? 'grid' : 'none');
    displayElement('top-bar', 'flex');
    displayElement('leaveRoomButton', isCreator ? 'none' : 'block');
    displayElement('closeRoomButton', isCreator ? 'block' : 'none');
    displayElement('startGameButton', isCreator ? 'block' : 'none');
    displayElement('categoriaDiv', isCreator ? 'block' : 'block');
}


function joinRoom() {
    const playerName = document.getElementById('playerNameFloating').value;
    if (playerName) {
        socket.emit('joinGame', { playerName, salaId: currentSalaId });
        document.getElementById('salaInfo').style.display = 'block';
        document.getElementById('floatingForm').style.display = 'none';
    } else {
        alert('Por favor, introduce tu nombre.');
    }
}

function createGame() {
    // Mostrar pantalla de carga
    showLoadingScreen();
    var salaName = document.getElementById("salaName").value;
    const playerName = document.getElementById('creatorName').value;
    if (salaName && playerName) {
        socket.emit('createGame', { salaName, playerName });
        document.getElementById('createContainer').style.display = 'none';
        document.getElementById('salaInfo').style.display = 'block';
        document.getElementById('top-bar').style.display = 'block';
        document.getElementById('startGameButtonContainer').style.display = 'block';
        document.getElementById('startGameButton').style.display = 'block';
        document.getElementById('main-container').style.display = 'none'
        
         document.getElementById("salaName").style.display = "block";

        
    } else {
        alert('Por favor, introduce el nombre de la sala y tu nombre.');
    }
     // Simulación de espera de 3 segundos antes de ocultar la pantalla de carga
     setTimeout(function () {
        // Ocultar pantalla de carga
        hideLoadingScreen();
        document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loadingText').style.display = 'none';
    }, 3000);
}

function joinGame() {
    // Mostrar pantalla de carga
    showLoadingScreen();
    const playerName = document.getElementById('playerName').value;
    const salaCode = document.getElementById('salaCode').value;
    if (playerName && salaCode) {
        currentSalaId = salaCode;
        currentSalaName = 'Nombre de la sala desconocido'; // Actualizar si es posible
        socket.emit('joinGame', { playerName, salaId: salaCode });
        document.getElementById('createContainer').style.display = 'none';
        document.getElementById('categoriaDiv').style.display = 'none';
        document.getElementById('categoriasTitle').style.display = 'none';
        document.getElementById('main-container').style.display = 'none';

        document.getElementById('playersTitle').style="margin-left: 33%; top: 170px;";
     

        document.getElementById('playersContainer').style="margin-top: 320%; width: 800%; margin-left: -190px; height: 55vh;";
       

        


        


        


        // Resto del código...
    } else {
        alert('Por favor, introduce tu nombre y el código de la sala.');
    }
     // Simulación de espera de 3 segundos antes de ocultar la pantalla de carga
     setTimeout(function () {
        // Ocultar pantalla de carga
        hideLoadingScreen();
        document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loadingText').style.display = 'none';
    }, 3000);
}

function joinSpecificGame() {
    const playerName = document.getElementById('specificPlayerName').value;
    if (playerName) {
        socket.emit('joinGame', { playerName, salaId: currentSalaId });
    } else {
        alert('Por favor, introduce tu nombre.');
    }
}

function startGame() {
    // Mostrar pantalla de carga
    showLoadingScreen();
    // Verificar si se ha seleccionado una categoría
    const selectedCategory = document.querySelector('#categoriaDiv button.selected');
    if (!selectedCategory) {
        // Si no se ha seleccionado ninguna categoría, mostrar un mensaje de alerta
        alert('Por favor selecciona una categoría antes de iniciar la partida.');
        return; // Salir de la función si no se ha seleccionado una categoría
    }

    // Si se ha seleccionado una categoría, continuar con el inicio del juego
    socket.emit('startGame', currentSalaId);
    document.getElementById('categoriaDiv').style.display = 'none'; // Ocultar botones de categoría
    document.getElementById('salaInfo').style.display = 'none';
    document.getElementById('question').style.display = 'block';
    document.getElementById('feedback').style.display = 'block';
    // Simulación de espera de 3 segundos antes de ocultar la pantalla de carga
    setTimeout(function () {
        // Ocultar pantalla de carga
        hideLoadingScreen();
        document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loadingText').style.display = 'none';
    }, 3000);
    
   
}



function submitAnswer() {
    if (isSalaCreator) {
        // Si el usuario es el creador, no hace nada o muestra un mensaje
        console.log('El creador no puede responder a las preguntas.');
        return;
    }
    const answer = document.getElementById('answer').value;
    if (answer) {
        socket.emit('answer', { salaId: currentSalaId, answer });
    } else {
        alert('Por favor, selecciona una respuesta.');
    }
}

function mostrarBotonesCategoria() {
    // Encuentra el contenedor de la información de la sala
    const salaInfoDiv = document.getElementById('salaInfo');

    // Crea un nuevo div para las categorías si aún no existe
    let categoriaDiv = document.getElementById('categoriaDiv');
    if (!categoriaDiv) {
        categoriaDiv = document.createElement('div');
        categoriaDiv.id = 'categoriaDiv';
        // Inserta el nuevo div de categorías antes de la información de la sala
        salaInfoDiv.parentNode.insertBefore(categoriaDiv, salaInfoDiv);
    }

    // Limpia el div existente para evitar duplicados
    categoriaDiv.innerHTML = '';

    // Define las categorías disponibles
    const categorias = ['gastronomia', 'deportes', 'tecnologia', 'peliculas'];

    // Crea los botones de categoría con un atributo 'data-categoria'
    categorias.forEach(cat => {
        const button = document.createElement('button');
        button.innerText = cat;
        button.setAttribute('data-categoria', cat); // Añadir atributo para identificar el botón
        button.onclick = () => seleccionarCategoria(cat);
        categoriaDiv.appendChild(button);
    });
}

function seleccionarCategoria(categoria) {
    // Eliminar la clase 'selected' de todos los botones de categoría
    const categoriaButtons = document.querySelectorAll('#categoriaDiv button');
    categoriaButtons.forEach(button => {
        button.classList.remove('selected');
    });

    // Agregar la clase 'selected' al botón de la categoría seleccionada
    const selectedButton = document.querySelector(`#categoriaDiv button[data-categoria="${categoria}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }

    // Emitir el evento de cambio de categoría al servidor
    socket.emit('changeCategory', { salaId: currentSalaId, categoria });
}

let currentSalaName = null;

socket.on('gameCreated', ({ salaId, salaName, isCreator }) => {
    currentSalaId = salaId;
    isSalaCreator = isCreator;
    updateUIForRole(isCreator);


    // Asegúrate de que los elementos que necesitas actualizar realmente existen
    const topBar = document.getElementById('top-bar'); // Obtiene el elemento top-bar
    const salaCodeDisplay = document.getElementById('salaCodeDisplay');
    const startGameButton = document.getElementById('startGameButton');
    const mainContainer = document.getElementById('main-container');
    const closeRoomButton = document.getElementById('closeRoomButton');

    if (isCreator) {
        updateUIForRole(isCreator);

        closeRoomButton.innerText = 'CERRAR SALA';
        closeRoomButton.onclick = closeRoom; // Asignar la función para cerrar la sala
    } else {

        closeRoomButton.innerText = 'SALIR DE SALA';
        closeRoomButton.onclick = leaveRoom; // Asignar la función para salir de la sala
    }

    if (startGameButton) {
        startGameButton.style.display = isCreator ? 'block' : 'none';
    }
    if (salaCodeDisplay && startGameButton && mainContainer) {
        salaCodeDisplay.innerText = `${salaId}`;
        // Muestra los elementos pertinentes
        topBar.style.display = 'flex'; // Muestra el top-bar

        mainContainer.style.display = 'grid'; // Asumiendo que quieres usar un layout de grid aquí
        startGameButton.style.display = isCreator ? 'block' : 'none';

        // Si el usuario es el creador, muestra los botones de categoría
        if (isCreator) {
            mostrarBotonesCategoria();
        }
    } else {
        console.error('Algunos elementos no se encontraron en el DOM.');
    }
});

// Función para manejar la acción de 'Cerrar Sala' por parte del creador
function closeRoom() {
    if (confirm("¿Estás seguro de que quieres cerrar la sala?")) {
        socket.emit('closeRoom', { salaId: currentSalaId });
        // Opcionalmente, redirige al creador a la página de inicio o a otra página
        window.location.href = 'main.html';
    }
}

// Función para manejar la acción de 'Salir de Sala' por parte de un jugador
function leaveRoom() {

    if (confirm("¿Estás seguro de que quieres salir de la sala?")) {
        socket.emit('leaveRoom', { salaId: currentSalaId });
        // Opcionalmente, redirige al jugador a la página de inicio o a otra página
        window.location.href = 'main.html';
    }
}

// Evento recibido cuando la sala se cierra
socket.on('roomClosed', () => {
    alert('La sala ha sido cerrada por el administrador.');
    // Redirige a todos los usuarios fuera de la sala
    window.location.href = 'main.html';
});


// Evento recibido cuando un jugador deja la sala
socket.on('playerLeft', ({ playerId }) => {
    // Aquí puedes actualizar la lista de jugadores para eliminar al que se fue
    if (playerId === socket.id) {
        // Si eres el jugador que ha dejado la sala, te rediriges a otra página
        window.location.href = '/';
    } else {
        // Si es otro jugador el que se ha ido, actualizas la lista sin redirigir
        removePlayerFromList(playerId);
    }
});


socket.on('playerJoined', ({ players, salaId, isCreator }) => {
    isSalaCreator = isCreator;
    updatePlayerList(players);
    updateUIForRole(isCreator);
    // Actualizar el código de la sala
    const salaCodeElement = document.getElementById('salaCodeDisplay');
    if (salaCodeElement) {

        salaCodeElement.innerText = `${salaId}`;
    }

    // Configurar la visibilidad de los elementos
    const topBarElement = document.getElementById('top-bar');
    const mainContainerElement = document.getElementById('main-container');
    const startGameButtonElement = document.getElementById('startGameButton');
    const closeRoomButtonElement = document.getElementById('closeRoomButton');
    const leaveRoomButtonElement = document.getElementById('leaveRoomButton');

    // Mostrar elementos pertinentes
    topBarElement.style.display = 'flex';
    mainContainerElement.style.display = 'grid';
    startGameButtonElement.style.display = isCreator ? 'block' : 'none'; // Solo el creador puede iniciar el juego

    // Configurar el botón de cerrar/salir de la sala según si el usuario es el creador
    if (isCreator) {
        updateUIForRole(isCreator);

        closeRoomButtonElement.style.display = 'block';
        leaveRoomButtonElement.style.display = 'none';
        closeRoomButtonElement.innerText = 'CERRAR SALA';
        closeRoomButtonElement.onclick = closeRoom; // Debes definir esta función
    } else {
        closeRoomButtonElement.style.display = 'none';
        leaveRoomButtonElement.style.display = 'block';
        document.getElementById('categoriaDiv').style.display = 'block';
        leaveRoomButtonElement.innerText = 'SALIR DE SALA';
        leaveRoomButtonElement.onclick = leaveRoom; // Debes definir esta función
    }

    // Ocultar los formularios de creación y unión de salas
    ['createGame', 'joinGame', 'joinSpecificGame'].forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = 'none';
        }
    });
});

// Definición de funciones
function hideAllUI() {
    // Oculta todos los elementos de la interfaz de usuario que no sean necesarios
    displayElement('main-container', 'none');
    displayElement('top-bar', 'none');
    // Comprobar si el elemento 'gameArea' y 'question' existen antes de intentar ocultarlos
    if (document.getElementById('gameArea')) {
        displayElement('gameArea', 'none');
    }
    if (document.getElementById('question')) {
        displayElement('question', 'none');
    }
    // ... cualquier otro elemento que necesites ocultar
}




function displayPodium(players) {
    // Ocultar elementos no necesarios y detener el temporizador
    hideAllUI();

    // Asumiendo que existe una función stopTimer() que detiene el temporizador y oculta el elemento del temporizador
    // Si no existe, necesitarás implementarla según cómo gestionas los temporizadores
    stopTimer(); // Detiene y oculta el temporizador del juego

    // Filtrar al creador/administrador para no mostrarlo en el podio
    const podiumPlayers = players.filter(player => !player.isCreator);

    // Construir el HTML del podio con los jugadores filtrados
    let podiumHTML = "<div class='podium'>";
    podiumPlayers.forEach((player, index) => {
        podiumHTML += `
                <div class='player'>
                    <span class='position'>${index + 1}.</span>
                    <span class='name'>${player.name}</span>
                    <span class='score'>${player.score} puntos</span>
                </div>`;
    });
    podiumHTML += '</div>';

    // Mostrar botones según el rol del usuario
    if (isSalaCreator) {
        podiumHTML += `
                <div id="podiumButtons" style="display: block; text-align: center;">
                    <button id="backToRoomButton" onclick="backToRoom()">Volver a la Sala</button>
                    <button id="restartGameButton" onclick="restartGame()">Reiniciar Partida</button>
                </div>
            `;
    } else {
        podiumHTML += `
                <div id="podiumButtons" style="display: block; text-align: center;">
                    <button id="backToRoomButton" onclick="backToRoom()">Volver a la Sala</button>
                </div>
            `;
    }

    // Mostrar el podio
    const podiumContainer = document.getElementById('podiumContainer');
    if (!podiumContainer) {
        const newPodiumContainer = document.createElement('div');
        newPodiumContainer.id = 'podiumContainer';
        document.body.appendChild(newPodiumContainer);
    }
    document.getElementById('podiumContainer').innerHTML = podiumHTML;
    document.getElementById('podiumContainer').style.display = 'block';
}

// Implementación de la función stopTimer como ejemplo
function stopTimer() {
    // Detiene el temporizador si está en funcionamiento
    if (typeof questionTimer !== 'undefined') {
        clearTimeout(questionTimer);
    }
    // Oculta o restablece el elemento del temporizador en la UI
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.style.display = 'none'; // Ocultar el temporizador
        timerElement.innerText = ''; // Opcional: Limpiar el texto del temporizador
    }
}







//podium
function buildPodium(players) {
    console.log('Construyendo podio para jugadores:', players);

    let podiumHTML = '<div id="podium">';

    // Agrega los jugadores al podio
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    sortedPlayers.forEach((player, index) => {
        const playerClass = index === 0 ? 'player top-player' : 'player';
        podiumHTML += `<div class="${playerClass}">${player.name} - ${player.score} puntos</div>`;
    });

    podiumHTML += '</div>'; // Cierra el div del podio

    // Agrega los botones con un estilo visible y eventos de clic (ejemplos)
    podiumHTML += `
            <div id="podiumButtons" style="display: block; text-align: center;">
                <button id="backToRoomButton" onclick="backToRoom()">Volver a la Sala</button>
                <button id="restartGameButton" onclick="restartGame()">Reiniciar Juego</button>
            </div>
        `;
    console.log('HTML del podio generado:', podiumHTML);

    return podiumHTML;
}



function backToRoom() {
    console.log("Volver a la sala");
    socket.emit('backToLobby', { salaId: currentSalaId });
}

function restartGame() {
    console.log("Reiniciar juego");
    socket.emit('restartGame', currentSalaId); // Emitir evento al servidor
}

// El servidor debería responder con un evento como 'updateLobby'
socket.on('updateLobby', ({ players, salaId, isCreator }) => {
    // Asegúrate de que el mensaje es para la sala actual
    if (currentSalaId === salaId) {
        isSalaCreator = isCreator;
        updateUIForLobby(players, salaId, isCreator);
    }
});

// Para el creador
socket.on('updateLobbyCreator', (data) => {
    if (isSalaCreator) {
        // Aquí actualizas la interfaz para el creador.
        updateUIForLobby(data.players, data.salaId, true);
    }
});

// Para los jugadores
socket.on('updateLobbyPlayer', (data) => {
    if (!isSalaCreator) {
        // Aquí actualizas la interfaz para los jugadores.
        updateUIForLobby(data.players, data.salaId, false);
    }
});

function updateUIForLobby(players, salaId, isCreator) {
    // Mostrar información de la sala y opciones para el creador
    updateUIForRole(isCreator);

    // Actualizar la lista de jugadores
    updatePlayerList(players);

    // Mostrar el contenedor de la sala
    displayElement('main-container', 'grid');
    displayElement('categoriaDiv', isCreator ? 'block' : 'block');
    displayElement('startGameButton', isCreator ? 'block' : 'none');
    displayElement('salaInfo', 'block');

    // Esconder el área de juego y el podio
    displayElement('gameArea', 'none');
    displayElement('podiumContainer', 'none');

    // Restablecer cualquier otra UI si es necesario
    displayElement('backToRoomButton', 'none'); // Ocultar botón de volver al lobby si está visible
    displayElement('restartGameButton', 'none'); // Ocultar botón de reiniciar juego si está visible

    // Especificar qué botón mostrar para el creador o para los jugadores
    const leaveRoomButton = document.getElementById('leaveRoomButton');
    const closeRoomButton = document.getElementById('closeRoomButton');
    const startGameButton = document.getElementById('startGameButton');

    if (isCreator) {
        if (closeRoomButton) {
            closeRoomButton.style.display = 'block';
            closeRoomButton.innerText = 'CERRAR SALA';
            closeRoomButton.onclick = closeRoom;
        }
        if (leaveRoomButton) leaveRoomButton.style.display = 'none';
        if (startGameButton) startGameButton.style.display = 'block';
    } else {
        if (closeRoomButton) closeRoomButton.style.display = 'none';
        if (leaveRoomButton) {
            leaveRoomButton.style.display = 'block';
            leaveRoomButton.innerText = 'SALIR DE SALA';
            leaveRoomButton.onclick = leaveRoom;
        }
        if (startGameButton) startGameButton.style.display = 'none';
    }
}




// Manejadores de eventos
socket.on('gameStarted', () => {
    console.log('Juego iniciado');

    hideAllUI();
    document.getElementById('gameArea').style.display = 'block';
});

socket.on('showPodium', (players) => {
    console.log('Jugadores recibidos para el podio:', players);

    // Llama a tu función que construye y muestra el podio
    const podiumHTML = buildPodium(players);

    // Inserta el HTML del podio en el contenedor del podio
    const podiumContainer = document.getElementById('podiumContainer');
    if (!podiumContainer) {
        const newPodiumContainer = document.createElement('div');
        newPodiumContainer.id = 'podiumContainer';
        document.body.appendChild(newPodiumContainer);
    }
    document.getElementById('podiumContainer').innerHTML = podiumHTML;

    // Asegúrate de que el podio y los botones sean visibles
    document.getElementById('podiumContainer').style.display = 'block';

    // Asegúrate de que el contenedor de botones también sea visible
    const podiumButtons = document.getElementById('podiumButtons');
    if (podiumButtons) {
        podiumButtons.style.display = 'block';
    }

    displayPodium(players);

});




socket.on('updatePlayerList', (players) => {
    // Actualiza la lista de jugadores para todos.
    updatePlayerList(players);
});

socket.on('gameRestarted', () => {
    console.log('Juego reiniciado');

    // Ocultar el podio y los botones de reinicio/vuelta a la sala
    displayElement('podiumContainer', 'none');
    displayElement('podiumButtons', 'none'); // Esta línea puede no ser necesaria si 'podiumButtons' está dentro de 'podiumContainer'

    // Mostrar la interfaz de juego y prepararla para una nueva pregunta
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = ''; // Limpiar el área de juego para nuevas preguntas
    displayElement('gameArea', 'block'); // Mostrar el área de juego

    // Restablecer la interfaz para reflejar que el juego está en curso
    updateUIForRole(isSalaCreator);
    displayElement('categoriaDiv', isSalaCreator ? 'block' : 'block'); // Mostrar los botones de categoría si el usuario es el creador
    displayElement('salaInfo', 'block'); // Mostrar la información de la sala
    displayElement('startGameButton', 'none'); // Ocultar el botón de inicio del juego, ya que el juego ya ha comenzado

    // Actualizar la lista de jugadores si es necesario
    // Si mantienes una lista de jugadores en el cliente, aquí deberías restablecer sus puntuaciones a 0
    // Esto dependerá de cómo manejes la lista de jugadores en el cliente.
    // Por ejemplo:
    // updatePlayerList(someUpdatedPlayersListWithScoresReset);
    restartGameUI();

});

function restartGameUI() {
    // Ocultar elementos no necesarios y mostrar el área de juego
    hideAllUI();
    displayElement('gameArea', 'block'); // Asegúrate de que 'gameArea' es el ID del contenedor donde se muestran las preguntas
    resetTimer(); // Asegúrate de que la lógica del temporizador se reinicie
}



// Función para restablecer el temporizador
function resetTimer() {
    // Si tienes un temporizador visible en la UI, asegúrate de restablecerlo
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.innerText = '30'; // O el tiempo que corresponda
        timerElement.style.display = 'block';
    }
    // Reiniciar el intervalo del temporizador si está corriendo
    if (currentIntervalId) {
        clearInterval(currentIntervalId);
    }
    currentIntervalId = setInterval(() => {
        let timeLeft = parseInt(timerElement.innerText, 10);
        timeLeft -= 1;
        timerElement.innerText = timeLeft.toString();
        if (timeLeft <= 0) {
            clearInterval(currentIntervalId);
            timerElement.style.display = 'none'; // Ocultar el temporizador al terminar
            // Aquí puedes añadir lógica si necesitas hacer algo cuando el temporizador llega a 0.
        }
    }, 1000);
}

 // Función para actualizar la lista de jugadores con los datos del servidor
 function updatePlayerList(players) {
    console.log('Actualizando lista de jugadores:', players);

    let playerListHTML = '';
    for (let playerId in players) {
        playerListHTML += `<div>${players[playerId].name}</div>`;
    }
    const playerListElement = document.getElementById('playerList');
    if (playerListElement) {
        playerListElement.innerHTML = playerListHTML;
    }
}


let currentIntervalId; // Almacenar el ID del intervalo actual
let questionHistory = []; // Al principio del script

socket.on('question', (question) => {
    // Clear the previous interval and game area content
    if (currentIntervalId) {
        clearInterval(currentIntervalId);
    }
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';

    // Add the question text
    const questionElement = document.createElement('div');
    questionElement.innerText = question.pregunta;
    gameArea.appendChild(questionElement);

    // Show the answer options. If the user is the creator, the buttons will be visible but disabled.
    question.respostes.forEach(resposta => {
        const button = document.createElement('button');
        button.innerText = resposta;
        if (isSalaCreator) {
            // Disable the button if the user is the creator
            button.disabled = true;
            button.style= "background-color:gray"
        } else {
            // Only attach the onclick handler if the user is not the creator
            button.onclick = () => submitAnswer(resposta, button); // Assuming submitAnswer is defined to handle the answer submission
        }
        gameArea.appendChild(button);
    });

    // Show the game area
    gameArea.style.display = 'block';

    // Set up the timer for all users, including the creator
    const timerElement = document.getElementById('timer');
    timerElement.style.display = 'block'; // Make the timer visible
    let timeLeft = question.timeLeft;
    timerElement.innerText = timeLeft;

    // Timer interval configuration
    currentIntervalId = setInterval(() => {
        timeLeft -= 1;
        timerElement.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(currentIntervalId);
            timerElement.style.display = 'none'; // Hide the timer when finished
        }
    }, 1000);

    // Limpia el mensaje de feedback
    const feedbackElement = document.getElementById('feedback');
    if (feedbackElement) {
        feedbackElement.style.display = 'block'; // Ocultar el elemento de feedback
    }

    questionHistory.push({ question: question.pregunta, correct: null }); // Agregar pregunta sin respuesta aún

});



function showQuestion(question) {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = ''; // Clear existing content

    // Add the question text
    const questionElement = document.createElement('div');
    questionElement.innerText = question.text;
    gameArea.appendChild(questionElement);

    // Add answer options only if the user is not the creator
    if (!isSalaCreator) {
        question.answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.innerText = answer;
            answerButton.addEventListener('click', function () {
                submitAnswer(answer);
            });
            gameArea.appendChild(answerButton);
        });
    }
}

function submitAnswer(answer, button) {
    // Deshabilitar todos los botones de respuesta
    const buttons = document.querySelectorAll('#gameArea button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('selected'); // Eliminar la clase 'selected' de todos los botones
    });

    // Marcar el botón seleccionado
    button.classList.add('selected');

    // Enviar respuesta al servidor
    socket.emit('answer', { salaId: currentSalaId, answer });
}

socket.on('answerFeedback', ({ correct, message }) => {
    const feedbackElement = document.getElementById('feedback'); // Asegúrate de que este es el ID correcto
    if (feedbackElement) {
        feedbackElement.innerText = message;
        feedbackElement.style.display = 'block'; // Asegúrate de que sea visible

        // Limpiar el mensaje después de 5 segundos, por ejemplo
        setTimeout(() => {
            feedbackElement.innerText = '';
            feedbackElement.style.display = 'black'; // Opcional: ocultarlo completamente
        }, 5000);
    } else {
        console.error('Elemento de feedback no encontrado');
    }
});









socket.on('timeWarning', ({ message }) => {
    const warningElement = document.createElement('div');
    warningElement.innerText = message;
    const gameArea = document.getElementById('gameArea');
    gameArea.appendChild(warningElement); // Asegúrate de que esto coloca el mensaje en el lugar correcto.
});



function updateQuestionHistory(isCorrect) {
    // Asumiendo que tienes un array para historial y un elemento en tu HTML para mostrarlo
    questionHistory.push({ question: currentQuestionText, isCorrect });
    displayQuestionHistory(); // Función que actualiza la UI con el nuevo historial
}


function displayQuestionHistory() {
    const historyElement = document.getElementById('history'); // Asumiendo que tienes un elemento para esto
    historyElement.innerHTML = ''; // Limpiar el historial actual
    questionHistory.forEach((item, index) => {
        const entry = document.createElement('div');
        entry.innerText = `Pregunta ${index + 1}: ${item.correct ? "CORRECTA" : "INCORRECTA"}`;
        historyElement.appendChild(entry);
    });
}
socket.on('endGame', (players) => {
    console.log('Juego terminado, recibiendo datos de endGame:', players);
    hideAllUI();
    const playersArray = Object.values(players);
    // Filtrar al creador de la partida
    const nonCreatorPlayers = playersArray.filter(player => player.name !== 'admin');
    // Ordenar a los jugadores restantes por puntuación
    const sortedPlayers = nonCreatorPlayers.sort((a, b) => b.score - a.score);
    displayPodium(sortedPlayers);
});












socket.on('errorJoining', (message) => {
    alert(message);
});

console.log('Script cargado correctamente.');

