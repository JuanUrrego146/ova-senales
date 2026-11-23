/* Núcleo del OVA: navegación por hash, puntaje, preguntas, consolas y reporte SCORM. */
var App = (function () {
  "use strict";
  // modo=banco: el paquete SCORM de NOVA 2 abre solo el banco de trabajo (más el OVI de consulta) y reporta 20 puntos
  var MODO = (function () { try { return new URLSearchParams(location.search).get("modo") || ""; } catch (e) { return ""; } })();
  var MAX = MODO === "banco" ? { nova2: 20 } : { nova1: 10, nova2: 20, nova3: 10 };
  var TOTAL = 0; for (var mk in MAX) TOTAL += MAX[mk];
  var score = {}; for (var sk in MAX) score[sk] = null;
  var vistas = {}, construidas = {}, actual = null, interaccion = 0, idSeq = 0;
  var ORDEN = MODO === "banco" ? ["nova2", "ovi", "cierre"] : ["inicio", "nova1", "ovi", "nova2", "nova3", "cierre"];
  if (MODO) document.documentElement.classList.add("modo-" + MODO);

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, texto) { var e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; }
  function h(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  function uid(p) { return (p || "c") + "-" + (++idSeq); }

  // ---------------------------------------------------------------- puntaje (copia local solo como comodidad)
  function guardar() { try { localStorage.setItem("ova_g7_puntaje" + MODO, JSON.stringify(score)); } catch (e) { /* sin almacenamiento */ } }
  function cargar() { try { var s = JSON.parse(localStorage.getItem("ova_g7_puntaje" + MODO) || "null"); if (s) Object.keys(score).forEach(function (k) { if (typeof s[k] === "number") score[k] = s[k]; }); } catch (e) { /* nada */ } }
  function total() { var t = 0; for (var k in score) t += score[k] || 0; return t; }
  function setScore(k, v) {
    score[k] = Math.max(score[k] || 0, Math.round(v));
    guardar(); pintarPuntaje();
    SCORM.reportarNota(total(), TOTAL); SCORM.set("cmi.core.lesson_status", "incomplete"); SCORM.guardar();
  }
  function pintarPuntaje() {
    var p = $("#puntaje-global"); if (p) p.innerHTML = "<span>Puntaje</span> <b>" + String(total()).padStart(2, "0") + "</b>/" + TOTAL;
    document.querySelectorAll("nav.nodos a").forEach(function (a) {
      var k = a.getAttribute("href").slice(1);
      a.classList.toggle("hecho", MAX[k] !== undefined && score[k] !== null && score[k] !== undefined);
    });
  }

  // ---------------------------------------------------------------- navegación
  function registrar(nombre, constructor) { vistas[nombre] = constructor; }
  function mostrar(nombre) {
    if (ORDEN.indexOf(nombre) < 0) nombre = ORDEN[0];
    if (actual === nombre) return;
    AU.detenerTodo();
    document.querySelectorAll(".vista").forEach(function (v) { v.hidden = v.dataset.vista !== nombre; });
    document.querySelectorAll("nav.nodos a").forEach(function (a) { var on = a.getAttribute("href") === "#" + nombre; a.classList.toggle("activo", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    if (!construidas[nombre] && vistas[nombre]) { construidas[nombre] = true; vistas[nombre]($("#v-" + nombre)); }
    if (vistas[nombre] && vistas[nombre].alMostrar) vistas[nombre].alMostrar();
    actual = nombre;
    window.scrollTo(0, 0);
    var h1 = $("#v-" + nombre + " h1");
    document.title = (h1 && nombre !== "inicio" ? h1.textContent + " · " : "") + "Operaciones con señales";
    var activa = document.querySelector("nav.nodos a.activo"); if (activa && activa.scrollIntoView) activa.scrollIntoView({ block: "nearest", inline: "center" });
  }

  // ---------------------------------------------------------------- pregunta: burbujas de examen, corrección en lápiz
  function pregunta(cont, datos, idInteraccion, alResponder) {
    var bloque = el("div", "pregunta");
    bloque.appendChild(el("p", "enunciado", datos.enunciado));
    if (datos.extra) datos.extra(bloque);
    var lista = el("div", "opciones"); bloque.appendChild(lista);
    var aviso = el("div", "retro"); aviso.hidden = true; aviso.setAttribute("role", "status");
    var botones = [];
    datos.opciones.forEach(function (op, i) {
      var b = el("button", "opcion"); b.type = "button";
      b.appendChild(el("span", "burbuja", String.fromCharCode(65 + i)));
      b.appendChild(el("span", "txt", op.texto));
      b.addEventListener("click", function () {
        if (b.disabled) return;
        botones.forEach(function (x) { x.disabled = true; });
        var bien = !!op.ok;
        b.classList.add("elegida", bien ? "correcta" : "incorrecta");
        if (!bien) botones.forEach(function (x, j) { if (datos.opciones[j].ok) x.classList.add("correcta"); });
        aviso.className = "retro " + (bien ? "ok" : "mal");
        aviso.innerHTML = "<b>" + (bien ? "Correcto." : "No es esa.") + "</b> " + escapar(op.fb || "");
        aviso.hidden = false;
        SCORM.registrarInteraccion(interaccion++, idInteraccion, "choice", String.fromCharCode(97 + i), bien);
        if (alResponder) alResponder(bien, i);
      });
      botones.push(b); lista.appendChild(b);
    });
    bloque.appendChild(aviso);
    cont.appendChild(bloque);
    return bloque;
  }
  function escapar(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // cuestionario: opts { id, puntosPorPregunta, alTerminar(correctas, n, pts), mensaje(c, n) }
  function quiz(cont, lista, opts) {
    opts = opts || {};
    var caja = el("div", "quiz"); cont.appendChild(caja);
    function montar() {
      caja.innerHTML = "";
      var correctas = 0, respondidas = 0, n = lista.length, ppp = opts.puntosPorPregunta || 0;
      var cab = h('<div class="quiz-cab"><div class="progreso-act"><i></i></div><span class="mono">0/' + n + '</span></div>');
      caja.appendChild(cab);
      lista.forEach(function (q, i) {
        var f = el("div", "item-quiz");
        f.appendChild(h('<span class="n-quiz mono">' + String(i + 1).padStart(2, "0") + '</span>'));
        var cuerpo = el("div"); f.appendChild(cuerpo);
        pregunta(cuerpo, q, (opts.id || "quiz") + "_" + (i + 1), function (bien) {
          respondidas++; if (bien) correctas++;
          cab.querySelector("i").style.width = (respondidas / n * 100) + "%";
          cab.querySelector(".mono").textContent = respondidas + "/" + n + (ppp ? " · " + correctas * ppp + " pts" : "");
          if (respondidas === n) {
            var pts = Math.round(correctas * ppp);
            var res = h('<div class="resultado-act"><b class="grande">' + (ppp ? pts + "/" + n * ppp : correctas + "/" + n) + '</b><span>' + escapar(opts.mensaje ? opts.mensaje(correctas, n) : (correctas === n ? "Todas bien." : "Lee la explicación de las que fallaste: ahí está lo importante.")) + '</span></div>');
            var re = el("button", "btn sec", "Reintentar"); re.type = "button"; re.addEventListener("click", function () { montar(); caja.scrollIntoView({ block: "start" }); });
            res.appendChild(re);
            caja.appendChild(res); res.scrollIntoView({ behavior: AU.reduceMotion ? "auto" : "smooth", block: "nearest" });
            if (opts.alTerminar) opts.alTerminar(correctas, n, pts);
          }
        });
        caja.appendChild(f);
      });
    }
    montar();
  }

  // ---------------------------------------------------------------- consola: marco + lienzos + lecturas
  // opts { titulo, sinEspectro, sinOnda, alto }  → { raiz, barra, boton, controles, onda, esp, lecturas, extra }
  function consola(cont, opts) {
    opts = opts || {};
    var cs = el("div", "consola");
    var barra = el("div", "consola-barra");
    var boton = h('<button type="button" class="btn-play" aria-pressed="false"><span class="ico" aria-hidden="true"></span><span class="lbl">Escuchar</span></button>');
    barra.appendChild(boton);
    barra.appendChild(h('<span class="consola-titulo mono">' + escapar(opts.titulo || "Banco de medida") + '</span>'));
    barra.appendChild(h('<span class="led-vivo mono" aria-hidden="true">MONITOR</span>'));
    cs.appendChild(barra);
    var controles = el("div", "controles"); cs.appendChild(controles);
    var extra = el("div", "consola-extra"); cs.appendChild(extra);
    var lienzos = el("div", "lienzos" + (opts.sinEspectro || opts.sinOnda ? " uno" : ""));
    var c1 = null, c2 = null;
    if (!opts.sinOnda) { c1 = document.createElement("canvas"); var k1 = el("figure", "pantalla-scope"); k1.appendChild(c1); k1.appendChild(el("figcaption", "pie mono", "Osciloscopio · amplitud contra tiempo")); lienzos.appendChild(k1); c1.setAttribute("role", "img"); c1.setAttribute("aria-label", "Forma de onda de la señal"); }
    if (!opts.sinEspectro) { c2 = document.createElement("canvas"); var k2 = el("figure", "pantalla-scope"); k2.appendChild(c2); k2.appendChild(el("figcaption", "pie mono", "Analizador · nivel contra frecuencia (escala log)")); lienzos.appendChild(k2); c2.setAttribute("role", "img"); c2.setAttribute("aria-label", "Espectro de la señal"); }
    if (opts.alto) [c1, c2].forEach(function (c) { if (c) c.style.height = opts.alto + "px"; });
    cs.appendChild(lienzos);
    var lecturas = el("div", "readout"); cs.appendChild(lecturas);
    cont.appendChild(cs);
    return { raiz: cs, barra: barra, boton: boton, controles: controles, extra: extra, onda: c1, esp: c2, lecturas: lecturas };
  }
  function lectura(readout, etiqueta, valor, clase) {
    var d = el("div"); d.appendChild(el("small", null, etiqueta)); var b = el("b", clase || null, valor); d.appendChild(b); readout.appendChild(d); return b;
  }
  // control deslizante enlazado a un Vivo (o a una función)
  function rango(caja, o, destino) {
    var id = o.id || uid("r");
    var c = el("div", "control");
    var lab = el("label"); lab.htmlFor = id; lab.appendChild(el("span", null, o.etiqueta));
    var val = el("output", "valor"); val.setAttribute("for", id); lab.appendChild(val);
    var input = document.createElement("input");
    input.type = "range"; input.id = id; input.min = o.min; input.max = o.max; input.step = o.paso; input.value = o.valor;
    function aplicar() {
      var v = parseFloat(input.value);
      val.textContent = o.fmt ? o.fmt(v) : String(v);
      input.style.setProperty("--p", ((v - o.min) / (o.max - o.min) * 100) + "%");
      if (typeof destino === "function") destino(v); else if (destino) destino.set(o.k, v);
    }
    input.addEventListener("input", aplicar);
    c.appendChild(lab); c.appendChild(input); caja.appendChild(c);
    aplicar();
    return input;
  }
  function selector(caja, o, destino) {
    var id = o.id || uid("s");
    var c = el("div", "control");
    var lab = el("label"); lab.htmlFor = id; lab.appendChild(el("span", null, o.etiqueta)); c.appendChild(lab);
    var s = document.createElement("select"); s.id = id;
    o.opciones.forEach(function (op) { var x = document.createElement("option"); x.value = op[0]; x.textContent = op[1]; s.appendChild(x); });
    s.value = o.valor;
    s.addEventListener("change", function () { if (typeof destino === "function") destino(s.value); else destino.set(o.k, s.value); });
    c.appendChild(s); caja.appendChild(c);
    return s;
  }

  // ---------------------------------------------------------------- arranque
  function iniciar() {
    cargar();
    var hayLMS = SCORM.iniciar();
    var estado = $("#estado-lms");
    if (estado) estado.textContent = hayLMS
      ? "Conectado al aula: tu puntaje queda en el libro de calificaciones."
      : "Modo libre: puedes recorrer todo; el puntaje se guarda en este navegador.";
    pintarPuntaje();
    window.addEventListener("hashchange", function () { mostrar((location.hash || "#" + ORDEN[0]).slice(1)); });
    mostrar((location.hash || "#" + ORDEN[0]).slice(1));
    document.querySelectorAll("figure[data-video] video").forEach(function (v) {
      var fig = v.closest("figure");
      var ocultar = function () { fig.hidden = true; };
      if (v.error) ocultar();
      v.addEventListener("error", ocultar, true);
      var src = v.querySelector("source"); if (src) src.addEventListener("error", ocultar);
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) AU.detenerTodo(); });
    window.addEventListener("pagehide", function () { AU.detenerTodo(); });
  }
  function terminar() { var ap = total() >= TOTAL * 0.6; SCORM.reportarNota(total(), TOTAL); SCORM.terminar(ap); return ap; }
  function reiniciar() {
    for (var k in score) score[k] = null; guardar();
    try { localStorage.removeItem("ova_g7_reto"); } catch (e) { /* nada */ }
    location.hash = ORDEN[0]; location.reload();
  }

  return {
    MAX: MAX, TOTAL: TOTAL, MODO: MODO, score: function () { return score; }, total: total, setScore: setScore,
    registrar: registrar, mostrar: mostrar,
    pregunta: pregunta, quiz: quiz, consola: consola, lectura: lectura, rango: rango, selector: selector,
    el: el, h: h, $: $, uid: uid, escapar: escapar, iniciar: iniciar, terminar: terminar, reiniciar: reiniciar
  };
})();
