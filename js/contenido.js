/* Contenido del OVA: textos de las operaciones, glosario, equivalencias y banco de preguntas. */
var CONTENIDO = {

  operaciones: [
    {
      id: "escalado", corto: "Escalado", titulo: "Escalado de amplitud", formula: "y(t) = k · x(t)", daw: "Fader, ganancia, normalizar",
      intro: "La operación más simple: multiplicar toda la señal por un mismo número. Si k es mayor que uno la señal crece; si está entre cero y uno se encoge. Eso es exactamente lo que hace un fader.",
      prediccion: {
        enunciado: "Vas a multiplicar una señal senoidal de 220 Hz por un valor entre 0 y 2. ¿Qué va a cambiar?",
        opciones: ["Solo qué tan fuerte se escucha", "El tono", "El timbre"], correcta: 0,
        ok: "Bien. Vamos a comprobarlo: mueve el control y mira la forma de onda mientras escuchas.",
        mal: "Fíjate en qué parte de la señal toca una multiplicación por una constante: la altura, no la rapidez."
      },
      taller: "Ajusta el valor de k y escucha. Observa que los picos suben y bajan, pero la distancia entre un pico y el siguiente no cambia.",
      justificacion: {
        enunciado: "¿Por qué el tono no cambió aunque la señal se hizo más grande?",
        opciones: ["Porque multiplicar por una constante no cambia cuántos ciclos hay por segundo", "Porque la frecuencia también se multiplicó", "Porque el oído no distingue tonos a bajo volumen"], correcta: 0,
        ok: "Así es. La constante multiplica la altura de la onda, no su rapidez: los ciclos por segundo siguen siendo los mismos.",
        mal: "Mira de nuevo la forma de onda mientras mueves el control: los picos cambian de altura, pero el periodo (la distancia entre dos picos) se mantiene."
      }
    },
    {
      id: "suma", corto: "Suma", titulo: "Suma de señales y síntesis aditiva", formula: "y(t) = x₁(t) + x₂(t) + …", daw: "Bus de mezcla, capas, síntesis aditiva",
      intro: "Sumar dos señales es sumar sus valores instante por instante. Es lo que pasa en el bus de mezcla. Y si sumas una senoidal con otras cuyas frecuencias son múltiplos de la primera, no obtienes varios sonidos: obtienes uno solo con otro timbre.",
      prediccion: {
        enunciado: "Vas a sumar una senoidal de 110 Hz con otras de 220, 330 y 440 Hz. ¿Qué vas a escuchar?",
        opciones: ["Un solo sonido con un timbre distinto", "Cuatro sonidos separados", "Un sonido más agudo"], correcta: 0,
        ok: "Correcto. Activa los armónicos uno por uno y compáralo con la señal objetivo.",
        mal: "Recuerda que las cuatro frecuencias son múltiplos de la primera. El oído las integra en un solo tono."
      },
      taller: "Activa y desactiva cada armónico y ajusta su amplitud. Intenta acercarte al sonido de referencia usando la menor cantidad de armónicos posible.",
      justificacion: {
        enunciado: "¿Qué pasó con el timbre a medida que agregabas armónicos?",
        opciones: ["Se volvió más brillante y más denso", "Se volvió más agudo", "No cambió"], correcta: 0,
        ok: "Exacto. La frecuencia fundamental no cambió, y por eso la nota es la misma. Lo que cambió es de qué está hecha la señal, y eso es el timbre.",
        mal: "Mira el espectro: la línea más baja, la fundamental, se quedó donde estaba. Si la nota fuera más aguda, esa línea se habría movido."
      }
    },
    {
      id: "cancelacion", corto: "Cancelación", titulo: "Inversión de fase y cancelación", formula: "y(t) = x(t) + ( −x(t) ) = 0", daw: "Botón Ø (polaridad), alineación de micrófonos",
      intro: "Invertir una señal es multiplicarla por menos uno. Por sí sola no se escucha distinta, porque el oído no distingue el signo. Pero suma la señal original con su versión invertida y cada valor se cancela con su opuesto.",
      prediccion: {
        enunciado: "Vas a escuchar una señal, después la misma señal invertida, y después las dos sumadas. ¿Qué esperas oír en cada caso?",
        opciones: ["Igual, igual y silencio", "Igual, distinta y más fuerte", "Igual, silencio y silencio"], correcta: 0,
        ok: "Correcto. Compruébalo con el control de mezcla: verás también los estados intermedios.",
        mal: "Ojo con la segunda: el oído no percibe el signo de una señal, así que invertida suena idéntica. Lo interesante ocurre al sumarlas."
      },
      taller: "Mueve el control de mezcla desde 0 (solo la original) hasta 1 (original + invertida al mismo nivel) y observa cómo la amplitud se desploma.",
      justificacion: {
        enunciado: "¿Por qué la señal invertida sonaba igual a la original, pero al sumarlas dio silencio?",
        opciones: ["Porque el oído no percibe el signo, pero la suma de valores opuestos sí da cero", "Porque la inversión elimina la señal", "Porque el volumen se duplicó"], correcta: 0,
        ok: "Así es. Oír el signo es imposible, pero sumar más uno con menos uno da cero sin importar lo que oiga nadie. La cancelación es aritmética, no perceptual.",
        mal: "Vuelve a poner la mezcla en 0 y escucha la invertida sola: sigue ahí, no se eliminó nada. Lo que produce el silencio es la suma."
      }
    },
    {
      id: "retardo", corto: "Retardo", titulo: "Desplazamiento en el tiempo y filtro peine", formula: "y(t) = x(t) + x(t − t₀)", daw: "Delay, flanger, chorus, alineación de pistas",
      intro: "Desplazar una señal es retrasarla. Con retardos largos escuchas un eco. Pero con retardos muy cortos, por debajo de unos 20 milisegundos, no escuchas dos sonidos: escuchas uno con el timbre cambiado, porque al sumar se refuerzan unas frecuencias y se cancelan otras.",
      prediccion: {
        enunciado: "Vas a sumar un sonido con una copia de sí mismo retrasada 5 milisegundos. ¿Qué vas a escuchar?",
        opciones: ["Un solo sonido con el timbre cambiado", "Dos sonidos separados", "El mismo sonido más fuerte"], correcta: 0,
        ok: "Correcto. Ahora recorre todo el rango de retardo y busca dónde deja de ser timbre y empieza a ser eco.",
        mal: "Cinco milisegundos es muchísimo menos de lo que el oído separa como dos eventos. El efecto está en el espectro."
      },
      taller: "Mueve el retardo desde 0 hasta 300 ms. Fíjate en el espectro: con retardos cortos aparecen valles regulares, que es lo que da el nombre de filtro peine.",
      justificacion: {
        enunciado: "¿Por qué un retardo pequeño cambia el timbre en vez de producir un eco?",
        opciones: ["Porque al sumarse refuerza unas frecuencias y cancela otras", "Porque el oído no alcanza a percibir retardos cortos como sonidos separados", "Porque el retardo reduce el volumen"], correcta: 0,
        ok: "Exacto. El retardo desfasa cada frecuencia de forma distinta, así que al sumar, algunas se suman y otras se restan. Eso deja los valles que viste en el espectro.",
        mal: "La segunda opción describe algo real, pero no es la causa del cambio de timbre. Esos valles regulares del espectro no los produce el oído: los produce la suma."
      }
    },
    {
      id: "multiplicacion", corto: "Multiplicación", titulo: "Multiplicación de señales", formula: "y(t) = x₁(t) · x₂(t)", daw: "Trémolo, envolventes, modulación en anillo",
      intro: "¿Y si multiplicamos una señal por otra señal? El resultado depende de qué tan rápida sea la segunda. Si es lenta, de unos pocos hercios, oyes el volumen subiendo y bajando: un trémolo. Si está en el rango audible, aparece un timbre nuevo.",
      prediccion: {
        enunciado: "Vas a multiplicar un tono de 440 Hz por otra señal. Si la segunda va a 4 Hz y luego a 200 Hz, ¿qué esperas oír?",
        opciones: ["Primero un volumen que late, después un timbre nuevo", "En los dos casos un volumen que late", "En los dos casos un timbre nuevo"], correcta: 0,
        ok: "Correcto. Recorre la frecuencia del modulador de forma continua y busca dónde ocurre el cambio.",
        mal: "Es la misma operación en los dos casos; lo único que cambia es la velocidad de la segunda señal, y eso basta para cambiar el resultado."
      },
      taller: "Mueve la frecuencia del modulador desde 1 Hz hasta 500 Hz. Observa en el espectro cómo aparecen componentes que no estaban en ninguna de las dos señales.",
      justificacion: {
        enunciado: "Con el modulador a 200 Hz aparecen frecuencias nuevas. ¿De dónde salen?",
        opciones: ["De la multiplicación, que genera la suma y la diferencia de las frecuencias", "De una distorsión de la señal", "El oído las inventa"], correcta: 0,
        ok: "Así es. Multiplicar dos señales produce componentes en la suma y en la diferencia de sus frecuencias: con 440 y 200 aparecen 640 y 240, que es lo que viste en el espectro.",
        mal: "Ninguna de las dos señales está distorsionada, y el espectro es una medida, no una percepción. Compara el espectro con el modulador en 1 Hz y en 200 Hz."
      }
    }
  ],

  glosario: [
    { concepto: "Decibel", definicion: "Relación logarítmica entre dos niveles. No es una unidad absoluta: mide cuánto más grande es una señal respecto a otra que tomamos como referencia. Se expresa como <b>dB = 20 · log₁₀ (A / A<sub>ref</sub>)</b>. Consecuencia práctica: si no sabes cuál es la referencia, un valor en decibeles no te dice nada." },
    { concepto: "dBFS", definicion: "Decibeles a escala completa. Es la escala digital: su cero es el valor máximo que el sistema puede representar. Por eso todos los valores de trabajo son negativos, e indican cuánto te falta para llegar al techo. Un medidor en <b>−9 dBFS</b> te dice que la señal está 9 dB por debajo del máximo representable." },
    { concepto: "dB SPL", definicion: "Escala acústica. Su referencia es aproximadamente el umbral de audición humana, así que mide nivel real en el aire y sus valores son positivos. No se corresponde con dBFS: un archivo a −12 dBFS puede sonar a cualquier nivel acústico, porque eso depende de cuánto subas el amplificador." },
    { concepto: "Headroom", definicion: "Distancia entre el pico más alto de tu señal y 0 dBFS: el margen de seguridad que te queda antes de saturar. Conviene conservar algo en cada pista, y no por prudencia vaga: como <b>mezclar es sumar señales</b>, si cada pista llega cerca del techo la suma lo supera." },
    { concepto: "Clipping", definicion: "Recorte que ocurre cuando la señal intenta superar 0 dBFS. El sistema no tiene números para representarla y le corta los picos. No suena más fuerte: suena distorsionado. Se reconoce visualmente porque la forma de onda queda con la <b>cima plana</b>." },
    { concepto: "0 dBFS", definicion: "El techo digital: el valor máximo representable por el sistema. Superarlo produce clipping. Referencias de trabajo: −6 dBFS es aproximadamente la mitad de la amplitud del máximo, y entre −18 y −12 dBFS es una zona cómoda para una pista individual." },
    { concepto: "Escala logarítmica", definicion: "El oído no percibe el volumen de forma proporcional: duplicar la amplitud no se escucha como el doble de fuerte. Y el rango entre el sonido más débil audible y uno doloroso es de varios millones a uno. La escala logarítmica comprime ese rango a números de dos cifras y se parece más a cómo percibimos. Dos reglas prácticas: <b>+6 dB ≈ el doble de amplitud</b>, <b>+10 dB ≈ el doble de sonoridad percibida</b>." }
  ],

  equivalencias: [
    { op: "Escalado de amplitud", formula: "k · x(t)", daw: "Fader de pista, ganancia de entrada (trim), normalizar, automatización de volumen", ojo: "Normalizar sube señal y ruido por igual: no mejora la relación señal‑ruido." },
    { op: "Suma de señales", formula: "x₁(t) + x₂(t)", daw: "Bus de mezcla, máster, capas de un mismo instrumento, síntesis aditiva", ojo: "Dos pistas a −3 dBFS pueden sumar más de 0 dBFS: deja headroom." },
    { op: "Inversión de fase", formula: "−x(t)", daw: "Botón Ø de polaridad en el canal o en el plugin de utilidad", ojo: "Sola no se oye. Sumada con la original cancela." },
    { op: "Desplazamiento en el tiempo", formula: "x(t − t₀)", daw: "Delay, eco, flanger y chorus (retardos cortos que varían), alineación de pistas (nudge)", ojo: "Por debajo de ~20 ms no hay eco: hay filtro peine." },
    { op: "Multiplicación de señales", formula: "x₁(t) · x₂(t)", daw: "Trémolo, envolvente ADSR, compuerta (gate), modulación en anillo", ojo: "Modulador lento = volumen que late; modulador audible = frecuencias nuevas." }
  ],

  cadena: [
    { nombre: "Trim de entrada −6 dB", correcta: "escalado" },
    { nombre: "Botón Ø en la pista del micrófono 2", correcta: "inversion" },
    { nombre: "Delay de 380 ms", correcta: "desplazamiento" },
    { nombre: "Flanger (retardo de 2 a 8 ms sumado a la señal)", correcta: "retardo-suma" },
    { nombre: "Trémolo a 5 Hz", correcta: "multiplicacion" },
    { nombre: "Bus máster que recibe las seis pistas", correcta: "suma" }
  ],
  cadenaOpciones: [
    { id: "escalado", texto: "Escalado de amplitud" }, { id: "suma", texto: "Suma de señales" }, { id: "inversion", texto: "Inversión de fase" },
    { id: "desplazamiento", texto: "Desplazamiento en el tiempo" }, { id: "retardo-suma", texto: "Desplazamiento + suma (filtro peine)" }, { id: "multiplicacion", texto: "Multiplicación de señales" }
  ],

  evaluacion: [
    { enunciado: "Dos señales senoidales tienen la misma frecuencia, pero una se escucha más fuerte que la otra. ¿Qué parámetro las diferencia?",
      opciones: [
        { texto: "La amplitud", ok: true, fb: "Correcto. Mayor amplitud significa mayor nivel percibido, sin que cambie el tono." },
        { texto: "El periodo", fb: "No. El periodo es el inverso de la frecuencia, y el enunciado dice que la frecuencia es la misma." },
        { texto: "La fase", fb: "No. La fase indica en qué punto del ciclo arranca la señal; por sí sola no cambia el nivel percibido." },
        { texto: "La forma de onda", fb: "No. La forma de onda cambia el timbre, no el volumen." }] },
    { enunciado: "Dos señales tienen la misma amplitud y la misma frecuencia, pero suenan distinto. ¿Qué las diferencia?",
      opciones: [
        { texto: "La forma de onda, es decir su contenido de armónicos", ok: true, fb: "Correcto. Esa diferencia es exactamente lo que llamamos timbre." },
        { texto: "El periodo", fb: "No. Si la frecuencia es la misma, el periodo también lo es." },
        { texto: "La amplitud de pico", fb: "No. El enunciado dice que la amplitud es la misma." }] },
    { enunciado: "Una toma quedó grabada muy baja y con ruido de fondo. Un compañero propone normalizarla «para mejorar la relación señal‑ruido». ¿Qué pasa al normalizar?",
      opciones: [
        { texto: "Sube la señal y el ruido por igual: la relación entre ambos no cambia, solo el nivel", ok: true, fb: "Correcto. Normalizar es un escalado: multiplica todo por la misma constante." },
        { texto: "El ruido se reduce porque la normalización lo detecta y lo atenúa", fb: "No. Normalizar no analiza qué es ruido y qué es señal: multiplica todo." },
        { texto: "La señal sube y el ruido se queda igual", fb: "No. Las dos cosas están en la misma pista y se multiplican por la misma constante." }] },
    { enunciado: "Tienes dos pistas y cada una llega a picos de −3 dBFS. Al enviarlas juntas al máster, la mezcla satura. ¿Por qué ocurre?",
      opciones: [
        { texto: "Porque mezclar es sumar señales, y la suma supera 0 dBFS", ok: true, fb: "Correcto. No es un defecto del programa: es aritmética." },
        { texto: "Porque el máster aplica una ganancia automática", fb: "No. El máster no añade ganancia por su cuenta." },
        { texto: "Porque las dos pistas tienen el mismo timbre", fb: "No. El timbre no interviene en que se supere el techo digital." },
        { texto: "Porque falta comprimir el máster", fb: "No. La compresión podría disimular el problema, pero la causa es la suma." }] },
    { enunciado: "Grabaste un instrumento con dos micrófonos. Cada pista suena bien por separado, pero al mezclarlas los graves casi desaparecen. ¿Qué está pasando y cómo se corrige?",
      opciones: [
        { texto: "Las señales están desfasadas y se cancelan al sumarse; se corrige invirtiendo la polaridad de una o alineando las pistas", ok: true, fb: "Correcto. Es la cancelación por inversión de fase ocurriendo en una grabación real." },
        { texto: "Un micrófono está defectuoso; se corrige bajando su nivel", fb: "No. Las dos pistas suenan bien por separado, así que ninguna está defectuosa." },
        { texto: "Falta ecualizar los graves; se corrige subiendo las frecuencias bajas", fb: "No. Puedes subir los graves, pero seguirán cancelándose: no se ataca la causa." }] },
    { enunciado: "Sumas una señal con una copia de sí misma retrasada 5 milisegundos. No escuchas un eco: escuchas el mismo sonido con el timbre cambiado. ¿Cuál es la causa?",
      opciones: [
        { texto: "Al sumarse, el retardo refuerza unas frecuencias y cancela otras", ok: true, fb: "Correcto. Esos valles regulares del espectro son la firma del filtro peine." },
        { texto: "El oído no percibe retardos tan cortos como sonidos separados", fb: "Es cierto que no los separa, pero eso no explica el cambio de timbre: el cambio está en el espectro, no en la percepción." },
        { texto: "El retardo reduce el volumen de la señal", fb: "No. Un retardo por sí solo no cambia el nivel." }] },
    { enunciado: "Multiplicas un tono de 440 Hz por una segunda señal senoidal. ¿Qué determina que oigas un trémolo o un timbre metálico nuevo?",
      opciones: [
        { texto: "La frecuencia de la segunda señal", ok: true, fb: "Correcto. Por debajo de unos 20 Hz es trémolo; dentro del rango audible es modulación en anillo." },
        { texto: "La amplitud del tono de 440 Hz", fb: "No. La amplitud cambia el nivel, no la naturaleza del efecto." },
        { texto: "La forma de onda del tono de 440 Hz", fb: "No. El parámetro decisivo es la velocidad del modulador." }] },
    { enunciado: "Subes el fader de una pista 6 dB. ¿Qué operación matemática está ejecutando el DAW sobre la señal?",
      opciones: [
        { texto: "Multiplicar cada muestra por una constante (≈ 2): un escalado de amplitud", ok: true, fb: "Correcto. +6 dB equivale a multiplicar la amplitud por dos, muestra por muestra." },
        { texto: "Sumar una constante a cada muestra", fb: "No. Sumar una constante desplaza la onda hacia arriba (offset), no la hace más grande." },
        { texto: "Desplazar la señal en el tiempo", fb: "No. El fader no toca el tiempo: solo la amplitud." },
        { texto: "Multiplicarla por otra señal", fb: "No. Multiplicar por otra señal sería un trémolo o una modulación; el fader multiplica por un número fijo." }] },
    { enunciado: "Tu medidor marcaba −0,3 dBFS; subes un poco más y los picos se ven planos y el sonido distorsiona. ¿Qué pasó?",
      opciones: [
        { texto: "La señal superó 0 dBFS y el sistema recortó los picos: clipping", ok: true, fb: "Correcto. Por encima del techo digital no hay números para representar la señal; se recorta." },
        { texto: "El convertidor bajó el volumen automáticamente", fb: "No. Nada baja el volumen solo; lo que ves es un recorte." },
        { texto: "Se perdió la frecuencia fundamental", fb: "No. La fundamental sigue ahí; lo que aparece son armónicos nuevos por el recorte." },
        { texto: "La pista quedó con la polaridad invertida", fb: "No. Invertir la polaridad no cambia la forma ni produce distorsión." }] },
    { enunciado: "Exportaste una mezcla con picos en −1 dBFS. ¿A cuántos dB SPL va a sonar en el salón?",
      opciones: [
        { texto: "No se puede saber: dBFS es una escala digital relativa al máximo; el nivel acústico depende del amplificador y los parlantes", ok: true, fb: "Correcto. Son dos escalas con referencias distintas; la perilla del amplificador decide el SPL." },
        { texto: "A −1 dB SPL", fb: "No. Los dB SPL son positivos y su referencia es el umbral de audición, no el techo digital." },
        { texto: "A 99 dB SPL, porque 100 es el máximo", fb: "No. No existe esa correspondencia; el SPL depende de la reproducción." },
        { texto: "A 0 dB SPL", fb: "No. 0 dB SPL es el umbral de audición, casi silencio." }] }
  ]
};
