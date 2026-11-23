/* Collage de la portada: vúmetro, casete, garabato de osciloscopio, ficha con una señal y marcas.
   Todo dibujado en código (SVG y Canvas): no depende de imágenes externas. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", TINTA = "#141412", SENAL = "#E0561F";
  function svg(vb, cls) { var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", vb); s.setAttribute("class", cls); return s; }
  function n(tag, at, padre) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (padre) padre.appendChild(e); return e; }

  // ---------- vúmetro
  function vumetro() {
    var s = svg("0 0 260 196", "vumetro");
    n("rect", { x: 0, y: 0, width: 260, height: 196, rx: 14, fill: "#2B2925" }, s);
    n("rect", { x: 9, y: 9, width: 242, height: 178, rx: 10, fill: "#1D1B18" }, s);
    n("rect", { x: 18, y: 18, width: 224, height: 136, rx: 5, fill: "#EFE4C6" }, s);
    var cx = 130, cy = 152, MARCAS = [[-20, -48], [-10, -31], [-7, -22], [-5, -14], [-3, -5], [-1, 6], [0, 13], [1, 21], [2, 29], [3, 38]];
    function pol(r, ang) { var a = (ang - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    // arco de escala
    var a0 = pol(96, -50), a1 = pol(96, 13), a2 = pol(96, 40);
    n("path", { d: "M" + a0[0] + "," + a0[1] + " A96,96 0 0,1 " + a1[0] + "," + a1[1], fill: "none", stroke: TINTA, "stroke-width": 1.4 }, s);
    n("path", { d: "M" + a1[0] + "," + a1[1] + " A96,96 0 0,1 " + a2[0] + "," + a2[1], fill: "none", stroke: "#C2362A", "stroke-width": 5 }, s);
    MARCAS.forEach(function (m) {
      var p1 = pol(96, m[1]), p2 = pol(m[0] % 5 === 0 || m[0] >= 0 ? 84 : 89, m[1]), pt = pol(110, m[1]);
      n("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: m[0] > 0 ? "#C2362A" : TINTA, "stroke-width": 1.4 }, s);
      var t = n("text", { x: pt[0], y: pt[1] + 3, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 8.5, fill: m[0] > 0 ? "#C2362A" : TINTA }, s);
      t.textContent = (m[0] > 0 ? "+" : "") + m[0];
    });
    var vu = n("text", { x: 130, y: 118, "text-anchor": "middle", "font-family": "Fraunces, Georgia, serif", "font-style": "italic", "font-size": 26, fill: TINTA }, s); vu.textContent = "VU";
    var lb = n("text", { x: 130, y: 136, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 6.5, "letter-spacing": 1.2, fill: "#6B6455" }, s); lb.textContent = "NIVEL DE SEÑAL";
    n("line", { x1: cx, y1: cy, x2: cx, y2: 58, stroke: TINTA, "stroke-width": 1.8, "stroke-linecap": "round", class: "aguja" }, s);
    n("rect", { x: 18, y: 140, width: 224, height: 14, fill: "#2B2925" }, s);
    n("circle", { cx: cx, cy: 147, r: 6, fill: "#3A3833" }, s);
    var pie = n("text", { x: 130, y: 176, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 8, "letter-spacing": 2, fill: "#9C978B" }, s); pie.textContent = "MODEL G7 · dBFS";
    [[16, 176], [244, 176]].forEach(function (p) { n("circle", { cx: p[0], cy: p[1], r: 4, fill: "#4A4740" }, s); n("line", { x1: p[0] - 2.5, y1: p[1], x2: p[0] + 2.5, y2: p[1], stroke: "#1D1B18", "stroke-width": 1.2 }, s); });
    return s;
  }

  // ---------- casete
  function casete() {
    var s = svg("0 0 240 154", "casete");
    n("rect", { x: 1, y: 1, width: 238, height: 152, rx: 9, fill: "#E2DED3", stroke: TINTA, "stroke-width": 1.5 }, s);
    n("rect", { x: 14, y: 12, width: 212, height: 86, rx: 3, fill: "#FBFAF6", stroke: TINTA, "stroke-width": 1 }, s);
    n("rect", { x: 14, y: 12, width: 212, height: 16, rx: 3, fill: SENAL }, s);
    var a = n("text", { x: 22, y: 24, "font-family": "JetBrains Mono, monospace", "font-size": 9, "font-weight": 600, fill: "#FBFAF6", "letter-spacing": 1.5 }, s); a.textContent = "A · C-60";
    var t = n("text", { x: 22, y: 45, "font-family": "Fraunces, Georgia, serif", "font-style": "italic", "font-size": 15, fill: TINTA }, s); t.textContent = "NOVA 2 · síntesis";
    [52, 92].forEach(function (y) { n("line", { x1: 22, x2: 218, y1: y, y2: y, stroke: "#D3CFC4", "stroke-width": .8 }, s); });
    n("rect", { x: 64, y: 54, width: 112, height: 34, rx: 4, fill: "#2A2925" }, s);
    n("path", { d: "M84 71 Q120 90 156 71", fill: "none", stroke: "#5A3B26", "stroke-width": 9, opacity: .7 }, s);
    [[88, 71], [152, 71]].forEach(function (c) {
      var g = n("g", { class: "carrete" }, s);
      n("circle", { cx: c[0], cy: c[1], r: 12, fill: "#E2DED3", stroke: TINTA, "stroke-width": 1 }, g);
      for (var i = 0; i < 6; i++) { var ang = i * Math.PI / 3; n("line", { x1: c[0] + Math.cos(ang) * 5, y1: c[1] + Math.sin(ang) * 5, x2: c[0] + Math.cos(ang) * 9, y2: c[1] + Math.sin(ang) * 9, stroke: TINTA, "stroke-width": 2 }, g); }
      n("circle", { cx: c[0], cy: c[1], r: 3.2, fill: TINTA }, g);
    });
    n("path", { d: "M42 153 L54 112 L186 112 L198 153", fill: "#D3CEC2", stroke: TINTA, "stroke-width": 1.2 }, s);
    [[78, 134], [162, 134], [104, 140], [136, 140]].forEach(function (p) { n("circle", { cx: p[0], cy: p[1], r: 3.5, fill: "#2A2925" }, s); });
    [[9, 9], [231, 9], [9, 145], [231, 145]].forEach(function (p) { n("circle", { cx: p[0], cy: p[1], r: 2.5, fill: "#9C978B" }, s); });
    return s;
  }

  // ---------- marcas: cruces de registro y asteriscos
  function marcas() {
    var s = svg("0 0 100 90", "marcas-collage"); s.setAttribute("preserveAspectRatio", "none");
    [[8, 10, TINTA], [93, 50, SENAL], [52, 4, SENAL], [70, 86, TINTA], [4, 70, SENAL]].forEach(function (m) {
      n("path", { d: "M" + (m[0] - 1.8) + "," + m[1] + " h3.6 M" + m[0] + "," + (m[1] - 1.8) + " v3.6", stroke: m[2], "stroke-width": .45, "vector-effect": "non-scaling-stroke" }, s);
    });
    return s;
  }

  // ---------- garabato: figura de Lissajous con temblor de mano (semilla fija)
  function garabato(c) {
    var r = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
    c.width = w * r; c.height = h * r; var g = c.getContext("2d"); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, w, h);
    var s = 98765; function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; }
    g.strokeStyle = TINTA; g.lineWidth = 1.25; g.globalAlpha = .82; g.lineJoin = "round"; g.beginPath();
    var dx = 0, dy = 0;
    for (var i = 0; i <= 1400; i++) {
      var t = i / 1400 * Math.PI * 2 * 3.02;
      dx += rnd() * 1.4; dy += rnd() * 1.4; dx *= .93; dy *= .93;
      var x = w / 2 + Math.sin(3 * t + .4) * w * .42 * (1 - i / 5200) + dx, y = h / 2 + Math.sin(2 * t) * h * .4 * (1 - i / 5200) + dy;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke(); g.globalAlpha = 1;
  }

  // ---------- ficha con una señal (mini osciloscopio)
  function ficha() {
    var f = document.createElement("div"); f.className = "ficha-fig";
    var c = document.createElement("canvas"); f.appendChild(c);
    var sp = document.createElement("span"); sp.textContent = "Fig. 0 · x₁ + x₂ + x₃ = un solo timbre"; f.appendChild(sp);
    return { el: f, pintar: function () { if (c.offsetParent) AU.dibujar(c, [{ fn: function (u) { var v = 0; for (var k = 1; k <= 3; k++) v += Math.sin(2 * Math.PI * u * 2 * k) / k; return v * .55; } }], { nx: 8, ny: 4 }); } };
  }

  function montar() {
    var co = document.getElementById("collage"); if (!co || co.childElementCount) return;
    var cv = document.createElement("canvas"); cv.className = "garabato"; co.appendChild(cv);
    co.appendChild(casete());
    co.appendChild(vumetro());
    var fi = ficha(); co.appendChild(fi.el);
    var t1 = document.createElement("i"); t1.className = "cinta-adh"; t1.style.cssText = "left:24%;top:27%"; co.appendChild(t1);
    var t2 = document.createElement("i"); t2.className = "cinta-adh"; t2.style.cssText = "right:16%;top:2%;transform:rotate(14deg)"; co.appendChild(t2);
    co.appendChild(marcas());
    var pintar = function () { garabato(cv); fi.pintar(); };
    requestAnimationFrame(pintar); window.addEventListener("resize", pintar);
    window.addEventListener("hashchange", function () { setTimeout(pintar, 30); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar();
})();
