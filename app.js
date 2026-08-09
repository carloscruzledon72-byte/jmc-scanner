const btnEscanear = document.getElementById("btnEscanear");
const btnGuardar = document.getElementById("btnGuardar");

const codigo = document.getElementById("codigo");
const descripcion = document.getElementById("descripcion");
const ubicacion = document.getElementById("ubicacion");
const usuario = document.getElementById("usuario");
const estado = document.getElementById("estado");

let scanner = null;
let quaggaActivo = false;

btnEscanear.addEventListener("click", iniciarEscaner);


// ======================================================
// ESCÁNER PRINCIPAL: QR + CÓDIGOS DE BARRAS
// ======================================================

function iniciarEscaner() {

    estado.textContent = "Abriendo cámara...";

    // Primero intentamos con html5-qrcode
    if (!scanner) {
        scanner = new Html5Qrcode("reader");
    }

    const configuracion = {
        fps: 15,

        qrbox: function(viewfinderWidth, viewfinderHeight) {
            return {
                width: Math.floor(viewfinderWidth * 0.9),
                height: Math.floor(viewfinderHeight * 0.35)
            };
        },

        aspectRatio: 1.777778,

        formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.ITF
        ]
    };


    scanner.start(
        { facingMode: "environment" },
        configuracion,

        function(decodedText) {

            codigo.value = decodedText;
            estado.textContent = "Código leído correctamente";

            scanner.stop()
                .then(() => {
                    iniciarQuagga();
                })
                .catch(function() {});
        },

        function(errorMessage) {
            // Sigue buscando
        }

    ).then(() => {

        // Después de unos segundos activamos también
        // el lector especial para códigos de barras.

        setTimeout(function() {

            if (codigo.value.trim() === "") {

                scanner.stop()
                    .then(() => {
                        iniciarQuagga();
                    })
                    .catch(() => {
                        iniciarQuagga();
                    });

            }

        }, 5000);

    }).catch(function(err) {

        estado.textContent =
            "Probando lector alternativo...";

        iniciarQuagga();
    });
}


// ======================================================
// QUAGGA2
// Especialmente útil para códigos de barras difíciles
// ======================================================

function iniciarQuagga() {

    if (typeof Quagga === "undefined") {
        estado.textContent =
            "No se pudo cargar el lector alternativo";
        return;
    }

    if (quaggaActivo) return;

    quaggaActivo = true;

    estado.textContent =
        "Buscando código de barras...";

    Quagga.init({

        inputStream: {
            name: "Live",
            type: "LiveStream",

            target: document.querySelector("#reader"),

            constraints: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },

            area: {
                top: "15%",
                right: "5%",
                left: "5%",
                bottom: "15%"
            }
        },

        locator: {
            patchSize: "medium",
            halfSample: true
        },

        numOfWorkers: 2,

        frequency: 10,

        decoder: {

            readers: [
                "code_128_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "code_93_reader",
                "ean_reader",
                "ean_8_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader",
                "2of5_reader",
                "codabar_reader"
            ]

        },

        locate: true

    }, function(err) {

        if (err) {

            console.log(err);

            estado.textContent =
                "No se pudo iniciar el lector";

            quaggaActivo = false;

            return;
        }

        Quagga.start();

    });
}


// ======================================================
// CUANDO QUAGGA ENCUENTRA UN CÓDIGO
// ======================================================

if (typeof Quagga !== "undefined") {

    Quagga.onDetected(function(result) {

        if (
            result &&
            result.codeResult &&
            result.codeResult.code
        ) {

            const valor =
                result.codeResult.code.trim();

            // Evitar lecturas demasiado pequeñas o falsas
            if (valor.length < 4) return;

            codigo.value = valor;

            estado.textContent =
                "Código leído correctamente";

            if (quaggaActivo) {

                Quagga.stop();

                quaggaActivo = false;

            }
        }

    });
}


// ======================================================
// GUARDAR EN GOOGLE SHEETS
// ======================================================

btnGuardar.addEventListener("click", function() {

    if (codigo.value.trim() === "") {

        estado.textContent =
            "Primero escanee o escriba un código";

        return;
    }

    estado.textContent = "Guardando...";

    fetch(API_URL, {

        method: "POST",

        body: JSON.stringify({

            codigo: codigo.value.trim(),

            descripcion: descripcion.value.trim(),

            ubicacion: ubicacion.value.trim(),

            usuario: usuario.value.trim()

        })

    })

    .then(response => response.json())

    .then(data => {

        estado.textContent =
            "Guardado correctamente";

        codigo.value = "";
        descripcion.value = "";
        ubicacion.value = "";
        usuario.value = "";

    })

    .catch(error => {

        estado.textContent =
            "Error al guardar";

        console.log(error);

    });

});
