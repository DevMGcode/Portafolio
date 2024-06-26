document.addEventListener('DOMContentLoaded', function () {
  const timelinePoints = document.querySelectorAll('.timeline-point');
  const sections = document.querySelectorAll('.section');

  // Añadir evento de clic a cada punto de la línea de tiempo
  timelinePoints.forEach((point, index) => {
      point.addEventListener('click', function () {
          // Obtener la sección correspondiente
          const targetSection = sections[index];

          // Desplazarse hasta la sección correspondiente
          targetSection.scrollIntoView({ behavior: 'smooth' });

          // Ejecutar animaciones específicas de la sección 1
          if (targetSection.id === 'section1') {
              const sectionContent = targetSection.querySelector('.section-content');
              const imageContainer = targetSection.querySelector('.image-container');

              sectionContent.classList.add('slideInLeft');
              imageContainer.classList.add('slideInRight');

              // Esperar a que la animación termine antes de mostrar el contenido
              setTimeout(function () {
                  sectionContent.style.opacity = '1';
                  imageContainer.style.opacity = '1';
              }, 1000); // Tiempo de espera igual a la duración de la animación
          }
      });
  });
});


