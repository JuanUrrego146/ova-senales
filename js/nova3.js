/* NOVA 3 · Operaciones con señales en el DAW · actividad evaluativa (10 puntos) */
App.registrar("nova3", function (vista) {
  "use strict";
  var el = App.el, h = App.h, num = AU.num;
  function pantalla(n, titulo) { var s = el("section", "pantalla"); s.appendChild(h('<header><span class="num">' + n + '</span><h2>' + titulo + '</h2></header>')); vista.appendChild(s); return s; }
  function g2(db) { return Math.pow(10, db / 20); }

  // ---------- 3.1 Equivalencias
  var p1 = pantalla("3.1", "Las mismas cinco, con otro nombre");
  p1.appendChild(h('<div class="texto"><p>Nada de lo que hiciste en NOVA 2 era un juguete: cada control del banco existe en cualquier DAW con otro nombre. Esta tabla es el mapa; la vas a necesitar en la evaluación.</p></div>'));
  var tw = el("div", "tabla-wrap");
  var tabla = h('<table class="tabla-eq"><thead><tr><th>Operación</th><th>Expresión</th><th>Herramienta del DAW</th><th>Ojo con…</th></tr></thead><tbody></tbody></table>');
  CONTENIDO.equivalencias.forEach(function (e, i) {
    tabla.querySelector("tbody").insertAdjacentHTML("beforeend", '<tr class="rev" style="animation-delay:' + (i * 0.12) + 's"><td><b>' + e.op + '</b></td><td><span class="k">' + e.formula + '</span></td><td>' + e.daw + '</td><td>' + e.ojo + '</td></tr>');
  });
  tw.appendChild(tabla); p1.appendChild(tw);

  // ---------- 3.2 Mesa de dos canales
  var p2 = pantalla("3.2", "Mezclar es sumar: una mesa de dos canales");
  p2.appendChild(h('<div class="texto"><p>Dos pistas, un bus máster y un medidor. Cada control es una operación: el <strong>fader</strong> escala, el botón <strong>Ø</strong> invierte, el envío a <strong>delay</strong> desplaza y suma, el <strong>trémolo</strong> multiplica y el <strong>bus</strong> suma las dos pistas.</p><p>Prueba esto: sube los dos faders a <mark>−3 dB</mark>. Ninguna pista llega al techo, pero el máster sí. Después pulsa Ø en una sola pista: la suma se vuelve una resta y los graves desaparecen.</p></div>'));
  var cons = App.consola(p2, { titulo: "Mesa · 2 canales + máster", sinEspectro: true, alto: 130 });
  var E = { A: -12, B: -12, invA: 0, invB: 0, muteA: 0, muteB: 0, sendA: 0, sendB: 0, trem: 0, delay: 180 };
  var daw = el("div", "daw"); cons.controles.replaceWith(daw);
  var med = h('<div class="medidor"><div><div class="escala"><div class="nivel"></div><div class="hold"></div></div><div class="marcas mono"><span>−48</span><span>−36</span><span>−24</span><span>−12</span><span>−6</span><span>0</span></div></div><div class="led mono">CLIP</div></div>');
  cons.extra.appendChild(med);
  var nivelD = med.querySelector(".nivel"), holdD = med.querySelector(".hold"), ledD = med.querySelector(".led");
  var rPk = App.lectura(cons.lecturas, "Pico del máster", "— dBFS"), rSum = App.lectura(cons.lecturas, "Suma de las pistas", "—"), rNota = App.lectura(cons.lecturas, "Lectura", "toca un control");
  var holdV = -100, holdT = 0, clipT = 0;
  function lecturaSuma(e) {
    var la = e.muteA ? 0 : g2(e.A), lb = e.muteB ? 0 : g2(e.B), mismo = e.invA === e.invB, s = mismo ? la + lb : Math.abs(la - lb);
    rSum.textContent = num(la, 2) + (mismo ? " + " : " − ") + num(lb, 2) + " = " + num(s, 2) + " (" + AU.fmtdB(s) + " dB)";
    return { s: s, mismo: mismo };
  }
  var vd = AU.vivo({
    raiz: cons.raiz, boton: cons.boton, onda: cons.onda, ventanaMs: function (e) { return e.trem ? 300 : 40; }, estado: E, textoSonar: "Encender monitor",
    vistaPrevia: function (u, e) { var r = lecturaSuma(e).s; return AU.ONDAS.sawtooth(u * 55 * 0.04) * r * 0.9; },
    construir: function (ctx, out) {
      var bus = ctx.createGain(), del = ctx.createDelay(1), dret = ctx.createGain(), fb = ctx.createGain();
      dret.gain.value = 0.7; fb.gain.value = 0.35; del.connect(dret); dret.connect(bus); del.connect(fb); fb.connect(del);
      // una sola fuente para las dos pistas: así se ve la cancelación exacta, como dos micrófonos sobre la misma caja
      var src = AU.fuenteRica(ctx, 55);
      function canal() { var pol = ctx.createGain(), g = ctx.createGain(), send = ctx.createGain(); src.nodo.connect(pol); pol.connect(g); g.connect(bus); g.connect(send); send.connect(del); return { pol: pol, g: g, send: send }; }
      var A = canal(), B = canal();
      var vca = ctx.createGain(), mod = ctx.createOscillator(), prof = ctx.createGain(); mod.connect(prof); prof.connect(vca.gain); mod.start();
      var pre = ctx.createAnalyser(); pre.fftSize = 2048;
      bus.connect(vca); vca.connect(pre); vca.connect(out);
      return {
        medir: pre,
        aplicar: function (e) {
          AU.rampa(A.pol.gain, e.invA ? -1 : 1, 0.005); AU.rampa(B.pol.gain, e.invB ? -1 : 1, 0.005);
          AU.rampa(A.g.gain, e.muteA ? 0 : g2(e.A)); AU.rampa(B.g.gain, e.muteB ? 0 : g2(e.B));
          AU.rampa(A.send.gain, e.sendA); AU.rampa(B.send.gain, e.sendB); AU.rampa(del.delayTime, e.delay / 1000, 0.03);
          AU.rampa(mod.frequency, Math.max(0.01, e.trem)); AU.rampa(prof.gain, e.trem ? 0.5 : 0); AU.rampa(vca.gain, e.trem ? 0.5 : 1);
        },
        stop: function () { src.stop(); mod.stop(); [A.pol, A.g, A.send, B.pol, B.g, B.send, bus, del, dret, fb, vca, mod, prof, pre].forEach(function (n) { n.disconnect(); }); }
      };
    },
    alCambiar: function (e) { var r = lecturaSuma(e); if (!vd || !vd.grafo) rNota.textContent = r.mismo ? "pulsa Encender monitor o toca un control" : "Ø activo en una pista: se restan"; },
    alMedir: function (db) {
      var ahora = performance.now();
      if (db >= holdV || ahora - holdT > 1200) { holdV = db; holdT = ahora; }
      if (db > -0.05) clipT = ahora;
      var clip = ahora - clipT < 600;
      nivelD.style.width = Math.max(0, Math.min(100, (db + 48) / 48 * 100)) + "%";
      holdD.style.left = Math.max(0, Math.min(100, (holdV + 48) / 48 * 100)) + "%";
      ledD.classList.toggle("on", clip);
      rPk.textContent = db <= -99 ? "— dBFS" : (db > 0.05 ? "+" : "") + num(db) + " dBFS"; rPk.className = clip ? "rojo" : "";
      var r = lecturaSuma(vd.estado);
      rNota.textContent = db <= -99 ? "toca un control" : (clip ? "la suma pasó el techo" : (!r.mismo && !vd.estado.muteA && !vd.estado.muteB ? "Ø activo: se restan" : (db > -6 ? "poco headroom" : "con headroom")));
      rNota.className = clip ? "rojo" : "";
    }
  });
  function canalUI(nombre, sub, k) {
    var p = el("div", "pista");
    p.appendChild(h('<div class="pista-cab"><h4>' + nombre + '</h4><small>' + sub + '</small></div>'));
    var id = App.uid("fader");
    var fader = h('<input class="fader" type="range" min="-48" max="6" step="0.5" value="-12" id="' + id + '" aria-label="Fader ' + nombre + '">');
    var val = el("output", "valor mono", "−12,0 dB");
    fader.addEventListener("input", function () { var v = parseFloat(fader.value); val.textContent = (v > 0 ? "+" : "") + num(v) + " dB"; vd.set(k, v); });
    var cuerpo = el("div", "pista-cuerpo");
    var escala = el("div", "escala-fader mono"); escala.setAttribute("aria-hidden", "true");
    [6, 0, -6, -12, -24, -48].forEach(function (db) { var sp = el("span", null, (db > 0 ? "+" : (db < 0 ? "−" : "")) + Math.abs(db)); sp.style.top = ((6 - db) / 54 * 100) + "%"; escala.appendChild(sp); });
    cuerpo.appendChild(escala); cuerpo.appendChild(fader); p.appendChild(cuerpo); p.appendChild(val);
    var bot = el("div", "botonera");
    var bInv = el("button", "tb", "Ø"); bInv.type = "button"; bInv.title = "Invertir polaridad"; bInv.setAttribute("aria-pressed", "false");
    bInv.addEventListener("click", function () { var on = bInv.classList.toggle("on"); bInv.setAttribute("aria-pressed", on); vd.set("inv" + k, on ? 1 : 0); });
    var bMute = el("button", "tb", "M"); bMute.type = "button"; bMute.title = "Silenciar pista"; bMute.setAttribute("aria-pressed", "false");
    bMute.addEventListener("click", function () { var on = bMute.classList.toggle("on"); bMute.setAttribute("aria-pressed", on); vd.set("mute" + k, on ? 1 : 0); });
    bot.appendChild(bInv); bot.appendChild(bMute); p.appendChild(bot);
    var envio = el("div", "envio"); App.rango(envio, { etiqueta: "Envío a delay", min: 0, max: 1, paso: 0.01, valor: 0, fmt: function (x) { return Math.round(x * 100) + " %"; } }, function (x) { vd.set("send" + k, x); });
    p.appendChild(envio);
    daw.appendChild(p);
  }
  canalUI("Pista 1", "Bajo · mic cerca", "A");
  canalUI("Pista 2", "Bajo · mic lejos", "B");
  var mas = el("div", "pista master");
  mas.appendChild(h('<div class="pista-cab"><h4>Máster</h4><small>bus = suma de las pistas</small></div>'));
  App.rango(mas, { etiqueta: "Trémolo", min: 0, max: 12, paso: 0.5, valor: 0, fmt: function (x) { return x ? num(x) + " Hz" : "apagado"; } }, function (x) { vd.set("trem", x); });
  App.rango(mas, { etiqueta: "Tiempo del delay", min: 1, max: 500, paso: 1, valor: 180, fmt: function (x) { return x + " ms"; } }, function (x) { vd.set("delay", x); });
  daw.appendChild(mas);

  // ---------- 3.3 Dos micrófonos
  var p3 = pantalla("3.3", "El problema de los dos micrófonos");
  p3.appendChild(h('<div class="texto"><p>Grabas una caja con un micrófono cerca y otro lejos. El segundo recibe el sonido <strong>unos milisegundos después</strong> (el sonido recorre 34 cm por milisegundo). Al sumar las dos pistas, esa diferencia es un desplazamiento en el tiempo y la suma produce un <strong>filtro peine</strong>: unas frecuencias se refuerzan y otras se cancelan. Si además una cápsula está invertida, se comen los graves.</p><p>Mueve la distancia y mira el espectro: los valles aparecen en <span class="formula">f = c / (2·d)</span> y sus múltiplos impares. Luego prueba Ø y Alinear.</p></div>'));
  var cons3 = App.consola(p3, { titulo: "Dos micrófonos sobre la misma fuente" });
  var M = { d: 30, inv: 0 };
  var rD = App.lectura(cons3.lecturas, "Distancia extra", "30 cm"), rT = App.lectura(cons3.lecturas, "Retardo", "0,87 ms"), rF = App.lectura(cons3.lecturas, "Primer valle", "572 Hz"), rPol = App.lectura(cons3.lecturas, "Polaridad mic 2", "normal");
  var v3 = AU.vivo({
    raiz: cons3.raiz, boton: cons3.boton, onda: cons3.onda, esp: cons3.esp, estado: M, ventanaMs: 30, fMin: 50, fMax: 6000,
    construir: function (ctx, out) {
      var f = AU.fuenteRica(ctx, 82); var n = ctx.createBufferSource(); n.buffer = AU.ruido(); n.loop = true; var ng = ctx.createGain(); ng.gain.value = 0.12; n.connect(ng); n.start();
      var src = ctx.createGain(); src.gain.value = 0.5; f.nodo.connect(src); ng.connect(src);
      var m1 = ctx.createGain(), del = ctx.createDelay(0.1), pol = ctx.createGain(), bus = ctx.createGain();
      src.connect(m1); m1.connect(bus); src.connect(del); del.connect(pol); pol.connect(bus); bus.connect(out);
      return { aplicar: function (e) { AU.rampa(del.delayTime, e.d / 34300, 0.02); AU.rampa(pol.gain, e.inv ? -1 : 1, 0.005); },
        stop: function () { f.stop(); n.stop(); [n, ng, src, m1, del, pol, bus].forEach(function (x) { x.disconnect(); }); } };
    },
    alCambiar: function (e) {
      if (!rD) return;
      var t = e.d / 34300; rD.textContent = e.d + " cm"; rT.textContent = num(t * 1000, 2) + " ms";
      rF.textContent = e.d === 0 ? (e.inv ? "todo se cancela" : "ninguno") : (e.inv ? "0 Hz y " + Math.round(34300 / e.d) + " Hz" : Math.round(34300 / (2 * e.d)) + " Hz");
      rPol.textContent = e.inv ? "invertida (Ø)" : "normal"; rPol.className = e.inv ? "rojo" : "";
    }
  });
  var sl3 = App.rango(cons3.controles, { k: "d", etiqueta: "Distancia extra del micrófono 2", min: 0, max: 120, paso: 1, valor: 30, fmt: function (x) { return x + " cm"; } }, v3);
  var bx = el("div", "botones");
  var bInv3 = el("button", "interruptor", "Ø micrófono 2"); bInv3.type = "button"; bInv3.setAttribute("aria-pressed", "false");
  bInv3.addEventListener("click", function () { var on = bInv3.classList.toggle("on"); bInv3.setAttribute("aria-pressed", on); v3.set("inv", on ? 1 : 0); });
  var bAli = el("button", "interruptor", "Alinear (d = 0)"); bAli.type = "button";
  bAli.addEventListener("click", function () { sl3.value = 0; sl3.dispatchEvent(new Event("input")); });
  bx.appendChild(bInv3); bx.appendChild(bAli); cons3.controles.appendChild(bx);
  App.quiz(p3, [{ enunciado: "Los graves de la caja desaparecen al mezclar los dos micrófonos. ¿Qué haces primero?", opciones: [
    { texto: "Invertir la polaridad (Ø) de uno de los dos y, si hace falta, alinear las pistas en el tiempo", ok: true, fb: "Atacas la causa: la suma de dos señales desfasadas." },
    { texto: "Subir los graves con un ecualizador", fb: "Subes lo que se está cancelando; la cancelación sigue ahí." },
    { texto: "Cambiar el micrófono porque está defectuoso", fb: "Cada pista suena bien sola; el problema aparece al sumar." }] }], { id: "nova3_mics", puntosPorPregunta: 0, mensaje: function () { return "Esto es lo que el foro de apertura preguntaba antes de la teoría."; } });

  // ---------- 3.4 Desarma esta cadena
  var p4 = pantalla("3.4", "Desarma esta cadena");
  p4.appendChild(h('<div class="texto"><p>La cadena de procesamiento de una sesión real. Para cada procesador elige la operación elemental que ejecuta. Es de práctica: no suma puntos, pero te prepara para la evaluación.</p></div>'));
  var lista = el("ol", "cadena"); var sels = [];
  CONTENIDO.cadena.forEach(function (c, i) {
    var id = App.uid("cad");
    var fila = h('<li class="eslabon"><label for="' + id + '">' + c.nombre + '</label></li>');
    var s = h('<select id="' + id + '"><option value="">— elige la operación —</option></select>');
    CONTENIDO.cadenaOpciones.forEach(function (o) { var op = document.createElement("option"); op.value = o.id; op.textContent = o.texto; s.appendChild(op); });
    fila.appendChild(s); lista.appendChild(fila); sels.push({ s: s, fila: fila, c: c });
  });
  p4.appendChild(lista);
  var bChk = el("button", "btn", "Comprobar"); bChk.type = "button"; var btc = el("div", "botones"); btc.appendChild(bChk); p4.appendChild(btc);
  var retro4 = el("div", "retro"); retro4.hidden = true; retro4.setAttribute("role", "status"); p4.appendChild(retro4);
  bChk.addEventListener("click", function () {
    var ok = 0; sels.forEach(function (x) { var bien = x.s.value === x.c.correcta; x.fila.classList.toggle("bien", bien); x.fila.classList.toggle("mal", !bien); if (bien) ok++; });
    retro4.hidden = false; retro4.className = "retro " + (ok === sels.length ? "ok" : "mal");
    retro4.innerHTML = ok === sels.length ? "<b>Las seis correctas.</b> El flanger es la trampa: un retardo que varía, sumado a la señal directa." : "<b>" + ok + " de 6.</b> Pistas: un trim es un escalado aunque reste; el flanger es desplazamiento más suma; el bus máster solo suma.";
    SCORM.registrarInteraccion(900, "nova3_cadena", "matching", String(ok), ok === sels.length);
  });

  // ---------- 3.5 Evaluación
  var p5 = pantalla("3.5", "Actividad evaluativa");
  p5.appendChild(h('<div class="texto"><p>Diez preguntas, <strong>un punto</strong> cada una. Cubren las cinco operaciones, su nombre en el DAW y el decibel. Puedes volver a la tabla de 3.1 o al glosario del OVI antes de responder, y reintentar: queda tu mejor nota.</p></div>'));
  App.quiz(p5, CONTENIDO.evaluacion, { id: "nova3_eval", puntosPorPregunta: 1, alTerminar: function (c, n, pts) {
    App.setScore("nova3", pts);
    if (!p5.querySelector(".ir")) p5.appendChild(h('<div class="ir"><span class="estado-lms">Evaluación registrada.</span><a class="btn" href="#cierre">Ver mi resultado →</a></div>'));
  } });

  // ---------- 3.6 Produce tu propio resultado
  var p6 = pantalla("3.6", "Produce tu propio resultado · tarea en el aula");
  p6.appendChild(h('<div class="texto"><p><strong>Consigna.</strong> En tu DAW, toma una grabación corta y produce un resultado sonoro usando <strong>al menos dos</strong> de las cinco operaciones. Exporta el antes y el después y entrega un texto de máximo 200 palabras: qué querías lograr, qué herramientas usaste, qué operación hay detrás de cada una y qué pasó con el nivel en dBFS. Se entrega en la actividad «Produce tu propio resultado» del aula (20 puntos) con esta rúbrica:</p></div>'));
  p6.appendChild(h('<div class="tabla-wrap"><table><thead><tr><th>Criterio</th><th>Puntos</th><th>Qué se mira</th></tr></thead><tbody><tr><td>Pertinencia de las operaciones</td><td class="mono">6</td><td>Las operaciones elegidas sirven a la intención declarada</td></tr><tr><td>Corrección técnica</td><td class="mono">5</td><td>Sin clipping no intencional, headroom razonable, exportación correcta</td></tr><tr><td>Justificación</td><td class="mono">6</td><td>Cada herramienta se nombra con su operación y se explica el efecto</td></tr><tr><td>Lectura del nivel</td><td class="mono">3</td><td>Se reportan los picos en dBFS del antes y el después</td></tr></tbody></table></div>'));
  p6.appendChild(h('<p class="nota">Si hiciste el reto integrador de NOVA 2, tu descripción ya es un borrador de esta justificación.</p>'));

  vista.appendChild(h('<div class="ir pie-nodo"><a class="btn sec" href="#nova2">← NOVA 2</a><a class="btn" href="#cierre">Cierre →</a></div>'));
});

