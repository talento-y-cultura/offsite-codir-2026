/* Vista de lista: un bloque por actividad, agrupados por día */
import { ETIQUETAS, rango } from "./formato.js";

export function pintarLista(agenda, contenedor) {
  agenda.forEach((d, di) => {
    const sec = document.createElement("div");
    sec.className = "dia";
    sec.innerHTML = '<div class="dia__head"><span class="dia__num">' + d.dia +
      '</span><span class="dia__fecha">' + d.fecha + '</span></div>';
    d.bloques.forEach((b, bi) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bloque bloque--" + b.quien;
      btn.dataset.d = di; btn.dataset.b = bi;
      btn.innerHTML =
        '<span class="bloque__hora">' + rango(b) + '</span>' +
        '<span><span class="bloque__t">' + b.titulo + '</span>' +
        '<span class="bloque__l">' + b.lugar + ' · ' + ETIQUETAS[b.quien] + '</span></span>' +
        '<span class="bloque__mas">Ver detalle</span>';
      sec.appendChild(btn);
    });
    contenedor.appendChild(sec);
  });
}
