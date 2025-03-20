/**
 * QRScannerLib - Una biblioteca extendida para manejo de códigos QR utilizando jsQR
 * Requiere jsQR.js: https://github.com/cozmo/jsQR
 * 
 * @version 1.0.0
 * @author Claude
 */

class QRScannerLib {
    /**
     * Inicializa la biblioteca de escaneo de QR
     * @param {Object} options - Opciones de configuración
     * @param {string} options.videoElementId - ID del elemento video para la cámara (opcional si no se usa cámara)
     * @param {string} options.canvasElementId - ID del elemento canvas para procesamiento (opcional, se crea uno si no se proporciona)
     * @param {string} options.outputElementId - ID del elemento donde mostrar los resultados (opcional)
     * @param {boolean} options.debug - Mostrar información de depuración
     * @param {string} options.scanRegion - Región de escaneo ('full', 'center', 'auto')
     * @param {Function} options.onFound - Callback cuando se encuentra un código QR
     * @param {Function} options.onError - Callback para errores
     */
    constructor(options = {}) {
        // Comprobar que jsQR esté disponible
        if (typeof jsQR !== 'function') {
            throw new Error('jsQR no está disponible. Por favor, incluya la biblioteca jsQR antes de QRScannerLib.');
        }

        // Opciones por defecto
        this.options = Object.assign({
            videoElementId: null,
            canvasElementId: null,
            outputElementId: null,
            debug: false,
            scanRegion: 'full',
            onFound: null,
            onError: null,
            inversionAttempts: 'attemptBoth',
            scanInterval: 100, // ms entre escaneos
            successTolerance: 3, // Número de escaneos exitosos consecutivos para confirmar
            beepOnSuccess: false,
            vibrate: false,
            highlightCode: true,
            highlightColor: '#FF5722',
            drawOutline: true,
            autoStart: false,
            autoStop: false, // Detener automáticamente después de encontrar un código
            facingMode: 'environment', // 'environment' para cámara trasera, 'user' para frontal
            resolution: 'hd', // 'sd', 'hd', 'full-hd'
            timeout: 0, // Timeout en ms (0 = sin timeout)
        }, options);

        // Estado interno
        this.video = null;
        this.canvas = null;
        this.canvasContext = null;
        this.outputElement = null;
        this.scanning = false;
        this.lastFound = null;
        this.successCount = 0;
        this.stream = null;
        this.timeoutId = null;
        this.supportsCameraSwitch = false;

        // Historial de escaneos
        this.scanHistory = [];
        this.historyMaxSize = 20;

        if (this.options.debug) {
            console.log('QRScannerLib inicializado con opciones:', this.options);
        }

        // Inicializar elementos
        this._initializeElements();

        // Iniciar automáticamente si se solicita
        if (this.options.autoStart && this.options.videoElementId) {
            this.start();
        }
    }

    /**
     * Inicializa los elementos DOM necesarios
     * @private
     */
    _initializeElements() {
        // Video para la cámara
        if (this.options.videoElementId) {
            this.video = document.getElementById(this.options.videoElementId);
            if (!this.video) {
                console.warn(`Elemento de video con ID '${this.options.videoElementId}' no encontrado.`);
                this.video = document.createElement('video');
                this.video.id = this.options.videoElementId;
                this.video.style.display = 'none';
                document.body.appendChild(this.video);
            }
            this.video.setAttribute('playsinline', 'true');
        }

        // Canvas para procesamiento
        if (this.options.canvasElementId) {
            this.canvas = document.getElementById(this.options.canvasElementId);
        }
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            if (this.options.canvasElementId) {
                this.canvas.id = this.options.canvasElementId;
            }
            this.canvas.style.display = this.options.debug ? 'block' : 'none';
            document.body.appendChild(this.canvas);
        }
        this.canvasContext = this.canvas.getContext('2d', { willReadFrequently: true });

        // Elemento para mostrar resultados
        if (this.options.outputElementId) {
            this.outputElement = document.getElementById(this.options.outputElementId);
        }