/* Cierre del OVA */
var vistaCierre = function (vista) {
  "use strict";
  var el = App.el, h = App.h;
  function pintar() {
    var s = App.score(), m = vista.querySelector(".marcador"); m.innerHTML = "";
    [["NOVA 1 · Reconocimiento", "nova1"], ["NOVA 2 · Banco de trabajo", "nova2"], ["NOVA 3 · Evaluación", "nova3"]].filter(function (r) { return App.MAX[r[1]] !== undefined; }).forEach(function (r) {
      m.appendChild(h('<div><small>' + r[0] + '</small><b>' + (s[r[1]] === null ? "—" : s[r[1]]) + '<span>/' + App.MAX[r[1]] + '</span></b></div>'));
    });
    m.appendChild(h('<div class="total"><small>Total en el OVA</small><b>' + App.total() + '<span>/' + App.TOTAL + '</span></b></div>'));
    var faltan = Object.keys(s).filter(function (k) { return s[k] === null; });
    vista.querySelector("#cierre-msg").textContent = faltan.length
      ? "Te falta completar: " + faltan.map(function (k) { return k.toUpperCase().replace("NOVA", "NOVA "); }).join(", ") + ". Puedes volver desde la barra superior."
      : (App.total() >= App.TOTAL * 0.6 ? "Recorrido completo. Ya puedes explicar una decisión de producción en términos de la operación que la sustenta." : "Recorrido completo. Repite el banco de trabajo y la evaluación para afianzar lo que falló.");
  }
  var s = el("section", "pantalla");
  s.appendChild(h('<header><span class="num">Fin</span><h2>Tu resultado</h2></header>'));
  s.appendChild(el("div", "marcador")); s.appendChild(h('<p id="cierre-msg" class="texto"></p>'));
  s.appendChild(h('<p class="texto">' + (App.MODO === "banco" ? "Este paquete reporta los 20 puntos del banco de trabajo. El resto del OVA se califica en sus propias actividades del aula." : "Más el foro de apertura (10) y la tarea de producción (20), que se califican en el aula, el OVA suma 70 puntos.") + '</p>'));
  var bt = el("div", "ir");
  var bEnv = el("button", "btn", "Enviar resultado al aula y terminar"); bEnv.type = "button";
  var bRe = el("button", "btn sec", "Reiniciar todo el recorrido"); bRe.type = "button";
  bt.appendChild(bRe); bt.appendChild(bEnv); s.appendChild(bt);
  var est = el("p", "estado-lms"); est.setAttribute("role", "status"); s.appendChild(est);
  bEnv.addEventListener("click", function () { var lms = SCORM.hayLMS(); var ap = App.terminar(); est.textContent = lms ? ("Enviado. Estado: " + (ap ? "aprobado" : "completado") + ".") : "No hay aula conectada: el puntaje queda guardado en este navegador."; bEnv.disabled = true; });
  bRe.addEventListener("click", function () { if (bRe.dataset.c) App.reiniciar(); else { bRe.dataset.c = "1"; bRe.textContent = "Confirmar: borrar puntajes y reiniciar"; } });
  vista.appendChild(s);
  vista.appendChild(h('<div class="ir pie-nodo"><a class="btn sec" href="#inicio">← Inicio</a></div>'));
  pintar();
  vistaCierre.alMostrar = pintar;
};
App.registrar("cierre", vistaCierre);
