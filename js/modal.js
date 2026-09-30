/* Detalle de actividad: abrir, cerrar (X, fuera, Escape) y devolver el foco */
import { ETIQUETAS, rango, icsDe, mapaUrl, textoDesc } from "./formato.js";

export function iniciarModal(agenda) {
  const modal = document.getElementById("modal");
  const caja = document.getElementById("modal-caja");
  let ultimoFoco = null;

  function abrir(di, bi) {
    const d = agenda[di], b = d.bloques[bi];
    const foto = b.foto
      ? '<img class="modal__foto" src="' + b.foto + '" alt="' + b.titulo + '">'
      : '<div class="modal__foto modal__foto--vacia"><div>Espacio para la foto del lugar<br>' +
        '<span style="font-size:.85em">Agrega la ruta en el campo <code>foto</code></span></div></div>';
    const acciones = [];
    if (b.inicio) acciones.push('<a class="btn" href="' + icsDe(b) +
      '" download="' + b.titulo.replace(/[^\w]+/g, "-").toLowerCase() + '.ics">Añadir al calendario</a>');
    if (b.mapa) acciones.push('<a class="btn btn--linea" href="' + mapaUrl(b.mapa) +
      '" target="_blank" rel="noopener">Ver ubicación</a>');
    if (b.web) acciones.push('<a class="btn btn--linea" href="' + b.web +
      '" target="_blank" rel="noopener">Página web</a>');

    caja.className = "modal__caja modal--" + b.quien;
    caja.innerHTML =
      '<div class="modal__top modal--' + b.quien + '">' +
        '<button class="modal__cerrar" type="button" aria-label="Cerrar">&times;</button>' +
        '<span class="modal__etq">' + ETIQUETAS[b.quien] + '</span>' +
        '<h3 class="modal__t" id="modal-t">' + b.titulo + '</h3>' +
        '<p class="modal__meta">' + d.fecha + ' · ' + rango(b) + '<br>' + b.lugar + '</p>' +
      '</div>' +
      '<div class="modal__body">' + foto +
        (b.desc ? '<p class="modal__h">Descripción</p><p class="modal__p">' + textoDesc(b.desc) + '</p>' : '') +
        (b.objetivo ? '<p class="modal__h">Objetivo</p><p class="modal__p">' + b.objetivo + '</p>' : '') +
        '<div class="modal__acciones">' + acciones.join("") + '</div>' +
      '</div>';

    modal.hidden = false;
    modal.classList.add("abierto");
    document.body.classList.add("sin-scroll");
    caja.querySelector(".modal__cerrar").focus();
  }

  function cerrar() {
    modal.hidden = true;
    modal.classList.remove("abierto");
    document.body.classList.remove("sin-scroll");
    if (ultimoFoco) ultimoFoco.focus();
  }

  /* cualquier bloque de lista o evento de calendario abre su detalle */
  document.getElementById("agenda").addEventListener("click", e => {
    const b = e.target.closest(".bloque, .ev");
    if (!b) return;
    ultimoFoco = b;
    abrir(+b.dataset.d, +b.dataset.b);
  });
  modal.addEventListener("click", e => {
    if (e.target === modal || e.target.closest(".modal__cerrar")) cerrar();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) cerrar(); });
}
