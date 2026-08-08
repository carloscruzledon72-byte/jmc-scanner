const btnEscanear = document.getElementById("btnEscanear");
const btnGuardar = document.getElementById("btnGuardar");

const codigo = document.getElementById("codigo");
const descripcion = document.getElementById("descripcion");
const ubicacion = document.getElementById("ubicacion");
const usuario = document.getElementById("usuario");
const estado = document.getElementById("estado");

let scanner = null;

btnEscanear.addEventListener("click", iniciarEscaner);

function iniciarEscaner() {
  estado.textContent = "Abriendo cámara...";

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

      scanner.stop().catch(function() {});
    },
    function(errorMessage) {
      // Sigue buscando hasta encontrar un código válido
    }
  ).catch(function(err) {
    estado.textContent = "Error al abrir la cámara";
    console.log(err);
  });
}
btnGuardar.addEventListener("click", function () {
  if (codigo.value.trim() === "") {
    estado.textContent = "Primero escanee o escriba un código";
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
    estado.textContent = "Guardado correctamente";

    codigo.value = "";
    descripcion.value = "";
    ubicacion.value = "";
    usuario.value = "";
  })
  .catch(error => {
    estado.textContent = "Error al guardar";
    console.log(error);
  });
});
