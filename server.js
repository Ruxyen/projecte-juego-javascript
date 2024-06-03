const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const shortid = require('shortid');
const peliculas = require('./json/peliculas.json');
const gastronomia = require('./json/gastronomia.json');
const deportes = require('./json/deportes.json');
const tecnologia = require('./json/tecnologia.json');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let sales = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuari s\'ha connectat');


    socket.on('createGame', ({ salaName, playerName }) => {
        let salaId = shortid.generate();
        sales[salaId] = {
            name: salaName,
            creator: socket.id,
            players: { [socket.id]: { name: playerName, score: 0, hasAnswered: false } },
            categoria: 'gastronomia', // Categoría por defecto
            currentQuestionIndex: 0,
            isGameStarted: false,
            preguntas: [] // Preguntas de la categoría seleccionada
        };
        socket.join(salaId);
        socket.emit('gameCreated', { salaId, salaName, isCreator: true });
        console.log(`Sala creada: ${salaId} - Jugador: ${playerName}`);
    });

    // Cuando el creador quiere cerrar la sala
    socket.on('closeRoom', ({ salaId }) => {
        // Verificar si el usuario es el creador de la sala
        if (sales[salaId] && socket.id === sales[salaId].creator) {
            // Cerrar la sala y notificar a todos los jugadores
            io.to(salaId).emit('roomClosed');
            delete sales[salaId];
            io.in(salaId).socketsLeave(salaId);
        }
    });


    socket.on('changeCategory', ({ salaId, categoria }) => {
        if (sales[salaId] && socket.id === sales[salaId].creator) {
            sales[salaId].categoria = categoria;
            switch (categoria) {
                case 'gastronomia':
                    sales[salaId].preguntas = gastronomia;
                    break;
                case 'deportes':
                    sales[salaId].preguntas = deportes;
                    break;
                case 'tecnologia':
                    sales[salaId].preguntas = tecnologia;
                    break;
                case 'peliculas':
                    sales[salaId].preguntas = peliculas;
                    break;
                // Agregar casos para otras categorías
            }
            console.log(`Categoría cambiada a ${categoria} en sala: ${salaId}`);
        }
    });



    socket.on('joinGame', ({ playerName, salaId }) => {
        if (sales[salaId] && !sales[salaId].isGameStarted) {
            // Agrega al jugador con su socket.id como una propiedad del jugador
            sales[salaId].players[socket.id] = {
                id: socket.id, // Asegúrate de incluir el socket.id aquí
                name: playerName,
                score: 0,
                hasAnswered: false
            };
            socket.join(salaId);

            // Informa al jugador que se unió
            socket.emit('playerJoined', {
                players: sales[salaId].players,
                salaId: salaId,
                isCreator: socket.id === sales[salaId].creator
            });

            // Actualiza la lista de jugadores para todos los demás en la sala
            socket.to(salaId).emit('updatePlayerList', sales[salaId].players);

            console.log(`Jugador se unió a la sala: ${salaId} - Jugador: ${playerName}`);
        } else {
            socket.emit('errorJoining', 'No es posible unirse a la sala');
            console.log(`Error al unirse a la sala: ${salaId}`);
        }
    });



    socket.on('startGame', (salaId) => {
        if (sales[salaId] && !sales[salaId].isGameStarted) {
            sales[salaId].isGameStarted = true;
            io.to(salaId).emit('gameStarted');
            sendNextQuestion(salaId);
            console.log(`Juego iniciado en la sala: ${salaId}`);
        }
    });

    // Agregar este evento para manejar el fin del juego y mostrar el podio
    socket.on('finishGame', (salaId) => {
        if (sales[salaId] && sales[salaId].isGameStarted) {
            // Log para verificar los jugadores antes del filtrado
            console.log("Jugadores antes del filtrado:", sales[salaId].players);

            const nonCreatorPlayers = Object.values(sales[salaId].players)
                .filter(player => player.id !== sales[salaId].creator); // Asegúrate que esta condición sea correcta

            // Log para verificar los jugadores después del filtrado
            console.log("Jugadores después del filtrado (sin el creador):", nonCreatorPlayers);

            io.to(salaId).emit('showPodium', nonCreatorPlayers);
            console.log(`Fin del juego en la sala: ${salaId}`);
        }
    });




    socket.on('restartGame', (salaId) => {
        if (sales[salaId] && socket.id === sales[salaId].creator) {
            // Restablece el estado relevante del juego
            sales[salaId].currentQuestionIndex = 0;
            sales[salaId].isGameStarted = true;
            sales[salaId].allowImmediateFeedback = false; // Restablece esto
            sales[salaId].questionStartTime = null; // Restablece esto

            // Restablecer las puntuaciones y el estado de respuesta de los jugadores
            for (let playerId in sales[salaId].players) {
                sales[salaId].players[playerId].score = 0;
                sales[salaId].players[playerId].hasAnswered = false;
            }

            // Notificar a todos en la sala que el juego se ha reiniciado
            io.to(salaId).emit('gameRestarted');
            sendNextQuestion(salaId);
        }
    });







    socket.on('answer', ({ salaId, answer }) => {
        let sala = sales[salaId];
        if (sala && sala.isGameStarted) {
            let player = sala.players[socket.id];
            let currentQuestion = sala.preguntas[sala.currentQuestionIndex - 1];
            if (currentQuestion && !player.hasAnswered) {
                player.hasAnswered = true;
                player.lastAnswerCorrect = (answer === currentQuestion.respostaCorrecta);
                if (player.lastAnswerCorrect) {
                    player.score += 1;
                }

                // Verifica si se permite el feedback inmediato
                if (sala.allowImmediateFeedback && (Date.now() - sala.questionStartTime) >= 10000) {
                    const message = player.lastAnswerCorrect ? 'Respuesta Correcta!' : 'Respuesta Incorrecta';
                    io.to(socket.id).emit('answerFeedback', { message, isCorrect: player.lastAnswerCorrect });
                }
            }
        }
    });



    // Cliente: Escucha el evento 'scoreUpdated' y actualiza la interfaz de usuario.
    socket.on('scoreUpdated', (players) => {
        updatePlayerList(players);
    });




    socket.on('disconnect', () => {
        let salaId = findRoomByPlayerId(socket.id);
        if (salaId && sales[salaId].players[socket.id]) {
            delete sales[salaId].players[socket.id];
            io.to(salaId).emit('updatePlayerList', sales[salaId].players);
        }
    });

    // Función para encontrar la sala del jugador
    function findRoomByPlayerId(playerId) {
        for (let salaId in sales) {
            if (sales[salaId].players[playerId]) {
                return salaId;
            }
        }
        return null;
    }


    let questionTimer;
    function sendNextQuestion(salaId) {

        // Limpiar el temporizador anterior si existe
        if (questionTimer) {
            clearTimeout(questionTimer);
        }

        if (sales[salaId].currentQuestionIndex < sales[salaId].preguntas.length) {
            const currentQuestion = sales[salaId].preguntas[sales[salaId].currentQuestionIndex];
            const questionToSend = {
                id: currentQuestion.id,
                pregunta: currentQuestion.pregunta,
                respostes: currentQuestion.respostes,
                timeLeft: 30 // Añadir tiempo inicial
            };
            io.to(salaId).emit('question', questionToSend);
            sales[salaId].currentQuestionIndex++;

            setTimeout(() => {
                sendNextQuestion(salaId);
            }, 30000); // 30 segundos por pregunta
        } else {
            io.to(salaId).emit('endGame', sales[salaId].players);
            sales[salaId].isGameStarted = false;
            sales[salaId].currentQuestionIndex = 0;
            console.log(`Fin del juego en la sala: ${salaId}`);
        }

        // Restablecer hasAnswered para cada jugador
        for (let playerId in sales[salaId].players) {
            sales[salaId].players[playerId].hasAnswered = false;
        }

        setTimeout(() => {
            // Aquí verificamos las respuestas y notificamos a los jugadores
            notifyPlayersAboutAnswers(salaId);
        }, 20000); // Aviso a los 20 segundos



        function notifyPlayersAboutAnswers(salaId) {
            const sala = sales[salaId];
            if (!sala) return;

            // Cambia la lógica para enviar el feedback de respuestas aquí
            Object.keys(sala.players).forEach(playerId => {
                const player = sala.players[playerId];
                if (player.hasAnswered) { // Asegúrate de que el jugador ha respondido
                    const message = player.lastAnswerCorrect ? 'Respuesta Correcta!' : 'Respuesta Incorrecta';
                    // Aquí podrías combinar el mensaje de tiempo con el de respuesta correcta/incorrecta
                    io.to(playerId).emit('answerFeedback', { message, isCorrect: player.lastAnswerCorrect });
                }
            });
        }

        // Establece la marca de tiempo de inicio para la pregunta
        const startTime = Date.now();
        sales[salaId].questionStartTime = startTime;

        // Permite respuestas inmediatas después de 10 segundos
        setTimeout(() => {
            sales[salaId].allowImmediateFeedback = true;
        }, 10000); // 10 segundos

    }



    // Cuando un jugador se va de la sala
    socket.on('playerLeft', ({ playerId }) => {
        // Aquí puedes eliminar al jugador de la lista de jugadores en la interfaz de usuario
        removePlayerFromList(playerId);
    });

    function removePlayerFromList(playerId) {
        // Encuentra el elemento del jugador que se va y lo elimina del DOM
        const playerElement = document.getElementById(`player-${playerId}`);
        if (playerElement) {
            playerElement.remove();
        }
    }

    socket.on('leaveRoom', ({ salaId }) => {
        if (sales[salaId] && sales[salaId].players[socket.id]) {
            // Elimina al jugador de la lista de la sala
            delete sales[salaId].players[socket.id];
            // Emite un evento a la sala para actualizar la lista de jugadores
            io.to(salaId).emit('updatePlayerList', sales[salaId].players);
            // El jugador sale de la sala
            socket.leave(salaId);
        }
    });

    // Cuando la sala se cierra
    socket.on('roomClosed', () => {
        // Si no eres el creador/admin, maneja el cierre de la sala
        if (!isSalaCreator) {
            alert('La sala ha sido cerrada por el administrador.');
            window.location.href = '/';
        }
    });

    socket.on('backToLobby', ({ salaId }) => {
        const sala = sales[salaId];
        if (sala) {
            // Reiniciar el estado del juego si el usuario es el creador
            if (socket.id === sala.creator) {
                sala.currentQuestionIndex = 0;
                sala.isGameStarted = false;
                for (let playerId in sala.players) {
                    sala.players[playerId].score = 0;
                    sala.players[playerId].hasAnswered = false;
                }
                // Emitir 'updateLobbyCreator' solo al creador
                socket.emit('updateLobbyCreator', {
                    players: sala.players,
                    salaId,
                    isCreator: true
                });
            } else {
                // Notificar al jugador específico para volver al lobby sin reiniciar el estado del juego
                socket.emit('updateLobbyPlayer', {
                    players: sala.players,
                    salaId,
                    isCreator: false
                });
            }
        }
    });

    socket.on('endGame', salaId => {
        const sala = sales[salaId];
        if (sala) {
            // Filtra para excluir al creador usando el id almacenado en cada jugador
            const playersForPodium = Object.values(sala.players)
                .filter(player => player.id !== sala.creator) // Asegúrate de que estás utilizando el id correctamente
                .sort((a, b) => b.score - a.score); // Ordena por puntuación si es necesario

            // Ahora 'playersForPodium' excluye al creador y puedes enviar estos datos
            io.to(salaId).emit('showPodium', playersForPodium);
        }
    });


});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escoltant al port ${PORT}`));
