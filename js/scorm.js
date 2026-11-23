/* Envoltorio mínimo de API SCORM 1.2.
   Busca la API en la cadena de ventanas padre y openers, como indica la especificación.
   Si no la encuentra (por ejemplo al abrir el index.html suelto para probar),
   funciona igual pero sin reportar nota. */
var SCORM = (function () {
  var api = null, iniciado = false, disponible = false;

  // Dentro de un iframe de otro dominio (p. ej. un visor web) leer win.API lanza SecurityError:
  // se captura y se trata como "sin LMS".
  function buscarEnVentana(win, profundidad) {
    var n = 0;
    try {
      while (win && !win.API && win.parent && win.parent !== win && n < profundidad) {
        n++; win = win.parent;
      }
      return win ? win.API : null;
    } catch (e) { return null; }
  }

  function obtenerAPI() {
    var a = null;
    try { a = buscarEnVentana(window, 20); } catch (e) { a = null; }
    try { if (!a && window.opener) a = buscarEnVentana(window.opener, 20); } catch (e) { /* cross-origin */ }
    try { if (!a && window.top && window.top.opener) a = buscarEnVentana(window.top.opener, 20); } catch (e) { /* cross-origin */ }
    return a;
  }

  function iniciar() {
    if (iniciado) return disponible;
    api = obtenerAPI();
    iniciado = true;
    if (!api) { disponible = false; return false; }
    disponible = (api.LMSInitialize("") + "") === "true";
    if (disponible) {
      api.LMSSetValue("cmi.core.lesson_status", "incomplete");
      api.LMSCommit("");
    }
    return disponible;
  }

  function set(clave, valor) {
    if (!disponible) return false;
    return (api.LMSSetValue(clave, String(valor)) + "") === "true";
  }

  function get(clave) {
    if (!disponible) return "";
    return api.LMSGetValue(clave) + "";
  }

  function guardar() { if (disponible) api.LMSCommit(""); }

  function reportarNota(puntaje, maximo) {
    if (!disponible) return;
    set("cmi.core.score.min", 0);
    set("cmi.core.score.max", maximo);
    set("cmi.core.score.raw", puntaje);
    guardar();
  }

  function registrarInteraccion(indice, id, tipo, respuesta, correcta) {
    if (!disponible) return;
    var p = "cmi.interactions." + indice + ".";
    set(p + "id", id);
    set(p + "type", tipo);
    set(p + "student_response", respuesta);
    set(p + "result", correcta ? "correct" : "wrong");
    guardar();
  }

  function terminar(aprobado) {
    if (!disponible) return;
    set("cmi.core.lesson_status", aprobado ? "passed" : "completed");
    guardar();
    api.LMSFinish("");
    disponible = false;
  }

  return {
    iniciar: iniciar,
    hayLMS: function () { return disponible; },
    reportarNota: reportarNota,
    registrarInteraccion: registrarInteraccion,
    terminar: terminar,
    guardar: guardar,
    set: set,
    get: get
  };
})();
