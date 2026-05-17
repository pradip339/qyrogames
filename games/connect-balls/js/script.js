document.addEventListener('DOMContentLoaded', function () {
      
      createParticles();
      
      document.querySelector('.play-symbol').addEventListener('click', function () {
        const instructions = document.querySelector('.drop-down-instruction');
        if (instructions.style.display === 'block') {
          instructions.style.display = 'none';
        } else {
          instructions.style.display = 'block';
        }
      });
      
      setTimeout(function () {
        document.getElementById('preloader').style.opacity = '0';
        setTimeout(function () {
          document.getElementById('preloader').style.display = 'none';
          document.querySelector('.whole-container').style.opacity = '1';
          document.querySelector('.whole-container').style.transform = 'translateY(0)';
          document.getElementById('modal-container').style.display = 'flex';
        }, 500);
      }, 2000);
    });
    
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        
        particle.style.left = `${Math.random() * 100}vw`;

        
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        particlesContainer.appendChild(particle);
      }
    }
