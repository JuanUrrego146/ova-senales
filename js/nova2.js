/* NOVA 2 · Síntesis de señales: banco de trabajo (predecir → manipular → justificar), 20 puntos */
App.registrar("nova2", function (vista) {
  "use strict";
  var el = App.el, h = App.h, num = AU.num, MODULOS = CONTENIDO.operaciones, Cc = AU.COLORES;
  var puntaje = 0, cerrado = false;

  // ---------- animaciones explicativas (lámina de papel)
  function lamina(g, w, hh) {
    g.fillStyle = "#FBFAF6"; g.fillRect(0, 0, w, hh);
    g.strokeStyle = "#E7E3D8"; g.lineWidth = 1; g.beginPath();
    for (var x = 0; x <= w; x += 16) { g.moveTo(Math.round(x) + .5, 0); g.lineTo(Math.round(x) + .5, hh); }
    for (var y = 0; y <= hh; y += 16) { g.moveTo(0, Math.round(y) + .5); g.lineTo(w, Math.round(y) + .5); }
    g.stroke(); g.strokeStyle = "#BDB8AB"; g.beginPath(); g.moveTo(0, hh / 2 + .5); g.lineTo(w, hh / 2 + .5); g.stroke();
  }
  function linea(g, w, hh, fn, color, ancho, dash) {
    g.beginPath(); if (dash) g.setLineDash(dash);
    for (var i = 0; i <= 300; i++) { var u = i / 300, px = u * w, py = hh / 2 - fn(u) * (hh / 2 - 12) * 0.85; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.strokeStyle = color; g.lineWidth = ancho || 2; g.lineJoin = "round"; g.stroke(); g.setLineDash([]);
  }
  function nota(g, txt, x, y, color) { g.font = "500 11px 'JetBrains Mono', monospace"; g.fillStyle = color || "#5D5A52"; g.fillText(txt, x, y); }
  var TINTA = "#1A1A18", GRIS = "#9C978B", ACENTO = "#E0561F";
  var ANIM = {
    escalado: function (g, w, hh, t) {
      var k = 1 + 0.7 * Math.sin(t * 1.2); lamina(g, w, hh);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 3) * 0.5; }, GRIS, 1.5, [4, 4]);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 3) * 0.5 * k; }, TINTA, 2.2);
      nota(g, "k = " + num(k, 2), 10, 18, ACENTO); nota(g, "misma frecuencia, otra altura", 10, hh - 8);
    },
    suma: function (g, w, hh, t) {
      var n = 1 + Math.floor((t * 0.6) % 4); lamina(g, w, hh);
      for (var i = 1; i <= n; i++) (function (i) { linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 2 * i) * 0.5 / i; }, GRIS, 1, [3, 4]); })(i);
      linea(g, w, hh, function (u) { var s = 0; for (var i = 1; i <= n; i++) s += Math.sin(2 * Math.PI * u * 2 * i) / i; return s * 0.5; }, TINTA, 2.2);
      nota(g, n + (n === 1 ? " componente" : " componentes sumados"), 10, 18, ACENTO); nota(g, "la suma se acerca al diente de sierra", 10, hh - 8);
    },
    cancelacion: function (g, w, hh, t) {
      var m = (Math.sin(t * 0.9) + 1) / 2; lamina(g, w, hh);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 3) * 0.5; }, GRIS, 1.5, [4, 4]);
      linea(g, w, hh, function (u) { return -Math.sin(2 * Math.PI * u * 3) * 0.5 * m; }, ACENTO, 1.5, [2, 3]);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 3) * 0.5 * (1 - m); }, TINTA, 2.4);
      nota(g, "x + (−x)·" + num(m, 2) + "  →  amplitud " + num(1 - m, 2), 10, 18, ACENTO);
    },
    retardo: function (g, w, hh, t) {
      var d = 0.06 + 0.05 * Math.sin(t * 0.8); lamina(g, w, hh);
      function x(u) { return Math.sin(2 * Math.PI * u * 3) * 0.35 + Math.sin(2 * Math.PI * u * 9) * 0.15; }
      linea(g, w, hh, x, GRIS, 1.5, [4, 4]); linea(g, w, hh, function (u) { return x(u - d); }, ACENTO, 1.5, [2, 3]);
      linea(g, w, hh, function (u) { return (x(u) + x(u - d)) * 0.7; }, TINTA, 2.4);
      nota(g, "x(t) + x(t − t₀): unas partes se refuerzan, otras se anulan", 10, 18, ACENTO);
    },
    multiplicacion: function (g, w, hh, t) {
      var fm = 1.5 + 1.2 * (Math.sin(t * 0.5) + 1); lamina(g, w, hh);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * fm) * 0.5; }, ACENTO, 1.5, [4, 4]);
      linea(g, w, hh, function (u) { return -Math.sin(2 * Math.PI * u * fm) * 0.5; }, ACENTO, 1, [2, 4]);
      linea(g, w, hh, function (u) { return Math.sin(2 * Math.PI * u * 36) * Math.sin(2 * Math.PI * u * fm) * 0.5; }, TINTA, 1.6);
      nota(g, "portadora × modulador: la envolvente es el modulador", 10, 18, ACENTO);
    }
  };

  // ---------- talleres: estado inicial, controles, vista previa y grafo
  var TALLERES = {
    escalado: {
      estado: { k: 1 }, ventanaMs: 20,
      vista: function (u, e) { return Math.sin(2 * Math.PI * u * 220 * 0.02) * 0.5 * e.k; },
      controles: function (caja, v) { App.rango(caja, { k: "k", etiqueta: "Constante k", min: 0, max: 2, paso: 0.01, valor: 1, fmt: function (x) { return num(x, 2) + " (" + AU.fmtdB(x) + " dB)"; } }, v); },
      construir: function (ctx, out) {
        var o = ctx.createOscillator(); o.frequency.value = 220; var g = ctx.createGain(); g.gain.value = 0;
        var base = ctx.createGain(); base.gain.value = 0.5; o.connect(base); base.connect(g); g.connect(out); o.start();
        return { aplicar: function (e) { AU.rampa(g.gain, e.k); }, stop: function () { o.stop(); [o, base, g].forEach(function (n) { n.disconnect(); }); } };
      }
    },
    suma: {
      estado: { h1: 1, h2: 0, h3: 0, h4: 0 }, ventanaMs: 25,
      vista: function (u, e) { var s = 0; for (var i = 1; i <= 4; i++) s += e["h" + i] * Math.sin(2 * Math.PI * u * 110 * i * 0.025) * 0.55 / i; return s; },
      controles: function (caja, v) {
        var fila = el("div", "interruptores"); var nombres = ["Fundamental · 110 Hz", "2.º armónico · 220 Hz", "3.º armónico · 330 Hz", "4.º armónico · 440 Hz"];
        nombres.forEach(function (n, i) {
          var b = el("button", "interruptor" + (i === 0 ? " on" : ""), n); b.type = "button"; b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
          b.addEventListener("click", function () { var on = b.classList.toggle("on"); b.setAttribute("aria-pressed", on ? "true" : "false"); v.set("h" + (i + 1), on ? 1 : 0); });
          fila.appendChild(b);
        });
        caja.appendChild(fila);
        var ref = el("button", "btn sec mini no-activa", "Escuchar el objetivo: diente de sierra 110 Hz"); ref.type = "button";
        ref.addEventListener("click", function () { AU.tono({ type: "sawtooth", freq: 110, amp: 0.35, dur: 1.4 }); });
        caja.appendChild(ref);
      },
      construir: function (ctx, out) {
        var bus = ctx.createGain(); bus.gain.value = 1; bus.connect(out); var oscs = [], gs = [];
        for (var i = 1; i <= 4; i++) { var o = ctx.createOscillator(); o.frequency.value = 110 * i; var g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(bus); o.start(); oscs.push(o); gs.push(g); }
        return { aplicar: function (e) { gs.forEach(function (g, i) { AU.rampa(g.gain, e["h" + (i + 1)] * 0.55 / (i + 1), 0.03); }); },
          stop: function () { oscs.forEach(function (o) { o.stop(); o.disconnect(); }); gs.forEach(function (g) { g.disconnect(); }); bus.disconnect(); } };
      }
    },
    cancelacion: {
      estado: { m: 0 }, ventanaMs: 25,
      vista: function (u, e) { return AU.ONDAS.sawtooth(u * 160 * 0.025) * 0.55 * (1 - e.m); },
      controles: function (caja, v) { App.rango(caja, { k: "m", etiqueta: "Mezcla de la copia invertida", min: 0, max: 1, paso: 0.01, valor: 0, fmt: function (x) { return x === 0 ? "0 · solo la original" : (x >= 0.99 ? "1 · cancelación total" : num(x, 2)); } }, v); },
      construir: function (ctx, out) {
        var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = 160;
        var d = ctx.createGain(); d.gain.value = 0.55; var inv = ctx.createGain(); inv.gain.value = 0; var bus = ctx.createGain();
        o.connect(d); o.connect(inv); d.connect(bus); inv.connect(bus); bus.connect(out); o.start();
        return { aplicar: function (e) { AU.rampa(inv.gain, -0.55 * e.m); }, stop: function () { o.stop(); [o, d, inv, bus].forEach(function (n) { n.disconnect(); }); } };
      }
    },
    retardo: {
      estado: { t: 5 }, ventanaMs: 20, disparo: false,
      controles: function (caja, v) { App.rango(caja, { k: "t", etiqueta: "Retardo t₀", min: 0, max: 300, paso: 1, valor: 5, fmt: function (x) { return x + " ms" + (x < 25 ? " · filtro peine" : (x < 60 ? " · engrosamiento" : " · eco")); } }, v); },
      construir: function (ctx, out) {
        var f = ctx.createBufferSource(); f.buffer = AU.ruido(); f.loop = true;
        var ent = ctx.createGain(); ent.gain.value = 0.35; var lin = ctx.createDelay(0.5); var bus = ctx.createGain();
        f.connect(ent); ent.connect(bus); ent.connect(lin); lin.connect(bus); bus.connect(out); f.start();
        return { aplicar: function (e) { AU.rampa(lin.delayTime, e.t / 1000, 0.03); }, stop: function () { f.stop(); [f, ent, lin, bus].forEach(function (n) { n.disconnect(); }); } };
      }
    },
    multiplicacion: {
      estado: { fm: 4 }, ventanaMs: function (e) { return e.fm < 20 ? 300 : 25; },
      vista: function (u, e) { var ms = e.fm < 20 ? 0.3 : 0.025; return Math.sin(2 * Math.PI * u * 440 * ms) * Math.sin(2 * Math.PI * u * e.fm * ms + 1.2) * 0.6; },
      controles: function (caja, v) { App.rango(caja, { k: "fm", etiqueta: "Frecuencia del modulador", min: 1, max: 500, paso: 1, valor: 4, fmt: function (x) { return x + " Hz" + (x < 20 ? " · trémolo" : " · modulación en anillo"); } }, v); },
      construir: function (ctx, out) {
        var p = ctx.createOscillator(); p.frequency.value = 440; var vca = ctx.createGain(); vca.gain.value = 0;
        var m = ctx.createOscillator(); var prof = ctx.createGain(); prof.gain.value = 0.6;
        m.connect(prof); prof.connect(vca.gain); p.connect(vca); vca.connect(out); p.start(); m.start();
        return { aplicar: function (e) { AU.rampa(m.frequency, e.fm, 0.02); }, stop: function () { p.stop(); m.stop(); [p, m, prof, vca].forEach(function (n) { n.disconnect(); }); } };
      }
    }
  };

  // ---------- introducción
  var intro = el("section", "pantalla");
  intro.appendChild(h('<header><span class="num">2.1</span><h2>De describir a modificar</h2></header>'));
  intro.appendChild(h('<div class="texto"><p>En NOVA 1 aprendiste a <strong>describir</strong> una señal. Aquí vas a <strong>modificarla</strong> con las cinco operaciones elementales y a escuchar el resultado de tu propia modificación. En cada operación haces siempre lo mismo:</p></div>'));
  intro.appendChild(h('<ol class="pasos-ciclo"><li><b>Predices</b><span>qué va a pasar. Los controles se desbloquean solo después de predecir.</span></li><li><b>Manipulas</b><span>la señal y la escuchas mientras ves la onda y el espectro.</span></li><li><b>Justificas</b><span>por qué pasó lo que pasó.</span></li></ol>'));
  intro.appendChild(h('<p class="texto">Cada predicción y cada justificación correctas valen 2 puntos: <strong>20 en total</strong>. Una respuesta equivocada no te bloquea, pero lee su explicación. <mark>Usa audífonos.</mark></p>'));
  var barra = el("div", "barra-pasos"); intro.appendChild(barra);
  var bInicio = el("button", "btn", "Empezar el banco de trabajo →"); bInicio.type = "button";
  var bt0 = el("div", "botones"); bt0.appendChild(bInicio); intro.appendChild(bt0);
  vista.appendChild(intro);
  var contMod = el("div", "vista-sub"); vista.appendChild(contMod);

  function pintarBarra(i) {
    barra.innerHTML = "";
    MODULOS.concat([{ corto: "Reto" }]).forEach(function (m, j) { barra.appendChild(el("div", "paso" + (j === i ? " activo" : (j < i ? " hecho" : "")), (j + 1) + " · " + m.corto)); });
  }
  function datos(q) { return { enunciado: q.enunciado, opciones: q.opciones.map(function (t, j) { return { texto: t, ok: j === q.correcta, fb: j === q.correcta ? q.ok : q.mal }; }) }; }

  function construirModulo(m, i) {
    var T = TALLERES[m.id];
    var s = el("section", "pantalla"); s.hidden = true; s.id = "n2-" + m.id;
    s.appendChild(h('<header><span class="num">Operación ' + (i + 1) + '/5</span><h2>' + m.titulo + '</h2></header>'));
    var dos = el("div", "dos");
    var tx = el("div", "texto"); tx.appendChild(h('<p class="formula grande">' + m.formula + '</p>')); tx.appendChild(h('<p>' + m.intro + '</p>'));
    tx.appendChild(h('<p class="en-daw"><span class="mono">En el DAW</span> ' + m.daw + '</p>'));
    dos.appendChild(tx);
    var fig = el("figure", "figura lamina"); var cv = document.createElement("canvas"); cv.className = "lienzo-anim claro"; cv.setAttribute("aria-hidden", "true"); fig.appendChild(cv);
    fig.appendChild(h('<figcaption class="mono">Fig. 2.' + (i + 2) + ' · Gris y naranja: entradas. Negro: resultado.</figcaption>')); dos.appendChild(fig);
    s.appendChild(dos);
    AU.animar(cv, ANIM[m.id]);

    var f1 = el("div", "fase"); f1.appendChild(h('<div class="titulo"><i>1</i> Predice</div>')); s.appendChild(f1);
    var f2 = el("div", "fase"); f2.appendChild(h('<div class="titulo"><i>2</i> Manipula y escucha</div>'));
    var aviso = h('<p class="aviso-bloqueo mono">Los controles se desbloquean cuando registres tu predicción.</p>'); f2.appendChild(aviso);
    f2.appendChild(el("p", "texto", m.taller));
    var cons = App.consola(f2, { titulo: "Banco · " + m.corto }); cons.raiz.classList.add("bloqueada"); cons.raiz.setAttribute("aria-disabled", "true");
    var vv = AU.vivo({
      raiz: cons.raiz, boton: cons.boton, onda: cons.onda, esp: cons.esp, estado: T.estado, ventanaMs: T.ventanaMs, disparo: T.disparo,
      vistaPrevia: T.vista, fMin: 40, fMax: m.id === "retardo" ? 12000 : 4000,
      construir: function (ctx, out, e) { return T.construir(ctx, out, e); }
    });
    T.controles(cons.controles, vv);
    s.appendChild(f2);
    var f3 = el("div", "fase"); f3.appendChild(h('<div class="titulo"><i>3</i> Justifica</div>')); f3.hidden = true; s.appendChild(f3);
    var pie = el("div", "ir"); var lbl = el("span", "estado-lms mono", "Banco: " + puntaje + "/20");
    var sig = el("button", "btn", i === MODULOS.length - 1 ? "Ir al reto integrador →" : "Siguiente operación →"); sig.type = "button"; sig.disabled = true;
    sig.addEventListener("click", function () { mostrar(i + 1); });
    pie.appendChild(lbl); pie.appendChild(sig); s.appendChild(pie);

    App.pregunta(f1, datos(m.prediccion), m.id + "_prediccion", function (bien) {
      if (bien) puntaje += 2; lbl.textContent = "Banco: " + puntaje + "/20";
      cons.raiz.classList.remove("bloqueada"); cons.raiz.removeAttribute("aria-disabled"); aviso.hidden = true;
      vv.reposo(); f3.hidden = false;
      App.pregunta(f3, datos(m.justificacion), m.id + "_justificacion", function (bien2) {
        if (bien2) puntaje += 2; lbl.textContent = "Banco: " + puntaje + "/20";
        sig.disabled = false;
      });
      f2.scrollIntoView({ behavior: AU.reduceMotion ? "auto" : "smooth", block: "start" });
    });
    s.addEventListener("ver", function () { lbl.textContent = "Banco: " + puntaje + "/20"; vv.reposo(); });
    return s;
  }

  // ---------- reto integrador
  function construirReto() {
    var s = el("section", "pantalla"); s.hidden = true; s.id = "n2-reto";
    s.appendChild(h('<header><span class="num">2.7</span><h2>Reto integrador: construye tu propio efecto</h2></header>'));
    s.appendChild(h('<div class="texto"><p>Todas las operaciones a la vez, en el orden de un canal real: fuente → escalado → copia invertida → retardo sumado → multiplicación. Combina al menos <strong>dos</strong> y describe abajo qué hiciste y qué operación hay detrás de cada control. No suma puntos: es el borrador de la tarea de producción de NOVA 3.</p></div>'));
    var cons = App.consola(s, { titulo: "Cadena libre" });
    var vr = AU.vivo({
      raiz: cons.raiz, boton: cons.boton, onda: cons.onda, esp: cons.esp, fMax: 8000,
      estado: { fuente: "sawtooth", k: 0.8, inv: 0, del: 0, mod: 0 },
      ventanaMs: function (e) { return e.mod > 0 && e.mod < 20 ? 300 : 30; }, disparo: true,
      construir: function (ctx, out, e0) {
        var src, stopSrc;
        if (e0.fuente === "ruido") { var b = ctx.createBufferSource(); b.buffer = AU.ruido(); b.loop = true; b.start(); src = b; stopSrc = function () { b.stop(); b.disconnect(); }; }
        else { var o = ctx.createOscillator(); o.type = e0.fuente; o.frequency.value = e0.fuente === "sine" ? 220 : 110; o.start(); src = o; stopSrc = function () { o.stop(); o.disconnect(); }; }
        var nivel = ctx.createGain(); nivel.gain.value = 0.5;
        var k = ctx.createGain(), inv = ctx.createGain(), bus1 = ctx.createGain(), del = ctx.createDelay(1), dg = ctx.createGain(), bus2 = ctx.createGain(), vca = ctx.createGain();
        var mod = ctx.createOscillator(), prof = ctx.createGain(); mod.connect(prof); prof.connect(vca.gain); mod.start();
        src.connect(nivel); nivel.connect(k); k.connect(bus1); k.connect(inv); inv.connect(bus1); bus1.connect(bus2); bus1.connect(del); del.connect(dg); dg.connect(bus2); bus2.connect(vca); vca.connect(out);
        return {
          fuente: e0.fuente,
          aplicar: function (e) {
            AU.rampa(k.gain, e.k); AU.rampa(inv.gain, -e.inv); AU.rampa(del.delayTime, e.del / 1000, 0.03); AU.rampa(dg.gain, e.del > 0 ? 0.8 : 0);
            AU.rampa(mod.frequency, Math.max(0.01, e.mod)); AU.rampa(prof.gain, e.mod > 0 ? 0.5 : 0); AU.rampa(vca.gain, e.mod > 0 ? 0.5 : 1);
          },
          stop: function () { stopSrc(); mod.stop(); [nivel, k, inv, bus1, del, dg, bus2, vca, mod, prof].forEach(function (n) { n.disconnect(); }); }
        };
      },
      alCambiar: function (e, clave) { if (clave === "fuente" && vr && vr.grafo) { var son = vr.audible; vr.desactivar(); vr.activar(); if (son) vr.sonar(true); } }
    });
    App.selector(cons.controles, { k: "fuente", etiqueta: "Fuente", valor: "sawtooth", opciones: [["sawtooth", "Diente de sierra 110 Hz"], ["sine", "Senoidal 220 Hz"], ["square", "Cuadrada 110 Hz"], ["ruido", "Ruido blanco"]] }, vr);
    App.rango(cons.controles, { k: "k", etiqueta: "Escalado k", min: 0, max: 1.5, paso: 0.01, valor: 0.8, fmt: function (x) { return num(x, 2); } }, vr);
    App.rango(cons.controles, { k: "inv", etiqueta: "Copia invertida", min: 0, max: 1, paso: 0.01, valor: 0, fmt: function (x) { return num(x, 2); } }, vr);
    App.rango(cons.controles, { k: "del", etiqueta: "Retardo sumado", min: 0, max: 400, paso: 1, valor: 0, fmt: function (x) { return x + " ms"; } }, vr);
    App.rango(cons.controles, { k: "mod", etiqueta: "Modulador", min: 0, max: 300, paso: 1, valor: 0, fmt: function (x) { return x === 0 ? "apagado" : x + " Hz" + (x < 20 ? " · trémolo" : " · anillo"); } }, vr);
    var ta = h('<label class="campo"><span>Describe tu efecto: qué controles usaste y qué operación hay detrás de cada uno.</span><textarea id="n2-reto-texto" rows="4"></textarea></label>');
    s.appendChild(ta);
    var area = ta.querySelector("textarea");
    try { area.value = localStorage.getItem("ova_g7_reto") || ""; } catch (e) { /* nada */ }
    area.addEventListener("input", function () { try { localStorage.setItem("ova_g7_reto", area.value); } catch (e) { /* nada */ } });
    var pie = el("div", "ir"); var lbl = el("span", "estado-lms mono", "");
    var fin = el("button", "btn", "Cerrar el banco y registrar el puntaje"); fin.type = "button";
    fin.addEventListener("click", function () { mostrar(MODULOS.length + 1); });
    pie.appendChild(lbl); pie.appendChild(fin); s.appendChild(pie);
    s.addEventListener("ver", function () { lbl.textContent = "Banco: " + puntaje + "/20"; vr.reposo(); });
    return s;
  }

  // ---------- cierre del banco
  var cierre = el("section", "pantalla"); cierre.hidden = true;
  cierre.appendChild(h('<header><span class="num">Resultado</span><h2>Banco completado</h2></header>'));
  var res = el("div", "resultado-act"); cierre.appendChild(res);
  cierre.appendChild(h('<div class="texto"><p>Ya sabes qué hace cada una de las cinco operaciones, cómo se ve y cómo suena. En NOVA 3 las vas a encontrar con otro nombre: <strong>ganancia, mezcla, polaridad, delay, flanger, trémolo</strong>.</p></div>'));
  var pieC = el("div", "ir"); var reh = el("button", "btn sec", "Volver a intentarlo"); reh.type = "button";
  reh.addEventListener("click", function () { location.reload(); });
  pieC.appendChild(reh); pieC.appendChild(h('<a class="btn" href="#nova3">NOVA 3 · Operaciones en el DAW →</a>')); cierre.appendChild(pieC);

  var secciones = MODULOS.map(construirModulo); secciones.push(construirReto()); secciones.push(cierre);
  secciones.forEach(function (s) { contMod.appendChild(s); });

  function mostrar(i) {
    AU.detenerTodo();
    intro.hidden = i >= 0;
    secciones.forEach(function (s, j) { s.hidden = j !== i; });
    if (i > MODULOS.length) {
      pintarBarra(MODULOS.length + 1);
      if (!cerrado) { cerrado = true; App.setScore("nova2", puntaje); }
      res.innerHTML = '<b class="grande">' + puntaje + '/20</b><span>' + (puntaje >= 12 ? "Reconociste el efecto de las operaciones y pudiste explicar por qué ocurre." : "Vale la pena repetirlo: varias justificaciones se te escaparon, y ahí está lo importante del módulo.") + (SCORM.hayLMS() ? " Resultado enviado al libro de calificaciones." : " Puntaje guardado en este navegador.") + '</span>';
    } else { pintarBarra(i); if (i >= 0) secciones[i].dispatchEvent(new Event("ver")); }
    window.scrollTo(0, vista.offsetTop - 70);
  }
  pintarBarra(-1);
  bInicio.addEventListener("click", function () { AU.contexto(); mostrar(0); });

  vista.appendChild(h('<div class="ir pie-nodo"><a class="btn sec" href="#ovi">← OVI</a><a class="btn sec" href="#nova3">Saltar a NOVA 3 →</a></div>'));
});
