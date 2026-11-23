/* OVI · ¿Qué es el decibel? (objeto de información transversal, formativo) */
App.registrar("ovi", function (vista) {
  "use strict";
  var el = App.el, h = App.h, num = AU.num;
  function pantalla(n, titulo) { var s = el("section", "pantalla"); s.appendChild(h('<header><span class="num">' + n + '</span><h2>' + titulo + '</h2></header>')); vista.appendChild(s); return s; }

  // ---------- D.1 escalera lineal contra dB
  var d1 = pantalla("D.1", "¿Por qué el volumen está en números negativos?");
  var dos = el("div", "dos");
  dos.appendChild(h('<div class="texto"><p>Abres el DAW y el medidor marca <strong>−12</strong>. No es un error ni una señal «negativa»: el nivel está medido en <strong>decibeles a escala completa (dBFS)</strong>, donde el cero es el máximo posible y todo lo demás está por debajo.</p><p>¿Por qué no usar la amplitud directamente, de 0 a 1? Porque el oído no funciona así. Duplicar la amplitud no suena «el doble de fuerte», y el rango entre lo apenas audible y lo doloroso es de millones a uno.</p><p>Prueba la escalera: cada escalón <mark>duplica la amplitud</mark> (+6 dB). Escucha si los saltos se sienten parejos.</p></div>'));
  var esc = el("div", "escalera");
  esc.appendChild(h('<div class="escalera-cab mono"><span>Amplitud</span><span>Lineal (0 a 1)</span><span>En dBFS</span></div>'));
  [0.03125, 0.0625, 0.125, 0.25, 0.5, 1].forEach(function (a) {
    var f = el("div", "escalon");
    var b = el("button", "btn sec mini", "▶ " + num(a, a < 0.1 ? 3 : (a < 1 ? 2 : 0))); b.type = "button";
    b.addEventListener("click", function () { AU.detenerTodo(); AU.tono({ freq: 330, amp: a * 0.9, dur: 0.9 }); });
    var pct = (AU.dB(a) + 36) / 36 * 100;
    f.appendChild(b);
    f.appendChild(h('<div class="barra-h"><i style="width:' + (a * 100) + '%"></i></div>'));
    f.appendChild(h('<div class="barra-h db"><i style="width:' + pct + '%"></i><span class="mono">' + AU.fmtdB(a) + '</span></div>'));
    esc.appendChild(f);
  });
  esc.appendChild(h('<p class="pie mono">La barra lineal se aplasta hacia abajo; en dB los escalones son iguales, como se oyen.</p>'));
  dos.appendChild(esc); d1.appendChild(dos);

  // ---------- D.2 calculadora
  var d2 = pantalla("D.2", "El decibel es una relación, no una cantidad");
  var dos2 = el("div", "dos");
  dos2.appendChild(h('<div class="texto"><p>Un valor en decibeles siempre compara <strong>dos</strong> niveles:</p><p class="formula grande">dB = 20 · log₁₀ (A / A<sub>ref</sub>)</p><p>Si no sabes cuál es la referencia, el número no dice nada. En dBFS la referencia es el máximo del sistema (A<sub>ref</sub> = 1): por eso 0 dBFS es el techo y una amplitud de 0,5 está en −6 dBFS.</p><p>Reglas para memorizar: <mark>×2 = +6 dB</mark>, ×10 = +20 dB, ×0,5 = −6 dB. El fader que subes 6 dB está multiplicando por dos.</p></div>'));
  var calc = el("div", "consola clara");
  var ctr2 = el("div", "controles"); calc.appendChild(ctr2);
  var ro2 = el("div", "readout"); calc.appendChild(ro2);
  var rAmp = App.lectura(ro2, "Amplitud A", "0,500"), rdB = App.lectura(ro2, "20·log₁₀(A)", "−6,0 dBFS"), rPct = App.lectura(ro2, "Respecto al máximo", "50 %");
  var inA = App.rango(ctr2, { etiqueta: "Amplitud A (A_ref = 1)", min: 0.001, max: 1, paso: 0.001, valor: 0.5, fmt: function (v) { return num(v, 3); } }, function (v) {
    if (!rAmp) return; rAmp.textContent = num(v, 3); rdB.textContent = AU.fmtdB(v) + " dBFS"; rPct.textContent = num(v * 100, v < 0.1 ? 1 : 0) + " %";
  });
  var presets = el("div", "interruptores");
  [["−20 dB", 0.1], ["−12 dB", 0.251], ["−6 dB", 0.5], ["−3 dB", 0.708], ["0 dB", 1]].forEach(function (p) {
    var b = el("button", "interruptor", p[0]); b.type = "button";
    b.addEventListener("click", function () { inA.value = p[1]; inA.dispatchEvent(new Event("input")); });
    presets.appendChild(b);
  });
  calc.appendChild(presets);
  dos2.appendChild(calc); d2.appendChild(dos2);
  inA.dispatchEvent(new Event("input"));

  // ---------- D.3 dBFS vs dB SPL
  var d3 = pantalla("D.3", "dBFS y dB SPL no son lo mismo");
  var dos3 = el("div", "dos");
  dos3.appendChild(h('<div class="texto"><p><strong>dBFS</strong> vive dentro del computador: compara con el máximo representable, así que sus valores son negativos. <strong>dB SPL</strong> vive en el aire: compara con el umbral de audición, así que sus valores son positivos (una conversación anda por 60 dB SPL, un concierto por 100).</p><p>No hay correspondencia fija: el mismo archivo a −12 dBFS puede sonar a 50 o a 95 dB SPL. Lo decide la perilla del amplificador. Muévela.</p></div>'));
  var spl = el("div", "consola clara"); var ctr3 = el("div", "controles"); spl.appendChild(ctr3); var ro3 = el("div", "readout"); spl.appendChild(ro3);
  var rFile = App.lectura(ro3, "Archivo (no cambia)", "−12,0 dBFS"), rSPL = App.lectura(ro3, "En el salón (aprox.)", "72 dB SPL");
  App.rango(ctr3, { etiqueta: "Perilla del amplificador", min: 0, max: 100, paso: 1, valor: 50, fmt: function (v) { return v + " %"; } }, function (v) { if (rSPL) rSPL.textContent = Math.round(45 + v * 0.55) + " dB SPL"; });
  dos3.appendChild(spl); d3.appendChild(dos3);
  d3.appendChild(h('<div class="tabla-wrap"><table><thead><tr><th>Escala</th><th>Referencia (0 dB)</th><th>Valores típicos</th><th>Dónde la ves</th></tr></thead><tbody><tr><td><b>dBFS</b></td><td>Máximo representable del sistema digital</td><td>Negativos: −18 a −6 en pistas, −1 en másteres</td><td>Medidores del DAW, normalización</td></tr><tr><td><b>dB SPL</b></td><td>Umbral de audición (20 µPa)</td><td>Positivos: 30 silencio, 60 conversación, 100 concierto</td><td>Sonómetros, normas de salud auditiva</td></tr></tbody></table></div>'));

  // ---------- D.4 Medidor, headroom y clipping
  var d4 = pantalla("D.4", "El techo: 0 dBFS, headroom y clipping");
  d4.appendChild(h('<div class="texto"><p>Por encima de 0 dBFS no hay números para representar la señal: el sistema le <strong>corta los picos</strong>. Eso es el <strong>clipping</strong>, y no suena más fuerte, suena roto. La distancia que te queda hasta el techo es el <strong>headroom</strong>.</p><p>Sube la ganancia y mira el medidor. Cuando pase de cero, el LED se enciende y la onda se aplana arriba y abajo.</p></div>'));
  var cons4 = App.consola(d4, { titulo: "Canal con medidor de pico", sinEspectro: true });
  var med = h('<div class="medidor"><div><div class="escala"><div class="nivel"></div><div class="hold"></div></div><div class="marcas mono"><span>−48</span><span>−36</span><span>−24</span><span>−12</span><span>−6</span><span>0</span></div></div><div class="led mono">CLIP</div></div>');
  cons4.extra.appendChild(med);
  var nivel = med.querySelector(".nivel"), hold = med.querySelector(".hold"), led = med.querySelector(".led");
  var rPeak = App.lectura(cons4.lecturas, "Pico", "— dBFS"), rHead = App.lectura(cons4.lecturas, "Headroom", "—"), rEst = App.lectura(cons4.lecturas, "Estado", "en espera");
  var holdV = -100, holdT = 0, clipT = 0;
  function pintarMed(db) {
    var ahora = performance.now();
    if (db >= holdV || ahora - holdT > 1200) { holdV = db; holdT = ahora; }
    if (db > -0.05) clipT = ahora;
    var clip = ahora - clipT < 600;
    nivel.style.width = Math.max(0, Math.min(100, (db + 48) / 48 * 100)) + "%";
    hold.style.left = Math.max(0, Math.min(100, (holdV + 48) / 48 * 100)) + "%";
    led.classList.toggle("on", clip);
    rPeak.textContent = (db <= -99 ? "−∞" : (db > 0.05 ? "+" : "") + num(db)) + " dBFS"; rPeak.className = clip ? "rojo" : "";
    rHead.textContent = clip ? "0 dB · recortando" : (db <= -99 ? "—" : num(-db) + " dB");
    rEst.textContent = db <= -99 ? "en espera" : (clip ? "CLIPPING" : (db > -6 ? "cerca del techo" : (db > -18 ? "zona cómoda" : "bajo")));
    rEst.className = clip ? "rojo" : "";
  }
  var v4 = AU.vivo({
    raiz: cons4.raiz, boton: cons4.boton, onda: cons4.onda, ventanaMs: 25, estado: { g: -12 },
    vistaPrevia: function (u, e) { var x = AU.ONDAS.sawtooth(u * 110 * 0.025) * 0.8 * Math.pow(10, e.g / 20); return Math.max(-1, Math.min(1, x)); },
    construir: function (ctx, salida) {
      var f = AU.fuenteRica(ctx, 110);
      var norm = ctx.createGain(); norm.gain.value = 1;          // la fuente pica cerca de 1
      var g = ctx.createGain();
      var pre = ctx.createAnalyser(); pre.fftSize = 2048;          // medidor antes del recorte
      var clip = ctx.createWaveShaper(); var curva = new Float32Array(2049);
      for (var i = 0; i < 2049; i++) { var x = (i / 1024 - 1) * 4; curva[i] = Math.max(-1, Math.min(1, x)); }
      clip.curve = curva;
      var antes = ctx.createGain(); antes.gain.value = 0.25;       // el waveshaper ve ±4 → escala para el recorte en ±1
      var despues = ctx.createGain(); despues.gain.value = 1;
      f.nodo.connect(norm); norm.connect(g); g.connect(pre); g.connect(antes); antes.connect(clip); clip.connect(despues); despues.connect(salida);
      return {
        medir: pre,
        aplicar: function (e) { AU.rampa(g.gain, 0.8 * Math.pow(10, e.g / 20)); },
        stop: function () { f.stop(); [norm, g, pre, antes, clip, despues].forEach(function (n) { n.disconnect(); }); }
      };
    },
    alMedir: pintarMed
  });
  App.rango(cons4.controles, { k: "g", etiqueta: "Ganancia aplicada", min: -24, max: 12, paso: 0.5, valor: -12, fmt: function (v) { return (v > 0 ? "+" : "") + num(v) + " dB"; } }, v4);
  pintarMed(-100);

  // ---------- D.5 Glosario
  var d5 = pantalla("D.5", "Consulta rápida: glosario del decibel");
  d5.appendChild(h('<div class="texto"><p>Siete términos que vas a ver en NOVA 2 y NOVA 3. Vuelve aquí cuando los encuentres.</p></div>'));
  var gl = el("div", "glosario");
  CONTENIDO.glosario.forEach(function (g) { gl.appendChild(h('<details><summary>' + g.concepto + '</summary><div class="def">' + g.definicion + '</div></details>')); });
  d5.appendChild(gl);

  // ---------- comprobación formativa
  var d6 = pantalla("✓", "Comprobación rápida (no suma puntos)");
  App.quiz(d6, [
    { enunciado: "El medidor de tu pista marca −14 dBFS. ¿Qué significa?", opciones: [
      { texto: "Que la señal está 14 dB por debajo del máximo representable: tiene 14 dB de headroom", ok: true, fb: "Negativo no es error: es distancia al techo." },
      { texto: "Que la señal está invertida", fb: "El signo del nivel en dB no tiene que ver con la polaridad de la onda." },
      { texto: "Que hay un error de grabación", fb: "Todos los niveles de trabajo en dBFS son negativos." }] },
    { enunciado: "Subes una pista de −12 dBFS a −6 dBFS. ¿Por cuánto multiplicaste su amplitud?", opciones: [
      { texto: "Por 2 (+6 dB ≈ el doble de amplitud)", ok: true, fb: "Y ojo: el doble de amplitud no es el doble de sonoridad; para eso hacen falta unos +10 dB." },
      { texto: "Por 6", fb: "6 es la diferencia en dB, no el factor. 20·log₁₀(2) ≈ 6." },
      { texto: "Por 0,5", fb: "Multiplicar por 0,5 bajaría 6 dB, y la pista subió." }] }
  ], { id: "ovi", puntosPorPregunta: 0, mensaje: function (c, n) { return c === n ? "Listo: ya puedes leer un medidor." : "Vuelve al glosario y repasa dBFS y escala logarítmica."; } });

  vista.appendChild(h('<div class="ir pie-nodo"><a class="btn sec" href="#nova1">← NOVA 1</a><a class="btn" href="#nova2">NOVA 2 · Síntesis de señales →</a></div>'));
});
