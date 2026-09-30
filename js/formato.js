/* Funciones de formato: horas en 12 h, archivo .ics y enlace de mapa */

export const ETIQUETAS = {
  codir: "Codir",
  parejas: "Parejas de Codir",
  todos: "Todos juntos",
  libre: "Tiempo libre"
};

/* Convierte "2026-11-04 13:00" a { t:"1:00", mer:"p. m." } (espacio duro en el meridiano) */
export function h12(s) {
  let h = +s.slice(11, 13);
  const mer = h < 12 ? "a. m." : "p. m.";
  h = h % 12 || 12;
  return { t: h + ":" + s.slice(14, 16), mer: mer };
}

/* Texto del horario de una actividad. Devuelve HTML (el "Por confirmar" lleva clase) */
export function rango(b) {
  if (!b.inicio) return '<span class="pendiente">Por confirmar</span>';
  const a = h12(b.inicio);
  if (!b.fin) return "Desde " + a.t + " " + a.mer;          /* actividad sin hora de cierre */
  const z = h12(b.fin);
  return a.mer === z.mer ? a.t + " – " + z.t + " " + z.mer
                         : a.t + " " + a.mer + " – " + z.t + " " + z.mer;
}

/* Descripción del detalle, de texto a HTML. En agenda.json:
   - "\n" dentro de la descripción empieza un renglón nuevo
   - las horas ("10:45 a. m.") salen solas en negrita y no se parten de línea
   - si un renglón empieza con un rótulo corto y dos puntos ("Grupo 1: …"),
     el rótulo sale en negrita */
export function textoDesc(t) {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc(t).split("\n").map(r => '<span class="renglon">' + r
    .replace(/^([^:.]{1,25}):\s/, "<strong>$1:</strong> ")
    .replace(/\b(\d{1,2}:\d{2}) ([ap])\. m\./g, "<strong>$1&nbsp;$2.&nbsp;m.</strong>") + "</span>"
  ).join("");
}

/* Minutos desde medianoche de "2026-11-04 13:00" */
export const minutos = s => +s.slice(11, 13) * 60 + +s.slice(14, 16);

/* .ics de una actividad, como data URI (sin servidor) */
export function icsDe(b) {
  const f = s => s.replace(/[- :]/g, "").slice(0, 8) + "T" + s.slice(11, 13) + s.slice(14, 16) + "00";
  const esc = t => String(t || "").replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const l = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UNACEM//Offsite Codir//ES",
    "BEGIN:VEVENT", "UID:" + f(b.inicio) + "-codir@unacem.pe", "DTSTAMP:20260830T120000Z",
    "DTSTART:" + f(b.inicio),
    /* sin hora de cierre, el evento se agenda con 2 horas de duración */
    b.fin ? "DTEND:" + f(b.fin) : "DURATION:PT2H",
    "SUMMARY:" + esc(b.titulo), "LOCATION:" + esc(b.lugar), "DESCRIPTION:" + esc(b.desc),
    "END:VEVENT", "END:VCALENDAR"];
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(l.join("\r\n"));
}

/* El campo mapa puede ser un enlace de Google Maps ("https://maps.app.goo.gl/…"),
   que se usa tal cual, o un texto de búsqueda ("Casa Cartagena Cusco") */
export const mapaUrl = q => /^https?:\/\//.test(q) ? q
  : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