        // Crear elemento de audio para el beep
        if (this.options.beepOnSuccess) {
            this.beepAudio = new Audio('data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA//uUZAAAAmwxJpBgTgAcAAAwgAAAAAG8GC3GBQAAqwAftIAAAP9wBgAAAMlMfE8wJP9/+JZrSu4VCiRJkuE2q5Lh/8iz9///p//+m76A//v/l+6qDAoEBQIAACR0MkdH/5P8sCgQFAgAABPNyZMm5P5MOAwggk5fB3k+npd9PT09PT09//////////o=');
        }
    }

    /**
     * Inicia el escaneo de códigos QR utilizando la cámara
     * @returns {Promise} Promise que se resuelve cuando la cámara se inicializa
     */
    async start() {
        if (this.scanning) {
            return Promise.resolve();
        }

        // Configurar timeout si es necesario
        if (this.options.timeout > 0) {
            this.timeoutId = setTimeout(() => {
                this.stop();
                this._handleError(new Error('Timeout alcanzado'));
            }, this.options.timeout);
        }

        if (this.video) {
            try {
                // Definir la configuración de resolución
                let constraints = {
                    video: {
                        facingMode: this.options.facingMode,
                    },
                    audio: false
                };

                // Configurar resolución específica si se solicita
                switch (this.options.resolution) {
                    case 'sd':
                        constraints.video.width = { ideal: 640 };
                        constraints.video.height = { ideal: 480 };
                        break;
                    case 'hd':
                        constraints.video.width = { ideal: 1280 };
                        constraints.video.height = { ideal: 720 };
                        break;
                    case 'full-hd':
                        constraints.video.width = { ideal: 1920 };
                        constraints.video.height = { ideal: 1080 };
                        break;
                }

                // Comprobar si hay varias cámaras disponibles
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    this.supportsCameraSwitch = videoDevices.length > 1;
                    
                    if (this.options.debug) {
                        console.log(`Cámaras disponibles: ${videoDevices.length}`);
                    }
                }

                // Obtener stream de la cámara
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                this.video.srcObject = this.stream;
                
                // Esperar a que el video esté listo
                await new Promise(resolve => {
                    this.video.onloadedmetadata = () => {
                        this.video.play();
                        resolve();
                    };
                });

                // Ajustar dimensiones del canvas
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                
                // Comenzar el bucle de escaneo
                this.scanning = true;
                this._scanFrame();
                
                return Promise.resolve();
            } catch (error) {
                this._handleError(error);
                return Promise.reject(error);
            }
        } else {
            const error = new Error('No se ha configurado un elemento de video para la cámara');
            this._handleError(error);
            return Promise.reject(error);
        }
    }

    /**
     * Detiene el escaneo de códigos QR
     */
    stop() {
        this.scanning = false;
        
        // Limpiar timeout si existe
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        // Detener y liberar la cámara
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }

        // Limpiar el canvas
        if (this.canvasContext && this.canvas) {
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        if (this.options.debug) {
            console.log('Escaneo de QR detenido');
        }
    }

    /**
     * Cambia entre cámaras frontal y trasera
     * @returns {Promise} Promise que se resuelve cuando la cámara se cambia
     */
    async switchCamera() {
        if (!this.supportsCameraSwitch) {
            return Promise.reject(new Error('El dispositivo no tiene múltiples cámaras'));
        }

        const wasScanning = this.scanning;
        if (wasScanning) {
            this.stop();
        }

        // Cambiar la opción de cámara
        this.options.facingMode = this.options.facingMode === 'environment' ? 'user' : 'environment';
        
        if (this.options.debug) {
            console.log(`Cambiando a cámara: ${this.options.facingMode}`);
        }

        // Reiniciar si estaba escaneando
        if (wasScanning) {
            return this.start();
        }
        
        return Promise.resolve();
    }

    /**
     * Escanea una imagen estática desde una URL
     * @param {string} imageUrl - URL de la imagen a escanear
     * @returns {Promise} Promise que se resuelve con el resultado del escaneo o null
     */
    scanImageFromUrl(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => {
                const result = this.scanImageElement(img);
                resolve(result);
            };
            
            img.onerror = (error) => {
                reject(new Error(`Error al cargar la imagen: ${error.message}`));
            };
            
            img.src = imageUrl;
        });
    }

    /**
     * Escanea una imagen desde un elemento <img> o un canvas
     * @param {HTMLImageElement|HTMLCanvasElement} element - Elemento de imagen o canvas
     * @returns {Object|null} Resultado del escaneo o null si no se encuentra
     */
    scanImageElement(element) {
        // Calcular dimensiones
        const width = element.naturalWidth || element.width;
        const height = element.naturalHeight || element.height;
        
        // Configurar canvas
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Dibujar en el canvas
        this.canvasContext.drawImage(element, 0, 0, width, height);
        
        // Obtener datos de imagen
        const imageData = this.canvasContext.getImageData(0, 0, width, height);
        
        // Escanear
        return this._processImageData(imageData);
    }

    /**
     * Escanea una imagen desde un archivo (File o Blob)
     * @param {File|Blob} file - Archivo a escanear
     * @returns {Promise} Promise que se resuelve con el resultado del escaneo o null
     */
    scanImageFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('El archivo proporcionado no es una imagen'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                this.scanImageFromUrl(event.target.result)
                    .then(resolve)
                    .catch(reject);
            };
            
            reader.onerror = (error) => {
                reject(new Error(`Error al leer el archivo: ${error.message}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Escanea un fotograma del video
     * @private
     */
    _scanFrame() {
        if (!this.scanning) {
            return;
        }

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            // Calcular la región a escanear
            let sx = 0, sy = 0, sWidth = this.canvas.width, sHeight = this.canvas.height;
            
            if (this.options.scanRegion === 'center') {
                // Escanear solo el centro del frame (25% central)
                sx = this.canvas.width * 0.25;
                sy = this.canvas.height * 0.25;
                sWidth = this.canvas.width * 0.5;
                sHeight = this.canvas.height * 0.5;
            }

            // Dibujar el video en el canvas
            this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Obtener datos de imagen de la región seleccionada
            const imageData = this.canvasContext.getImageData(sx, sy, sWidth, sHeight);
            
            // Procesar la imagen
            const code = this._processImageData(imageData, {
                offsetX: sx,
                offsetY: sy
            });
            
            if (code) {
                this.successCount++;
                
                // Verificar si tenemos suficientes escaneos exitosos
                if (this.successCount >= this.options.successTolerance) {
                    this._handleSuccess(code);
                }
            } else {
                this.successCount = 0;
            }
        }
        
        // Programar el siguiente escaneo
        setTimeout(() => {
            if (this.scanning) {
                this._scanFrame();
            }
        }, this.options.scanInterval);
    }

    /**
     * Procesa los datos de imagen y busca un código QR
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @param {Object} options - Opciones adicionales para el procesamiento
     * @returns {Object|null} Resultado del escaneo o null
     * @private
     */
    _processImageData(imageData, options = {}) {
        const defaultOptions = {
            offsetX: 0,
            offsetY: 0
        };
        
        const opts = Object.assign({}, defaultOptions, options);
        
        try {
            // Escanear con jsQR
            const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                    inversionAttempts: this.options.inversionAttempts
                }
            );
            
            if (code) {
                // Ajustar las coordenadas si hay offset
                if (opts.offsetX !== 0 || opts.offsetY !== 0) {
                    code.location.topLeftCorner.x += opts.offsetX;
                    code.location.topLeftCorner.y += opts.offsetY;
                    code.location.topRightCorner.x += opts.offsetX;
                    code.location.topRightCorner.y += opts.offsetY;
                    code.location.bottomLeftCorner.x += opts.offsetX;
                    code.location.bottomLeftCorner.y += opts.offsetY;
                    code.location.bottomRightCorner.x += opts.offsetX;
                    code.location.bottomRightCorner.y += opts.offsetY;
                }
                
                // Dibujar contorno si está habilitado
                if (this.options.highlightCode) {
                    this._drawCodeOutline(code);
                }
                
                // Añadir timestamp y más información
                code.timestamp = new Date().getTime();
                code.format = 'QR_CODE';
                
                // Analizar el contenido para determinar el tipo
                code.contentType = this._determineContentType(code.data);
                
                return code;
            }
        } catch (error) {
            if (this.options.debug) {
                console.error('Error al procesar imagen:', error);
            }
        }
        
        return null;
    }

    /**
     * Determina el tipo de contenido del código QR
     * @param {string} data - Contenido del código QR
     * @returns {string} Tipo de contenido
     * @private
     */
    _determineContentType(data) {
        // URL
        if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(data)) {
            return 'URL';
        }
        
        // Correo electrónico
        if (/^mailto:/i.test(data)) {
            return 'EMAIL';
        }
        
        // Contacto (vCard)
        if (/^BEGIN:VCARD/i.test(data)) {
            return 'CONTACT';
        }
        
        // Wifi
        if (/^WIFI:/i.test(data)) {
            return 'WIFI';
        }
        
        // SMS
        if (/^sms:/i.test(data)) {
            return 'SMS';
        }
        
        // Teléfono
        if (/^tel:/i.test(data) || /^\+?[0-9]{8,}$/.test(data)) {
            return 'PHONE';
        }
        
        // Geo
        if (/^geo:/i.test(data)) {
            return 'GEO';
        }
        
        // Calendario
        if (/^BEGIN:VEVENT/i.test(data)) {
            return 'CALENDAR';
        }
        
        // JSON
        try {
            JSON.parse(data);
            return 'JSON';
        } catch (e) {
            // No es JSON
        }
        
        // Si no coincide con ninguno específico
        return 'TEXT';
    }

    /**
     * Dibuja el contorno del código QR en el canvas
     * @param {Object} code - Resultado del escaneo
     * @private
     */
    _drawCodeOutline(code) {
        if (!this.canvasContext || !this.options.drawOutline) {
            return;
        }
        
        this.canvasContext.strokeStyle = this.options.highlightColor;
        this.canvasContext.lineWidth = 4;
        this.canvasContext.beginPath();
        
        // Dibujar el contorno
        this.canvasContext.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        this.canvasContext.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
        this.canvasContext.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
        this.canvasContext.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
        this.canvasContext.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
        
        this.canvasContext.stroke();
    }

    /**
     * Maneja un escaneo exitoso
     * @param {Object} code - Resultado del escaneo
     * @private
     */
    _handleSuccess(code) {
        // Verificar si es un escaneo duplicado reciente
        const isDuplicate = this.lastFound && 
                            this.lastFound.data === code.data && 
                            (code.timestamp - this.lastFound.timestamp < 2000); // 2 segundos de umbral
        
        // Guardar en el historial
        this._addToHistory(code);
        
        // Guardar el último escaneo
        this.lastFound = code;
        
        // Evitar procesar duplicados demasiado rápido
        if (isDuplicate) {
            return;
        }
        
        // Reproducir sonido si está habilitado
        if (this.options.beepOnSuccess && this.beepAudio) {
            this.beepAudio.play().catch(e => {
                if (this.options.debug) {
                    console.warn('No se pudo reproducir el sonido:', e);
                }
            });
        }
        
        // Vibrar si está habilitado
        if (this.options.vibrate && navigator.vibrate) {
            navigator.vibrate(200);
        }
        
        // Mostrar el resultado en el elemento de salida
        if (this.outputElement) {
            this.outputElement.textContent = code.data;
        }
        
        // Llamar al callback de éxito
        if (typeof this.options.onFound === 'function') {
            this.options.onFound(code);
        }
        
        // Detener automáticamente si está configurado
        if (this.options.autoStop) {
            this.stop();
        }
    }

    /**
     * Maneja un error
     * @param {Error} error - Error ocurrido
     * @private
     */
    _handleError(error) {
        if (this.options.debug) {
            console.error('Error en QRScannerLib:', error);
        }
        
        // Llamar al callback de error
        if (typeof this.options.onError === 'function') {
            this.options.onError(error);
        }
    }

    /**
     * Añade un resultado al historial de escaneos
     * @param {Object} code - Resultado del escaneo
     * @private
     */
    _addToHistory(code) {
        // Añadir el nuevo código al principio
        this.scanHistory.unshift({
            data: code.data,
            timestamp: code.timestamp,
            contentType: code.contentType
        });
        
        // Limitar el tamaño del historial
        if (this.scanHistory.length > this.historyMaxSize) {
            this.scanHistory.pop();
        }
    }

    /**
     * Obtiene el historial de escaneos
     * @returns {Array} Historial de escaneos
     */
    getHistory() {
        return [...this.scanHistory];
    }

    /**
     * Limpia el historial de escaneos
     */
    clearHistory() {
        this.scanHistory = [];
    }

    /**
     * Establece el tamaño máximo del historial
     * @param {number} size - Tamaño máximo del historial
     */
    setHistoryMaxSize(size) {
        if (typeof size === 'number' && size > 0) {
            this.historyMaxSize = size;
            
            // Truncar el historial si es necesario
            if (this.scanHistory.length > this.historyMaxSize) {
                this.scanHistory = this.scanHistory.slice(0, this.historyMaxSize);
            }
        }
    }

    /**
     * Alterna la iluminación de la cámara (flash) si está disponible
     * @returns {Promise} Promise que se resuelve con un booleano que indica si el flash está activado
     */
    async toggleFlash() {
        if (!this.stream) {
            return Promise.reject(new Error('La cámara no está iniciada'));
        }
        
        const track = this.stream.getVideoTracks()[0];
        
        if (!track) {
            return Promise.reject(new Error('No se encontró la pista de video'));
        }
        
        try {
            const capabilities = track.getCapabilities();
            
            // Comprobar si el dispositivo soporta el flash
            if (!capabilities.torch) {
                return Promise.reject(new Error('Este dispositivo no soporta flash/torch'));
            }
            
            // Obtener el estado actual
            const settings = track.getSettings();
            const currentState = settings.torch || false;
            
            // Alternar el estado
            await track.applyConstraints({
                advanced: [{ torch: !currentState }]
            });
            
            return Promise.resolve(!currentState);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Procesa un código QR manualmente a partir de un string de datos
     * @param {string} data - Datos a procesar como código QR
     * @returns {Object} Objeto con información del código
     */
    processQRData(data) {
        const result = {
            data: data,
            timestamp: new Date().getTime(),
            format: 'QR_CODE',
            contentType: this._determineContentType(data),
            isManualEntry: true
        };
        
        // Llamar al callback de éxito
        if (typeof this.options.onFound === 'function') {
            this.options.onFound(result);
        }
        
        return result;
    }

    /**
     * Configura una o varias opciones
     * @param {Object} options - Opciones a configurar
     */
    setOptions(options) {
        const wasScanning = this.scanning;
        let needsRestart = false;
        
        // Comprobar si alguna opción requiere reiniciar el escáner
        const restartOptions = [
            'videoElementId', 'canvasElementId', 'facingMode', 
            'resolution', 'scanRegion'
        ];
        
        for (const option of restartOptions) {
            if (options[option] !== undefined && options[option] !== this.options[option]) {
                needsRestart = true;
                break;
            }
        }
        
        // Detener si es necesario
        if (needsRestart && wasScanning) {
            this.stop();
        }
        
        // Actualizar opciones
        this.options = Object.assign(this.options, options);
        
        // Reinicializar elementos si es necesario
        if (needsRestart) {
            this._initializeElements();
            
            // Reiniciar si estaba escaneando
            if (wasScanning) {
                this.start();
            }
        }
    }

    /**
     * Devuelve el estado actual del escáner
     * @returns {Object} Estado actual
     */
    getState() {
        return {
            scanning: this.scanning,
            lastFound: this.lastFound,
            supportsCameraSwitch: this.supportsCameraSwitch,
            currentCamera: this.options.facingMode,
            historyCount: this.scanHistory.length,
            options: { ...this.options }
        };
    }

    /**
     * Crea un elemento de escaneo QR autónomo en un contenedor
     * @param {string|HTMLElement} container - Selector o elemento donde crear el escáner
     * @param {Object} options - Opciones adicionales
     * @returns {Object} Instancia de QRScannerLib
     */
    static createStandalone(container, options = {}) {
        let containerElement;
        
        if (typeof container === 'string') {
            containerElement = document.querySelector(container);
        } else if (container instanceof HTMLElement) {
            containerElement = container;
        } else {
            throw new Error('El contenedor debe ser un selector o elemento HTML');
        }
        
        if (!containerElement) {
            throw new Error('No se encontró el contenedor');
        }
        
        // Crear elementos
        const videoId = `qr-scanner-video-${Date.now()}`;
        const canvasId = `qr-scanner-canvas-${Date.now()}`;
        const outputId = `qr-scanner-output-${Date.now()}`;
        
        // Construir HTML
        containerElement.innerHTML = `
            <div class="qr-scanner-container" style="position: relative;">
                <video id="${videoId}" playsinline style="width: 100%;"></video>
                <canvas id="${canvasId}" style="display: none;"></canvas>
                <div class="qr-scanner-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none;">
                    <div class="qr-scanner-marker" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 2px solid rgba(255, 255, 255, 0.5); width: 70%; height: 70%; box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);"></div>
                </div>
                <div id="${outputId}" style="margin-top: 10px; text-align: center;"></div>
                <div class="qr-scanner-controls" style="margin-top: 10px; display: flex; justify-content: center; gap: 10px;">
                    <button id="${videoId}-start" class="qr-scanner-start">Iniciar</button>
                    <button id="${videoId}-stop" class="qr-scanner-stop" disabled>Detener</button>
                    <button id="${videoId}-switch" class="qr-scanner-switch" disabled>Cambiar Cámara</button>
                </div>
            </div>
        `;
        
        // Configurar opciones
        const defaultOptions = {
            videoElementId: videoId,
            canvasElementId: canvasId,
            outputElementId: outputId,
            autoStart: false,
            highlightCode: true,
            onFound: (result) => {
                document.getElementByI
