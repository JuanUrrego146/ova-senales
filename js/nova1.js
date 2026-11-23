/* NOVA 1 · Reconocimiento de señales (actividad inicial, 10 puntos) */
App.registrar("nova1", function (vista) {
  "use strict";
  var el = App.el, h = App.h, num = AU.num;
  var NOMBRES = { sine: "Senoidal", square: "Cuadrada", triangle: "Triangular", sawtooth: "Diente de sierra" };

  function pantalla(numero, titulo) {
    var s = el("section", "pantalla");
    s.appendChild(h('<header><span class="num">' + numero + '</span><h2>' + titulo + '</h2></header>'));
    vista.appendChild(s); return s;
  }

  // ---------- 1.1 Qué es una señal
  var p1 = pantalla("1.1", "Antes de operar, hay que saber qué estamos operando");
  var dos1 = el("div", "dos");
  dos1.appendChild(h('<div class="texto"><p>Una <strong>señal de audio</strong> es una cantidad que cambia en el tiempo: la presión del aire frente a un micrófono, el voltaje en un cable, la lista de números que guarda un archivo WAV. En los tres casos es lo mismo: <mark>un valor para cada instante</mark>.</p><p>Cuando subes un fader, mezclas dos pistas o pones un delay, estás operando sobre esa lista de números. Para predecir qué va a pasar, primero necesitas describir la señal con cuatro parámetros: <strong>amplitud, frecuencia, periodo y fase</strong>.</p></div>'));
  var fig1 = el("figure", "figura lamina");
  var c11 = document.createElement("canvas"); c11.className = "lienzo-anim claro"; c11.setAttribute("role", "img"); c11.setAttribute("aria-label", "Animación: la misma onda como presión en el aire, voltaje en el cable y muestras en el archivo");
  fig1.appendChild(c11); fig1.appendChild(h('<figcaption class="mono">Fig. 1.1 · Presión → voltaje → muestras. La forma es la misma; cambia el soporte.</figcaption>'));
  dos1.appendChild(fig1); p1.appendChild(dos1);
  AU.animar(c11, function (g, w, hh, t) {
    var tinta = "#1A1A18", gris = "#8C887E", acento = "#E0561F", tercio = w / 3;
    g.fillStyle = "#FBFAF6"; g.fillRect(0, 0, w, hh);
    g.font = "500 10px 'JetBrains Mono', monospace"; g.fillStyle = gris;
    ["AIRE · PRESIÓN", "CABLE · VOLTAJE", "ARCHIVO · MUESTRAS"].forEach(function (s, i) { g.fillText(s, i * tercio + 10, 16); });
    g.strokeStyle = "#D9D6CC"; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(tercio, 24); g.lineTo(tercio, hh - 8); g.moveTo(2 * tercio, 24); g.lineTo(2 * tercio, hh - 8); g.stroke(); g.setLineDash([]);
    var fase = t * 1.2, mid = hh / 2 + 8, amp = hh / 2 - 26;
    function y(u) { return mid - amp * (0.72 * Math.sin(2 * Math.PI * (u * 2.5 - fase)) + 0.28 * Math.sin(2 * Math.PI * (u * 7.5 - fase * 3))); }
    for (var i = 0; i < 40; i++) { var u = i / 40, d = (mid - y(u)) / amp; g.fillStyle = "rgba(26,26,24," + (0.15 + 0.35 * (d + 1) / 2) + ")"; for (var k = 0; k < 6; k++) { g.fillRect(10 + u * (tercio - 20), 30 + k * (hh - 44) / 5, 1.5, 1.5 + 2 * (d + 1)); } }
    g.strokeStyle = tinta; g.lineWidth = 1.8; g.beginPath();
    for (var j = 0; j <= 140; j++) { var u2 = j / 140, px = tercio + 10 + u2 * (tercio - 20), py = y(u2); j ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke();
    g.strokeStyle = "#C9C5BA"; g.beginPath(); g.moveTo(2 * tercio + 8, mid); g.lineTo(w - 8, mid); g.stroke();
    for (var m = 0; m < 26; m++) { var u3 = m / 26, px2 = 2 * tercio + 10 + u3 * (tercio - 20), py2 = y(u3); g.strokeStyle = tinta; g.lineWidth = 1; g.beginPath(); g.moveTo(px2, mid); g.lineTo(px2, py2); g.stroke(); g.fillStyle = m % 6 === 0 ? acento : tinta; g.beginPath(); g.arc(px2, py2, 2.4, 0, 7); g.fill(); }
  });

  // ---------- 1.2 Explorador
  var p2 = pantalla("1.2", "Amplitud y frecuencia: explóralas con las manos");
  p2.appendChild(h('<div class="texto"><p>La <strong>amplitud</strong> es qué tan grande es la onda: se ve en la altura de los picos y se oye como nivel. La <strong>frecuencia</strong> es cuántos ciclos caben en un segundo: se ve en qué tan apretada está la onda y se oye como tono. Son independientes: puedes cambiar una sin tocar la otra.</p><p>Mueve <mark>un control a la vez</mark> y mira qué cambia y qué no en las dos pantallas. El osciloscopio muestra siempre 20 ms, así que más frecuencia significa más ciclos en pantalla.</p></div>'));
  var cons = App.consola(p2, { titulo: "Generador · NOVA 1" });
  var rF, rT, rA, rD;
  var v12 = AU.vivo({
    raiz: cons.raiz, boton: cons.boton, onda: cons.onda, esp: cons.esp, ventanaMs: 20, fMin: 40, fMax: 8000,
    estado: { tipo: "sine", f: 220, a: 0.6 },
    vistaPrevia: function (u, e) { return e.a * AU.ONDAS[e.tipo](u * e.f * 0.02); },
    construir: function (ctx, salida, e) {
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.connect(g); g.connect(salida); osc.start();
      return {
        aplicar: function (e2) { osc.type = e2.tipo; AU.rampa(osc.frequency, e2.f); AU.rampa(g.gain, e2.a); },
        stop: function () { osc.stop(); osc.disconnect(); g.disconnect(); }
      };
    },
    alCambiar: function (e) {
      if (!rF) return;
      rF.textContent = Math.round(e.f) + " Hz"; rT.textContent = num(1000 / e.f, 2) + " ms";
      rA.textContent = num(e.a, 2); rD.textContent = AU.fmtdB(e.a) + " dBFS";
    }
  });
  App.selector(cons.controles, { k: "tipo", etiqueta: "Forma de onda", valor: "sine", opciones: [["sine", "Senoidal"], ["square", "Cuadrada"], ["triangle", "Triangular"], ["sawtooth", "Diente de sierra"]] }, v12);
  App.rango(cons.controles, { k: "f", etiqueta: "Frecuencia", min: 55, max: 880, paso: 1, valor: 220, fmt: function (v) { return v + " Hz"; } }, v12);
  App.rango(cons.controles, { k: "a", etiqueta: "Amplitud", min: 0, max: 1, paso: 0.01, valor: 0.6, fmt: function (v) { return num(v, 2); } }, v12);
  rF = App.lectura(cons.lecturas, "Frecuencia f", "220 Hz"); rT = App.lectura(cons.lecturas, "Periodo T = 1/f", "4,55 ms");
  rA = App.lectura(cons.lecturas, "Amplitud A", "0,60"); rD = App.lectura(cons.lecturas, "Nivel 20·log₁₀ A", "−4,4 dBFS");
  v12.set("a", 0.6);
  p2.appendChild(h('<p class="nota glos">El valor en <a href="#ovi">dBFS</a> es la misma amplitud en la escala de los medidores del DAW. Lo explica <a href="#ovi">¿Qué es el decibel?</a>; puedes ir y volver sin perder tu avance.</p>'));

  // ---------- 1.3 Periodo y fase
  var p3 = pantalla("1.3", "Periodo y fase");
  var dos3 = el("div", "dos");
  dos3.appendChild(h('<div class="texto"><p>El <strong>periodo</strong> T es lo que dura un ciclo: a 220 Hz cada ciclo dura 1/220 s = 4,55 ms. La <strong>fase</strong> dice en qué punto del ciclo está la señal en un instante dado. Por sí sola no se oye; pero cuando hay <em>dos</em> señales, la diferencia de fase decide si al sumarse se refuerzan o se anulan.</p><p>Mueve el desfase y mira la suma (línea clara). A <mark>180°</mark> la segunda es la primera invertida y la suma da cero.</p></div>'));
  var cons3 = App.consola(dos3, { titulo: "Dos senoidales de 220 Hz", sinEspectro: true });
  var lienzo3 = cons3.onda;
  var rFase = App.lectura(cons3.lecturas, "Desfase", "0°"), rMs = App.lectura(cons3.lecturas, "Equivale a retrasar", "0,00 ms"), rSum = App.lectura(cons3.lecturas, "Amplitud de la suma", "2,00");
  var f3 = 220;
  function pintar3(e) {
    var ph = e.fase / 360;
    AU.dibujar(lienzo3, [
      { fn: function (u) { return Math.sin(2 * Math.PI * u * 3) * 0.5; }, color: AU.COLORES.traza, etiqueta: "x₁" },
      { fn: function (u) { return Math.sin(2 * Math.PI * (u * 3 - ph)) * 0.5; }, color: AU.COLORES.traza2, etiqueta: "x₂ desfasada" },
      { fn: function (u) { return (Math.sin(2 * Math.PI * u * 3) + Math.sin(2 * Math.PI * (u * 3 - ph))) * 0.5; }, color: AU.COLORES.traza3, ancho: 2.5, punteada: true, etiqueta: "x₁ + x₂" }
    ], { escala: 0.95 });
    rFase.textContent = Math.round(e.fase) + "°"; rMs.textContent = num(ph * 1000 / f3, 2) + " ms";
    rSum.textContent = num(2 * Math.abs(Math.cos(Math.PI * ph)), 2);
  }
  var v13 = AU.vivo({
    raiz: cons3.raiz, boton: cons3.boton, textoSonar: "Escuchar la suma", estado: { fase: 0 },
    construir: function (ctx, salida, e) {
      var o = ctx.createOscillator(); o.frequency.value = f3; var d = ctx.createDelay(0.02); var g = ctx.createGain(); g.gain.value = 0.4;
      o.connect(g); o.connect(d); d.connect(g); g.connect(salida); o.start();
      return { aplicar: function (e2) { AU.rampa(d.delayTime, e2.fase / 360 / f3, 0.01); }, stop: function () { o.stop(); o.disconnect(); d.disconnect(); g.disconnect(); } };
    },
    alCambiar: function (e) { pintar3(e); }
  });
  App.rango(cons3.controles, { k: "fase", etiqueta: "Desfase de x₂", min: 0, max: 360, paso: 1, valor: 0, fmt: function (v) { return v + "°"; } }, v13);
  p3.appendChild(dos3);
  requestAnimationFrame(function () { pintar3(v13.estado); });
  window.addEventListener("resize", function () { if (lienzo3.offsetParent) pintar3(v13.estado); });

  // ---------- 1.4 Formas de onda
  var p4 = pantalla("1.4", "Las cuatro formas de onda básicas");
  p4.appendChild(h('<div class="texto"><p>Misma frecuencia, misma amplitud, distinto <strong>timbre</strong>. Lo que cambia es la forma del ciclo, y eso equivale a qué <strong>armónicos</strong> (múltiplos de la fundamental) contiene la señal. Pulsa cada ficha para escucharla a 220 Hz.</p></div>'));
  var rej = el("div", "fichas");
  var DESC = { sine: "Un solo componente: la fundamental. El ladrillo con el que se construyen las demás.", square: "Solo armónicos impares (3.º, 5.º, 7.º…) con amplitud 1/n. Hueca, tipo clarinete.", triangle: "Armónicos impares con amplitud 1/n². Suave, con algo de brillo.", sawtooth: "Todos los armónicos con amplitud 1/n. Brillante: la base de los sintetizadores." };
  var lienzos4 = [];
  Object.keys(NOMBRES).forEach(function (tipo, i) {
    var b = el("button", "ficha"); b.type = "button";
    b.appendChild(h('<span class="ficha-n mono">' + String.fromCharCode(65 + i) + ' · ' + NOMBRES[tipo] + '</span>'));
    var cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true"); b.appendChild(cv); lienzos4.push([cv, tipo]);
    b.appendChild(h('<span class="ficha-d">' + DESC[tipo] + '</span>'));
    b.appendChild(h('<span class="ficha-play mono">▶ Escuchar · 220 Hz</span>'));
    b.addEventListener("click", function () { AU.detenerTodo(); AU.tono({ type: tipo, freq: 220, amp: tipo === "sine" ? 0.6 : 0.32, dur: 1.2 }); });
    rej.appendChild(b);
  });
  p4.appendChild(rej);
  function pintar4() { lienzos4.forEach(function (p) { if (p[0].offsetParent) AU.dibujar(p[0], { fn: function (u) { return AU.ONDAS[p[1]](u * 3) * 0.8; } }, { nx: 6, ny: 4 }); }); }
  requestAnimationFrame(pintar4); window.addEventListener("resize", pintar4);

  // ---------- 1.5 Actividad inicial
  var p5 = pantalla("1.5", "Actividad inicial: reconoce la onda y sus parámetros");
  p5.appendChild(h('<div class="texto"><p>Cinco preguntas, <strong>dos puntos</strong> cada una (10 en total). En algunas comparas dos sonidos; en otras lees una gráfica. Cada opción trae su explicación.</p></div>'));
  function parAB(a, b) {
    return function (cont) {
      var bt = el("div", "botones");
      var ba = el("button", "btn sec", "▶ Sonido A"), bb = el("button", "btn sec", "▶ Sonido B"); ba.type = bb.type = "button";
      ba.addEventListener("click", function () { AU.detenerTodo(); AU.tono(a); }); bb.addEventListener("click", function () { AU.detenerTodo(); AU.tono(b); });
      bt.appendChild(ba); bt.appendChild(bb); cont.appendChild(bt);
    };
  }
  function grafica(fn, pie) {
    return function (cont) {
      var fig = el("figure", "grafica-q"); var cv = document.createElement("canvas"); fig.appendChild(cv);
      if (pie) fig.appendChild(el("figcaption", "mono", pie));
      cont.appendChild(fig);
      var pintar = function () { if (cv.offsetParent) AU.dibujar(cv, fn); };
      requestAnimationFrame(pintar); window.addEventListener("resize", pintar);
    };
  }
  var preguntas = [
    { enunciado: "Escucha A y después B. ¿Qué parámetro cambió?", extra: parAB({ freq: 220, amp: 0.6 }, { freq: 220, amp: 0.2 }),
      opciones: [{ texto: "La amplitud: B suena más bajo, misma nota", ok: true, fb: "La frecuencia no se movió; solo la altura de la onda." }, { texto: "La frecuencia: B es más grave", fb: "Las dos están a 220 Hz; lo que bajó fue el nivel." }, { texto: "La forma de onda: B tiene otro timbre", fb: "Las dos son senoidales." }] },
    { enunciado: "Escucha A y después B. ¿Qué parámetro cambió?", extra: parAB({ freq: 220, amp: 0.5 }, { freq: 440, amp: 0.5 }),
      opciones: [{ texto: "La frecuencia: B es una octava más aguda (el doble de ciclos por segundo)", ok: true, fb: "220 → 440 Hz es exactamente una octava." }, { texto: "La amplitud: B suena más fuerte", fb: "Las dos tienen la misma amplitud; lo que cambia es el tono." }, { texto: "La fase: B arranca en otro punto del ciclo", fb: "La fase sola no se oye como un cambio de tono." }] },
    { enunciado: "Escucha A y después B. Misma nota, mismo nivel. ¿Qué cambió?", extra: parAB({ freq: 220, amp: 0.5, type: "sine" }, { freq: 220, amp: 0.3, type: "square" }),
      opciones: [{ texto: "La forma de onda: B tiene armónicos y por eso otro timbre", ok: true, fb: "B es una onda cuadrada: misma fundamental, más armónicos impares." }, { texto: "La frecuencia: B es más aguda", fb: "La fundamental es la misma; lo que se agregó son armónicos por encima." }, { texto: "Nada, son iguales", fb: "Escucha otra vez: B suena más áspera y hueca. Eso es timbre." }] },
    { enunciado: "Mira la gráfica. ¿Qué forma de onda es?", extra: grafica({ fn: function (u) { return AU.ONDAS.sawtooth(u * 3) * 0.8; } }),
      opciones: [{ texto: "Diente de sierra", ok: true, fb: "Sube de forma lineal y cae de golpe: contiene todos los armónicos." }, { texto: "Triangular", fb: "La triangular sube y baja con la misma pendiente, sin saltos." }, { texto: "Cuadrada", fb: "La cuadrada solo tiene dos valores y saltos entre ellos." }, { texto: "Senoidal", fb: "La senoidal es redondeada, sin esquinas." }] },
    { enunciado: "La pantalla mide 20 ms de ancho (2 ms por división) y un ciclo ocupa 9,09 ms. ¿Cuál es la frecuencia?", extra: grafica({ fn: function (u) { return Math.sin(2 * Math.PI * u * (20 / 9.09)) * 0.8; } }, "Ancho total: 20 ms · 2 ms/div"),
      opciones: [{ texto: "110 Hz, porque f = 1/T = 1/0,00909 s", ok: true, fb: "Periodo y frecuencia son inversos: 9,09 ms ↔ 110 Hz." }, { texto: "909 Hz", fb: "9,09 ms es el periodo, no la frecuencia. Hay que invertirlo." }, { texto: "220 Hz", fb: "220 Hz tendría un periodo de 4,55 ms, la mitad." }, { texto: "55 Hz", fb: "55 Hz tendría un periodo de 18,2 ms, el doble." }] }
  ];
  App.quiz(p5, preguntas, { id: "nova1", puntosPorPregunta: 2, alTerminar: function (c, n, pts) {
    App.setScore("nova1", pts);
    if (!p5.querySelector(".ir")) p5.appendChild(h('<div class="ir"><span class="estado-lms">NOVA 1 completado. Puntaje registrado.</span><a class="btn" href="#ovi">Siguiente: ¿Qué es el decibel? →</a></div>'));
  } });

  vista.appendChild(h('<div class="ir pie-nodo"><a class="btn sec" href="#inicio">← Inicio</a><a class="btn" href="#ovi">OVI · ¿Qué es el decibel? →</a></div>'));
});
