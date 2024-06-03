
// Evento que se ejecuta cuando el contenido del DOM ha sido completamente cargado

document.addEventListener('DOMContentLoaded', function () {

    // Seleccionar todas las categorías

    const categories = document.querySelectorAll('.category');

    // Configuración de eventos para cada categoría

    categories.forEach(category => {

        // Evento al hacer clic en una categoría

        category.addEventListener('click', () => {

            // Alternar la clase 'selected' para resaltar la categoría seleccionada

            category.classList.toggle('selected');

            // Desactivar la clase 'selected' para otras categorías

            categories.forEach(otherCategory => {
                if (otherCategory !== category) {
                    otherCategory.classList.remove('selected');
                }
            });

            // Mantener o quitar la clase 'selected' para la categoría actual

            category.classList.toggle('selected');
        });

        // Evento al pasar el mouse sobre una categoría

        category.addEventListener('mouseenter', () => {

            // Quitar la clase 'hovered' de otras categorías

            categories.forEach(otherCategory => {
                otherCategory.classList.remove('hovered');
            });

            // Agregar la clase 'hovered' para resaltar la categoría actual

            category.classList.add('hovered');
        });

        // Evento al salir del mouse de una categoría

        category.addEventListener('mouseleave', () => {

            // Quitar la clase 'hovered' de la categoría actual al salir del mouse

            categories.forEach(otherCategory => {
                otherCategory.classList.remove('hovered');
            });
        });
    });

    // Configuración de elementos relacionados con la lista de jugadores

    const playersContainer = document.getElementById('playersContainer');
    const playersListContainer = document.getElementById('playerListContainer');
    const players = document.querySelectorAll('.player');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    let currentIndex = 0;
    const playersPerPage = 5;

    // Función para actualizar la visibilidad de los jugadores en la lista

    function updateVisibility() {
        players.forEach((player, index) => {
            const isVisible = index >= currentIndex && index < currentIndex + playersPerPage;
            player.style.display = isVisible ? 'block' : 'none';
        });
    }

    // Eventos para cambiar la visibilidad de los jugadores al hacer clic en botones de navegación

    prevButton.addEventListener('click', () => {
        currentIndex = Math.max(currentIndex - playersPerPage, 0);
        updateVisibility();
    });

    nextButton.addEventListener('click', () => {
        currentIndex = Math.min(currentIndex + playersPerPage, players.length - playersPerPage);
        updateVisibility();
    });

    // Inicializar la visibilidad de los jugadores
    updateVisibility(); 
});

// Evento que se ejecuta cuando el contenido del DOM ha sido completamente cargado

document.addEventListener('DOMContentLoaded', function () {

    // Configuración de elementos relacionados con la lista de jugadores y la posición de desplazamiento

    const playersContainer = document.getElementById('playersContainer');
    const players = document.querySelectorAll('.player');

    // Evento al desplazarse en la ventana

    window.addEventListener('scroll', () => {

        // Obtener la posición de desplazamiento vertical

        const scrollPosition = window.scrollY;

        // Actualizar la opacidad de los jugadores según su posición en la ventana

        players.forEach(player => {
            const playerPosition = player.offsetTop - playersContainer.offsetTop;

            if (playerPosition < scrollPosition || playerPosition > scrollPosition + window.innerHeight) {

                player.style.opacity = 0;  // Ocultar jugadores fuera de la vista
            } else {
                player.style.opacity = 1;  // Mostrar jugadores dentro de la vista
            }
        });
    });
});

