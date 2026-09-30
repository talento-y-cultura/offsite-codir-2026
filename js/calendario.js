/* Vista de calendario: grilla por horas con eventos en posición absoluta */
import { ETIQUETAS, h12, rango, minutos } from "./formato.js";

/* ---------- CONFIGURACIÓN ----------
   Rango horario de la grilla y escala. Si alguna actividad empieza antes de
   las 6:00 o termina después de las 10:00 p. m., ajusta estos dos valores. */
const CAL_DESDE = 6 * 60, CAL_HASTA = 22 * 60, PX_MIN = 1.5;   /* 1.5 px/min = 90 px por hora; se pasa al CSS como --px-hora */
const ALTO = (CAL_HASTA - CAL_DESDE) * PX_MIN;

/* Agrupa las actividades que se cruzan y les asigna carriles,
   para que dos cosas a la misma hora se vean lado a lado. */
function carriles(evs) {
  const orden = evs.slice().sort((a, b) => a.ini - b.ini);
  let grupo = [], finGrupo = -1;
  const salida = [];
  const cerrar = () => {
    const pistas = [];
    grupo.forEach(e => {
      let i = pistas.findIndex(f => f <= e.ini);
      if (i === -1) { i = pistas.length; pistas.push(0); }
      pistas[i] = e.fin;
      e.carril = i;
    });
    grupo.forEach(e => { e.total = pistas.length; salida.push(e); });
    grupo = [];
  };
  orden.forEach(e => {
    if (grupo.length && e.ini >= finGrupo) { cerrar(); finGrupo = -1; }
    grupo.push(e);
    finGrupo = Math.max(finGrupo, e.fin);
  });
  if (grupo.length) cerrar();
  return salida;
}

function tarjeta(b, di, bi, abierto) {
  return '<button type="button" class="ev ev--' + b.quien + (abierto ? ' ev--abierto' : '') +
    '" data-d="' + di + '" data-b="' + bi + '" title="' + b.titulo + ' (' +
    rango(b).replace(/<[^>]+>/g, "") + ')">' +
    '<span class="ev__tag">' + ETIQUETAS[b.quien] + '</span>' +
    '<span class="ev__cuerpo"><span class="ev__t">' + b.titulo + '</span>' +
    '<span class="ev__h">' + rango(b) + '</span></span></button>';
}

export function pintarCalendario(agenda, contenedor) {
  const cols = agenda.map((d, di) => {
    const conHora = [], sinHora = [];
    d.bloques.forEach((b, bi) => {
      if (b.inicio) conHora.push({ b: b, bi: bi, ini: minutos(b.inicio), fin: b.fin ? minutos(b.fin) : CAL_HASTA });
      else sinHora.push({ b: b, bi: bi });
    });
    const evs = carriles(conHora).map(e => {
      const ancho = 100 / e.total, izq = e.carril * ancho;
      const top = (Math.max(e.ini, CAL_DESDE) - CAL_DESDE) * PX_MIN;
      const alto = Math.max((Math.min(e.fin, CAL_HASTA) - Math.max(e.ini, CAL_DESDE)) * PX_MIN, 52);
      return tarjeta(e.b, di, e.bi, !e.b.fin)
        .replace('class="ev', 'style="top:' + top + 'px;height:' + alto + 'px;left:calc(' +
                 izq + '% + 3px);width:calc(' + ancho + '% - 6px)" class="ev');
    }).join("");
    const sueltos = sinHora.length
      ? '<div class="cal__sin"><p>Sin horario definido</p>' +
        sinHora.map(e => tarjeta(e.b, di, e.bi, false)).join("") + '</div>'
      : '';
    return '<div class="cal__col"><div class="cal__dh"><b>' + d.dia + '</b><span>' +
      d.fecha.replace(" de noviembre", "") + '</span></div>' +
      '<div class="cal__pista" style="height:' + ALTO + 'px">' + evs + '</div>' +
      sueltos + '</div>';
  }).join("");

  let horas = "";
  for (let m = CAL_DESDE; m <= CAL_HASTA; m += 60) {
    const h = h12("0000-00-00 " + String(m / 60 | 0).padStart(2, "0") + ":00");
    horas += '<span class="cal__h" style="top:' + ((m - CAL_DESDE) * PX_MIN) +
             'px' + (m === CAL_DESDE ? ';transform:none' : '') + '">' +
             h.t + " " + h.mer + '</span>';
  }

  contenedor.innerHTML =
    '<div class="cal__scroll"><div class="cal__grid" style="--px-hora:' + (PX_MIN * 60) +
      'px;--dias:' + agenda.length + '">' +
      '<div class="cal__col"><div class="cal__dh cal__dh--vacio"><b>&nbsp;</b><span>&nbsp;</span></div>' +
      '<div class="cal__pista cal__pista--horas" style="height:' + ALTO + 'px">' + horas + '</div></div>' +
      cols +
    '</div></div>' +
    '<p class="cal__nota">Desliza la grilla de lado si no entra en la pantalla. ' +
    'Toca cualquier actividad para ver el detalle.</p>';
}

