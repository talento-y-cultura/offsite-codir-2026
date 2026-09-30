/* Animaciones de la página: título por letras, intercambio de letras y
   revelado de secciones al hacer scroll. No toca ningún texto: solo lo envuelve.
   Si el usuario pidió reducir movimiento, <html> no tiene .anima y nada de esto corre. */

/* ---- Configuración ---- */
const INICIO_INTERCAMBIO = 2600;      // ms tras cargar antes del primer intercambio de letras
const PAUSA_INTERCAMBIO = [3000, 4200]; // ms entre intercambios (mínimo, máximo)
const DURACION_INTERCAMBIO = 520;     // ms que tarda una letra en cambiar

/* Elementos que aparecen al hacer scroll. Los hermanos se escalonan. */
const REVELAR = ".intro, .dato, .hotel, .tips li, .aviso, .contacto > div, .leyenda, .vistas";
const CABEZAS = ".seccion__head";

function crear(clase, texto) {
  const s = document.createElement("span");
  s.className = clase;
  if (texto) s.textContent = texto;
  return s;
}

/* Envuelve cada palabra en una máscara y cada letra en un par original/doble */
function partirTitulo(titulo) {
  const texto = titulo.textContent.trim();
  const letras = [];
  titulo.setAttribute("aria-label", texto);
  titulo.textContent = "";
  texto.split(/\s+/).forEach((palabra, i) => {
    if (i) titulo.append(" ");
    const mascara = crear("titulo__palabra");
    const interior = crear("titulo__interior");
    mascara.setAttribute("aria-hidden", "true");
    interior.style.setProperty("--i", i);
    for (const c of palabra) {
      const letra = crear("letra");
      letra.append(crear("letra__a", c), crear("letra__b", c));
      interior.append(letra);
      letras.push(letra);
    }
    mascara.append(interior);
    titulo.append(mascara);
  });
  titulo.classList.add("partido");
  return letras;
}

/* La letra sale por la derecha mientras su doble entra desde la izquierda */
function intercambiar(letra) {
  const opciones = { duration: DURACION_INTERCAMBIO, easing: "cubic-bezier(.45,0,.55,1)" };
  letra.firstChild.animate([{ transform: "none" }, { transform: "translateX(110%)" }], opciones);
  letra.lastChild.animate([{ transform: "translateX(-110%)" }, { transform: "none" }], opciones);
}

function bucleIntercambio(letras, hero) {
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  function turno() {
    if (heroVisible && !document.hidden) {
      const cuantas = Math.random() < 0.5 ? 1 : 2;
      for (let k = 0; k < cuantas; k++) {
        const letra = letras[Math.floor(Math.random() * letras.length)];
        setTimeout(() => intercambiar(letra), k * (150 + Math.random() * 150));
      }
    }
    const [min, max] = PAUSA_INTERCAMBIO;
    setTimeout(turno, min + Math.random() * (max - min));
  }
  setTimeout(turno, INICIO_INTERCAMBIO);
}

function revelarAlScroll() {
  const cabezas = document.querySelectorAll(CABEZAS);
  const bloques = document.querySelectorAll(REVELAR);
  cabezas.forEach(c => c.classList.add("revelar-cabeza"));
  bloques.forEach(b => {
    const hermanos = [...b.parentElement.children].filter(x => x.matches(REVELAR));
    b.style.setProperty("--d", Math.min(hermanos.indexOf(b), 6));
    b.classList.add("revelar");
  });

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visto");
      observador.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  [...cabezas, ...bloques].forEach(x => observador.observe(x));
}

function iniciar() {
  if (!document.documentElement.classList.contains("anima")) return;
  const hero = document.querySelector(".hero");
  const titulo = document.querySelector(".hero__title");
  if (titulo) bucleIntercambio(partirTitulo(titulo), hero);
  revelarAlScroll();
}
iniciar();
