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

          // Ejecutar animaciones específicas para la sección 2
          if (targetSection.id === 'section2') {
              const projectItems = targetSection.querySelectorAll('.project-item');

              // Aplicar animaciones a cada elemento de proyecto
              projectItems.forEach((item, idx) => {
                  setTimeout(function () {
                      item.style.opacity = '1';
                  }, idx * 200); // Añade un ligero retraso a cada elemento
              });
          }
      });
  });
});
