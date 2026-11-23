/* Motor de audio y visualización del OVA · Web Audio API + Canvas.
   Idea central: cada consola es un "Vivo". En cuanto el estudiante toca un control, la consola se
   activa y su grafo de audio corre en silencio hacia el osciloscopio: la onda responde siempre al
   control, suene o no. El botón Escuchar solo abre el monitor. Una sola consola viva a la vez. */
var AU = (function () {
  "use strict";
  var ctx = null, master = null, ruido = null, activo = null, raf = 0;
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var C = { fondo: "#151513", reticula: "#2B2A26", eje: "#45433C", traza: "#F2B33D", traza2: "#8FA7C9", traza3: "#E9E4D8", texto: "#9B978C", rojo: "#FF5A3C" };

  function contexto() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.25;   // volumen seguro para audífonos
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function bufRuido() {
    contexto();
    if (!ruido) {
      var n = ctx.sampleRate * 2; ruido = ctx.createBuffer(1, n, ctx.sampleRate);
      var d = ruido.getChannelData(0), s = 1234567;
      for (var i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    }
    return ruido;
  }
  function rampa(param, v, t) { if (!param) return; param.cancelScheduledValues(ctx.currentTime); param.setTargetAtTime(v, ctx.currentTime, t || 0.015); }
  function dB(a) { return a <= 0 ? -Infinity : 20 * Math.log10(a); }
  function num(v, d) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(d === undefined ? 1 : d).replace(".", ","); }
  function fmtdB(a) { var v = dB(a); return v === -Infinity ? "−∞" : (v > 0.05 ? "+" : "") + num(v); }

  // ---------------------------------------------------------------- lienzos
  function ajustar(c) {
    var r = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth || 300, h = c.clientHeight || 150;
    if (c.width !== Math.round(w * r) || c.height !== Math.round(h * r)) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
    var g = c.getContext("2d"); g.setTransform(r, 0, 0, r, 0, 0);
    return { g: g, w: w, h: h };
  }
  // retícula de osciloscopio: 10 × 8 divisiones con marcas en los ejes centrales
  function reticula(g, w, h, opts) {
    opts = opts || {};
    g.fillStyle = C.fondo; g.fillRect(0, 0, w, h);
    g.strokeStyle = C.reticula; g.lineWidth = 1; g.beginPath();
    var nx = opts.nx || 10, ny = opts.ny || 8;
    for (var i = 1; i < nx; i++) { var x = Math.round(i * w / nx) + .5; g.moveTo(x, 0); g.lineTo(x, h); }
    for (var j = 1; j < ny; j++) { var y = Math.round(j * h / ny) + .5; g.moveTo(0, y); g.lineTo(w, y); }
    g.stroke();
    if (!opts.sinEjes) {
      g.strokeStyle = C.eje; g.beginPath();
      var cy = Math.round(h / 2) + .5, cx = Math.round(w / 2) + .5;
      g.moveTo(0, cy); g.lineTo(w, cy); g.moveTo(cx, 0); g.lineTo(cx, h);
      for (var k = 0; k <= nx * 5; k++) { var xx = Math.round(k * w / (nx * 5)) + .5; g.moveTo(xx, cy - 3); g.lineTo(xx, cy + 3); }
      for (var m = 0; m <= ny * 5; m++) { var yy = Math.round(m * h / (ny * 5)) + .5; g.moveTo(cx - 3, yy); g.lineTo(cx + 3, yy); }
      g.stroke();
    }
  }
  function traza(g, color, ancho) { g.strokeStyle = color; g.lineWidth = ancho || 2; g.lineJoin = "round"; g.shadowColor = color; g.shadowBlur = 6; g.stroke(); g.shadowBlur = 0; }
  function rotulo(g, txt, x, y, color, alin) { g.font = "500 11px 'JetBrains Mono', ui-monospace, monospace"; g.fillStyle = color || C.texto; g.textAlign = alin || "left"; g.fillText(txt, x, y); g.textAlign = "left"; }

  // dibujo analítico: curvas = [{fn(u)->[-1,1], color, ancho, punteada}]
  function dibujar(c, curvas, opts) {
    opts = opts || {};
    var A = ajustar(c), g = A.g, w = A.w, h = A.h;
    reticula(g, w, h, opts);
    (Array.isArray(curvas) ? curvas : [curvas]).forEach(function (cv, idx) {
      var fn = cv.fn || cv, N = Math.max(200, Math.round(w));
      g.beginPath(); if (cv.punteada) g.setLineDash([6, 5]);
      for (var i = 0; i <= N; i++) {
        var u = i / N, y = Math.max(-1.12, Math.min(1.12, fn(u)));
        var px = u * w, py = h / 2 - y * (h / 2 - 8) * (opts.escala || 0.86);
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      traza(g, cv.color || [C.traza, C.traza2, C.traza3][idx % 3], cv.ancho || 2); g.setLineDash([]);
      if (cv.etiqueta) rotulo(g, cv.etiqueta, 10, 18 + idx * 15, cv.color || C.traza);
    });
    return A;
  }

  // animación genérica sobre un canvas (se pausa fuera de pantalla)
  function animar(c, draw, opts) {
    opts = opts || {};
    var vivo = true, visible = true, t0 = performance.now();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && vivo) requestAnimationFrame(paso); }).observe(c);
    function paso() {
      if (!vivo || !visible || c.offsetParent === null) { if (vivo && c.offsetParent === null) setTimeout(paso, 400); return; }
      var A = ajustar(c), t = reduceMotion ? (opts.tQuieto || 2.5) : (performance.now() - t0) / 1000;
      A.g.clearRect(0, 0, A.w, A.h); draw(A.g, A.w, A.h, t);
      if (!reduceMotion) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
    return { stop: function () { vivo = false; } };
  }
  function trazoFn(g, w, h, fn, color, ancho, escala) {
    g.beginPath();
    for (var i = 0; i <= 300; i++) { var u = i / 300, px = u * w, py = h / 2 - fn(u) * (h / 2 - 8) * (escala || 0.8); i ? g.lineTo(px, py) : g.moveTo(px, py); }
    traza(g, color, ancho);
  }

  // ---------------------------------------------------------------- consola viva
  function Vivo(o) {
    this.o = o; this.estado = {}; for (var k in (o.estado || {})) this.estado[k] = o.estado[k];
    this.grafo = null; this.audible = false; this.an = null; this.mon = null;
    this.tbuf = null; this.fbuf = null; this.mbuf = null;
    var self = this;
    if (o.raiz) {
      o.raiz.addEventListener("pointerdown", function (e) { if (e.target.closest(".no-activa")) return; self.activar(); });
      o.raiz.addEventListener("keydown", function (e) { if (e.target.matches("input,select,button")) self.activar(); });
    }
    if (o.boton) {
      o.boton.addEventListener("click", function () { self.sonar(!self.audible); });
      this.pintarBoton();
    }
    requestAnimationFrame(function () { self.reposo(); });
    window.addEventListener("resize", function () { if (activo !== self) self.reposo(); });
  }
  Vivo.prototype.set = function (k, v) {
    this.estado[k] = v;
    if (this.grafo && this.grafo.aplicar) this.grafo.aplicar(this.estado, k);
    if (this.o.alCambiar) this.o.alCambiar(this.estado, k);
    if (activo !== this) this.reposo();
  };
  Vivo.prototype.activar = function () {
    if (activo === this && this.grafo) return;
    if (activo && activo !== this) activo.desactivar();
    contexto();
    this.an = ctx.createAnalyser(); this.an.fftSize = 16384; this.an.smoothingTimeConstant = 0.78;
    this.an.minDecibels = -100; this.an.maxDecibels = -10;
    this.mon = ctx.createGain(); this.mon.gain.value = this.audible ? 1 : 0;
    this.grafo = this.o.construir(ctx, this.an, this.estado) || {};
    if (this.grafo.aplicar) this.grafo.aplicar(this.estado, null);
    this.an.connect(this.mon); this.mon.connect(master);
    this.tbuf = new Float32Array(this.an.fftSize); this.fbuf = new Float32Array(this.an.frequencyBinCount);
    if (this.grafo.medir) this.mbuf = new Float32Array(this.grafo.medir.fftSize);
    if (this.o.raiz) this.o.raiz.classList.add("en-vivo");
    activo = this;
    if (!raf) raf = requestAnimationFrame(bucle);
  };
  Vivo.prototype.desactivar = function () {
    try { if (this.grafo && this.grafo.stop) this.grafo.stop(); } catch (e) { /* ya detenido */ }
    try { this.an.disconnect(); this.mon.disconnect(); } catch (e) { /* nada */ }
    this.grafo = null; this.audible = false; this.pintarBoton();
    if (this.o.raiz) this.o.raiz.classList.remove("en-vivo");
    if (activo === this) activo = null;
    if (this.o.alMedir) this.o.alMedir(-100, -100);
    this.reposo();
  };
  Vivo.prototype.sonar = function (on) {
    this.activar(); this.audible = on;
    rampa(this.mon.gain, on ? 1 : 0, 0.02);
    this.pintarBoton();
  };
  Vivo.prototype.pintarBoton = function () {
    var b = this.o.boton; if (!b) return;
    b.classList.toggle("sonando", this.audible);
    b.setAttribute("aria-pressed", this.audible ? "true" : "false");
    b.querySelector(".lbl").textContent = this.audible ? (this.o.textoParar || "Silenciar") : (this.o.textoSonar || "Escuchar");
  };
  // dibujo cuando la consola no está viva: retícula, vista previa analítica (si hay) y aviso
  Vivo.prototype.reposo = function () {
    var o = this.o;
    if (o.onda && o.onda.offsetParent !== null) {
      var A = ajustar(o.onda);
      reticula(A.g, A.w, A.h);
      if (o.vistaPrevia) {
        var e = this.estado, N = Math.round(A.w);
        A.g.beginPath();
        for (var i = 0; i <= N; i++) { var u = i / N, y = Math.max(-1.1, Math.min(1.1, o.vistaPrevia(u, e))); var py = A.h / 2 - y * (A.h / 2 - 8) * 0.86; i ? A.g.lineTo(u * A.w, py) : A.g.moveTo(u * A.w, py); }
        A.g.globalAlpha = 0.55; traza(A.g, C.traza, 2); A.g.globalAlpha = 1;
      }
      rotulo(A.g, o.vistaPrevia ? "VISTA PREVIA · toca un control para medir en vivo" : "Toca un control o pulsa Escuchar", 10, A.h - 10);
    }
    if (o.esp && o.esp.offsetParent !== null) {
      var B = ajustar(o.esp); reticula(B.g, B.w, B.h, { sinEjes: true }); ejeFrecuencia(B.g, B.w, B.h, o);
    }
  };
  Vivo.prototype.pintar = function () {
    var o = this.o, sr = ctx.sampleRate;
    if (o.onda && o.onda.offsetParent !== null) {
      this.an.getFloatTimeDomainData(this.tbuf);
      var A = ajustar(o.onda), g = A.g, w = A.w, h = A.h, d = this.tbuf, N = d.length;
      reticula(g, w, h);
      var ms = typeof o.ventanaMs === "function" ? o.ventanaMs(this.estado) : (o.ventanaMs || 20);
      var W = Math.min(N - 2, Math.round(ms / 1000 * sr)), ini = N - W - 1;
      // disparo: último cruce por cero ascendente antes de la ventana final (imagen estable)
      if (o.disparo !== false) {
        var desde = Math.max(1, N - W - Math.round(sr / 30));
        for (var j = N - W - 1; j > desde; j--) { if (d[j - 1] < 0 && d[j] >= 0) { ini = j; break; } }
      }
      var esc = o.escalaOnda || 1, paso = Math.max(1, Math.floor(W / (w * 2)));
      g.beginPath();
      for (var s = 0; s <= W; s += paso) {
        var v = d[ini + s] * esc, px = s / W * w, py = h / 2 - Math.max(-1.15, Math.min(1.15, v)) * (h / 2 - 8) * 0.86;
        s ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      traza(g, o.color || C.traza, 2);
      rotulo(g, (ms >= 100 ? Math.round(ms) : num(ms / 10, 1)) + (ms >= 100 ? " ms en pantalla" : " ms/div"), 10, h - 10);
      rotulo(g, "● EN VIVO", w - 10, 18, this.audible ? C.rojo : C.texto, "right");
    }
    if (o.esp && o.esp.offsetParent !== null) {
      this.an.getFloatFrequencyData(this.fbuf);
      var B = ajustar(o.esp), gb = B.g, wb = B.w, hb = B.h, f = this.fbuf, fmin = o.fMin || 40, fmax = o.fMax || 4000;
      reticula(gb, wb, hb, { sinEjes: true });
      var binHz = sr / this.an.fftSize, lmin = Math.log10(fmin), lmax = Math.log10(fmax);
      gb.beginPath(); gb.moveTo(0, hb);
      for (var x = 0; x <= wb; x++) {
        var hz0 = Math.pow(10, lmin + (lmax - lmin) * x / wb), hz1 = Math.pow(10, lmin + (lmax - lmin) * (x + 1) / wb);
        var b0 = Math.max(1, Math.floor(hz0 / binHz)), b1 = Math.max(b0, Math.floor(hz1 / binHz)), m = -140;
        for (var b = b0; b <= b1 && b < f.length; b++) if (f[b] > m) m = f[b];
        var yv = hb - Math.max(0, Math.min(1, (m + 100) / 90)) * (hb - 14);
        gb.lineTo(x, yv);
      }
      gb.lineTo(wb, hb); gb.closePath();
      var gr = gb.createLinearGradient(0, 0, 0, hb); gr.addColorStop(0, "rgba(143,167,201,.55)"); gr.addColorStop(1, "rgba(143,167,201,.05)");
      gb.fillStyle = gr; gb.fill(); gb.strokeStyle = C.traza2; gb.lineWidth = 1.5; gb.stroke();
      ejeFrecuencia(gb, wb, hb, o);
    }
    if (o.alMedir) {
      var srcA = this.grafo.medir || this.an, buf = this.grafo.medir ? this.mbuf : this.tbuf;
      if (this.grafo.medir) srcA.getFloatTimeDomainData(buf);
      var p = 0, n0 = buf.length - Math.round(sr * 0.05);
      for (var q = Math.max(0, n0); q < buf.length; q++) { var a = Math.abs(buf[q]); if (a > p) p = a; }
      o.alMedir(p > 0 ? 20 * Math.log10(p) : -100);
    }
    if (o.alPintar) o.alPintar(this);
  };
  function ejeFrecuencia(g, w, h, o) {
    var fmin = o.fMin || 40, fmax = o.fMax || 4000, lmin = Math.log10(fmin), lmax = Math.log10(fmax);
    [50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(function (hz) {
      if (hz < fmin || hz > fmax) return;
      var x = (Math.log10(hz) - lmin) / (lmax - lmin) * w;
      g.strokeStyle = C.eje; g.beginPath(); g.moveTo(Math.round(x) + .5, 0); g.lineTo(Math.round(x) + .5, h); g.stroke();
      rotulo(g, hz >= 1000 ? (hz / 1000) + "k" : String(hz), x + 3, h - 6);
    });
    rotulo(g, "Hz", w - 8, h - 6, C.texto, "right");
  }
  function bucle() {
    if (!activo) { raf = 0; return; }
    try { activo.pintar(); } catch (e) { /* un fotograma perdido no detiene la consola */ }
    raf = requestAnimationFrame(bucle);
  }
  function vivo(o) { return new Vivo(o); }
  function detenerTodo() { if (activo) activo.desactivar(); }

  // tono corto con envolvente (pares A/B de las preguntas, fichas de formas de onda)
  function tono(o) {
    contexto(); o = o || {};
    var osc = ctx.createOscillator(); osc.type = o.type || "sine"; osc.frequency.value = o.freq || 220;
    var g = ctx.createGain(); g.gain.value = 0; osc.connect(g); g.connect(master);
    var t = ctx.currentTime, amp = o.amp === undefined ? 0.6 : o.amp, dur = o.dur || 1.0;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.015);
    g.gain.setValueAtTime(amp, t + dur - 0.06); g.gain.linearRampToValueAtTime(0, t + dur);
    osc.start(t); osc.stop(t + dur + 0.05); osc.onended = function () { osc.disconnect(); g.disconnect(); };
    return osc;
  }
  // fuente rica en armónicos: diente de sierra + pasa bajos suave
  function fuenteRica(c, freq) {
    var o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = freq || 110;
    var f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3500; f.Q.value = 0.5;
    o.connect(f); o.start();
    return { nodo: f, osc: o, stop: function () { o.stop(); o.disconnect(); f.disconnect(); } };
  }
  var ONDAS = {
    sine: function (p) { return Math.sin(2 * Math.PI * p); },
    square: function (p) { return ((p % 1) + 1) % 1 < 0.5 ? 1 : -1; },
    triangle: function (p) { var x = ((p % 1) + 1) % 1; return x < 0.5 ? 4 * x - 1 : 3 - 4 * x; },
    sawtooth: function (p) { var x = ((p % 1) + 1) % 1; return 2 * x - 1; }
  };

  return {
    contexto: contexto, master: function () { return master; }, ruido: bufRuido, rampa: rampa,
    vivo: vivo, detenerTodo: detenerTodo, stop: detenerTodo, tono: tono, fuenteRica: fuenteRica,
    dB: dB, fmtdB: fmtdB, num: num, dibujar: dibujar, animar: animar, trazo: trazoFn, reticula: reticula, rotulo: rotulo, ajustar: ajustar,
    ONDAS: ONDAS, COLORES: C, reduceMotion: reduceMotion
  };
})();
