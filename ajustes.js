const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzb7rdtOS0v4NVwAiPC5teM64CDYv04hbsDOJmbD5DVNYXdNA7Caq7uQBkBtUKKi5ET/exec";

// Cargar datos bancarios guardados previamente al abrir la pantalla
document.addEventListener('DOMContentLoaded', () => {
  if(localStorage.getItem('nk_tarjeta')) {
    document.getElementById('config-tarjeta').value = localStorage.getItem('nk_tarjeta');
  }
  if(localStorage.getItem('nk_titular')) {
    document.getElementById('config-titular').value = localStorage.getItem('nk_titular');
  }
});

// Guardar los datos de transferencia en la memoria de la compu
function guardarDatosBanco(event) {
  event.preventDefault();
  const tarjeta = document.getElementById('config-tarjeta').value.trim();
  const titular = document.getElementById('config-titular').value.trim();
  
  localStorage.setItem('nk_tarjeta', tarjeta);
  localStorage.setItem('nk_titular', titular);
  
  alert("¡Datos bancarios guardados! Se usarán automáticamente en tus mensajes de WhatsApp.");
}

// Registrar una nueva clienta en Google Sheets
async function registrarClienta(event) {
  event.preventDefault();
  const botonSubmit = event.target.querySelector('button[type="submit"]');
  const nombre = document.getElementById('reg-nombre').value.trim();
  const telefono = document.getElementById('reg-telefono').value.trim();
  
  const textoOriginal = botonSubmit.innerHTML;
  botonSubmit.disabled = true;
  botonSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
  
  const datosNuevaClienta = {
    action: "addClienta",
    nombre: nombre,
    telefono: telefono
  };
  
  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosNuevaClienta)
    });
    
    alert(`¡Excelente! ${nombre} ha sido enviada al directorio exitosamente.`);
    document.getElementById('form-nueva-clienta').reset();
  } catch (error) {
    console.error(error);
    alert("Hubo un error al guardar.");
  } finally {
    botonSubmit.disabled = false;
    botonSubmit.innerHTML = textoOriginal;
  }
}

function limpiarCacheLocal() {
  localStorage.clear();
  alert("Caché limpia. Se borraron los datos de la tarjeta locales.");
  location.reload();
}