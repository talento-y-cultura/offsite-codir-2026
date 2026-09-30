/* Punto de entrada: carga data/agenda.json, pinta las dos vistas y conecta el cambio de vista */
import { pintarLista } from "./lista.js";
import { pintarCalendario } from "./calendario.js";
import { iniciarModal } from "./modal.js";

const cajas = {
  lista: document.getElementById("agenda-lista"),
  cal: document.getElementById("agenda-cal")
};
const vistas = document.querySelectorAll(".vista");

function verVista(v) {
  vistas.forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === v)));
  cajas.lista.hidden = v !== "lista";
  cajas.cal.hidden = v !== "cal";
}
vistas.forEach(x => x.addEventListener("click", () => verVista(x.dataset.v)));

async function iniciar() {
  try {
    const resp = await fetch("data/agenda.json");
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const agenda = await resp.json();
    pintarLista(agenda, cajas.lista);
    pintarCalendario(agenda, cajas.cal);
    iniciarModal(agenda);
    /* arranca siempre en calendario; en celular la grilla se desliza de lado */
    verVista("cal");
  } catch (err) {
    console.error("No se pudo cargar la agenda:", err);
    cajas.lista.hidden = false;
    cajas.lista.innerHTML = '<p class="pendiente">No se pudo cargar la agenda. ' +
      'Si abriste index.html con doble clic, usa servir.bat y entra a http://localhost:8000</p>';
  }
}
iniciar();
