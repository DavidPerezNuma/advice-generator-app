// ===== Configuración de la API =====
const API_URL = "https://api.adviceslip.com/advice";
const MAX_ATTEMPTS = 3;      // intentos para obtener un consejo distinto al actual
const RETRY_DELAY_MS = 2000; // la API repite el mismo consejo si se pide antes de 2 s

// ===== Referencias al DOM =====
const card = document.querySelector(".card");
const adviceId = document.getElementById("advice-id");
const adviceText = document.getElementById("advice-text");
const diceButton = document.getElementById("dice");

// Id del consejo que se está mostrando
let currentId = null;

// Pausa la ejecución durante "ms" milisegundos
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Consulta un consejo aleatorio a la API y devuelve el objeto "slip"
async function fetchAdvice() {
  // El parámetro "t" evita que el navegador reutilice una respuesta en caché
  const response = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.slip) {
    throw new Error("La respuesta no contiene un consejo");
  }

  return data.slip; // { id: 117, advice: "..." }
}

// Muestra el consejo en la tarjeta
function renderAdvice(slip) {
  adviceId.textContent = `Advice #${slip.id}`;
  adviceText.textContent = `“${slip.advice}”`;
  currentId = slip.id;
}

// Muestra un mensaje de error en la tarjeta
function renderError() {
  adviceId.textContent = "Advice #—";
  adviceText.textContent = "No se pudo obtener un consejo. Revisa tu conexión e inténtalo de nuevo.";
}

// Activa o desactiva el estado de carga
function setLoading(isLoading) {
  card.classList.toggle("is-loading", isLoading);
  diceButton.disabled = isLoading;
}

// Pide un consejo nuevo; si la API devuelve el mismo, reintenta
async function getNewAdvice() {
  setLoading(true);

  try {
    let slip = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      slip = await fetchAdvice();

      if (slip.id !== currentId) {
        break; // es un consejo nuevo, no hace falta reintentar
      }

      if (attempt < MAX_ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }

    renderAdvice(slip);
  } catch (error) {
    console.error(error);
    renderError();
  } finally {
    setLoading(false);
  }
}

// ===== Eventos =====
diceButton.addEventListener("click", getNewAdvice);

// ===== Inicio: carga un consejo al abrir la página =====
getNewAdvice();
