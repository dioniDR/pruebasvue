/**
 * QRManager - Módulo simple para crear y gestionar códigos QR
 */
const QRManager = (function() {
    /**
     * Crea un código QR en el elemento seleccionado
     * @param {string} selector - Selector CSS del elemento donde se mostrará el QR
     * @param {string} data - Datos para codificar en el QR
     * @param {object} options - Opciones de personalización (opcional)
     */
    function crearQR(selector, data, options = {}) {
        const elemento = document.querySelector(selector);
        
        if (!elemento) {
            console.error(`Elemento no encontrado: ${selector}`);
            return false;
        }
        
        // Opciones predeterminadas
        const config = {
            width: options.width || 200,
            height: options.height || 200,
            colorDark: options.colorDark || "#000000",
            colorLight: options.colorLight || "#ffffff",
            correctLevel: options.correctLevel || "H"
        };
        
        // Limpiar el elemento
        elemento.innerHTML = '';
        
        // Crear el QR usando la biblioteca qrcode.js
        new QRCode(elemento, {
            text: data,
            width: config.width,
            height: config.height,
            colorDark: config.colorDark,
            colorLight: config.colorLight,
            correctLevel: QRCode.CorrectLevel[config.correctLevel]
        });
        
        return true;
    }
    
    /**
     * Crea un lector de QR en el elemento seleccionado
     * @param {string} selector - Selector CSS del elemento donde se iniciará la cámara
     * @param {function} callback - Función a ejecutar cuando se detecte un código QR
     */
    function crearLector(selector, callback) {
        const elemento = document.querySelector(selector);
        
        if (!elemento) {
            console.error(`Elemento no encontrado: ${selector}`);
            return false;
        }
        
        // Crear elementos para la captura de video
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Configurar elementos
        video.style.width = '100%';
        canvas.style.display = 'none';
        
        // Añadir video al elemento
        elemento.innerHTML = '';
        elemento.appendChild(video);
        elemento.appendChild(canvas);
        
        // Solicitar acceso a la cámara
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function(stream) {
                video.srcObject = stream;
                video.setAttribute('playsinline', true);
                video.play();
                
                // Comenzar el escaneo
                requestAnimationFrame(escanear);
            })
            .catch(function(error) {
                console.error('Error al acceder a la cámara:', error);
                elemento.innerHTML = '<p>No se pudo acceder a la cámara</p>';
                return false;
            });
            
        // Función para escanear códigos QR
        function escanear() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                // Ajustar el tamaño del canvas al video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Dibujar el fotograma actual en el canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Obtener los datos de la imagen
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Escanear los datos con jsQR
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });
                
                if (code) {
                    // Código QR detectado
                    if (typeof callback === 'function') {
                        callback(code.data);
                    }
                }
            }
            
            // Continuar escaneando
            requestAnimationFrame(escanear);
        }
        
        return true;
    }
    
    /**
     * Detener todos los flujos de video activos
     */
    function detenerLector() {
        const videoElements = document.querySelectorAll('video');
        
        videoElements.forEach(video => {
            if (video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        });
        
        return true;
    }
    
    // Exponer las funciones públicas
    return {
        crearQR,
        crearLector,
        detenerLector
    };
})();
