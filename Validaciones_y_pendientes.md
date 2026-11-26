# Vision 360 · Revisión ejecutiva (V9)

## Qué cambió respecto de la V8

- **Portada:** la etiqueta pasa de «Comité directivo» a «Presentación».
- **Agenda como recorrido:** una pista vertical con puntos numerados, como un circuito. Los dos videos llevan su etiqueta y «Tres evoluciones» se destaca como el tramo central, con sus tres iniciativas visibles. La línea se dibuja y los puntos aparecen en orden al cargar.

## Qué cambió respecto de la V7

- **Fondo azul institucional** en portada, apertura y cierre. Es la plantilla del banco (bandera a cuadros y 1N), recortada 4 px por un borde oscuro superior y llevada a 1920 × 1080, sin otros cambios.
- **Logo Vision 360 sin fondo blanco.** Se usa una versión para fondo oscuro (`assets/vision_logo_negativo.png`): «ISION» en blanco y la V y el «360» en verde. El azul original desaparecería sobre el azul del banco. El logo original sigue en `assets/vision_logo_cropped.png`.
- **Composición que respeta la bandera.** La apertura sube 110 px para que el titular y los pilares no pisen los cuadros. En portada y cierre, el texto va dentro de tarjetas azules con la forma del banco (esquinas superior izquierda e inferior derecha amplias), así se lee aunque la bandera pase por detrás.
- **Portada:** el logo reemplaza al título escrito, las dos tarjetas tienen la misma altura y las indicaciones de inicio quedaron en una sola línea.
- **Contador 360°** arriba a la derecha, a 110 px del 1N. El video de respaldo de la apertura se volvió a renderizar con este diseño.

## Qué cambió respecto de la V6

- **Fraude:** las cifras quedan asignadas: NPS +6 % y FCR +12 % (canal Front).
- **Más aire sobre el logo Plan Fórmula 1N:** los paneles de las tres iniciativas y de Tiempo de entrega terminan 57 px por encima del logo (antes, 6 px). Para lograrlo se compactaron márgenes internos y el tamaño de los anillos, sin reducir los textos.
- **Escenas oscuras con el estilo del banco:** portada, apertura y cierre usan ahora el verde del Plan Fórmula 1N, la bandera a cuadros y el 1N en blanco, como en la plantilla institucional. El logo Vision 360 se apoya siempre en una tarjeta blanca con las esquinas del banco (superior izquierda e inferior derecha amplias), porque su azul se perdía sobre fondo oscuro.
- **Apertura:** las partículas orbitan en tonos claros sobre el verde y, al llegar, toman los colores reales del logo sobre la tarjeta blanca. El contador 360° pasó abajo a la derecha para no competir con el 1N. El video de respaldo se volvió a renderizar con este diseño.

## Qué cambió respecto de la V5

- **Portada.** La pantalla de carga pasa a ser una portada: título, resumen de una línea y agenda de seis partes. El avance de carga vive dentro del botón de inicio.
- **Tiempo de entrega.** Cada iniciativa es una sola pista de sprints: primero se ve completa (sin agentes) y luego se comprime. Los sprints con agentes se vuelven verdes y los ahorrados quedan punteados. Los dos recuadros de la derecha se unieron en un resumen único con barras de semanas (14 vs 42), que deja aire sobre el logo Plan Fórmula 1N.
- **Cierre.** Sin cambios en esta versión, pendiente de definir qué se le pide al comité.

## Qué cambió respecto de la V4

- **Fondo institucional reconstruido.** El fondo limpio que enviaste (ícono, 9 líneas curvas y logo Plan Fórmula 1N) ahora se dibuja en código: las líneas son vectores trazados sobre tu imagen y el logo se recortó con fondo transparente. Ya no hay recuadros pintados en el fondo, así que los paneles se pueden mover y animar.
- **El fondo no se repinta entre láminas.** Ícono, líneas y logo quedan fijos y solo cambia el contenido, como en Keynote.
- **Transiciones encadenadas, sin repetirse:**
  - Comercial → *Tres evoluciones*: el video se aleja como una tarjeta y las líneas del fondo se dibujan.
  - *Tres evoluciones* → Fraude: el «01» viaja al título y la primera tarjeta se convierte en el primer panel.
  - Fraude → Carterizados: empuje lateral.
  - Carterizados → Multisesión: profundidad (lo anterior se aleja, lo nuevo llega desde el frente).
  - Multisesión → Tiempo de entrega: los nombres del indicador de progreso bajan y se convierten en las filas.
  - Tiempo de entrega → cierre: disolvencia a oscuro.
- **Nueva lámina «Tres evoluciones».** Une los tres pilares de la apertura (Seguridad, Personalización, Agilidad) con las tres iniciativas y da contexto antes del detalle.
- **Indicador de progreso** arriba a la derecha en las iniciativas.
- **Numeración 01 · 02 · 03** en los títulos. Antes las tres láminas decían «01».
- **Métricas.** Resultados ocupa el panel más grande y, al revelarse, los demás paneles se atenúan.
  - **Porcentajes:** anillos segmentados (1 segmento = 1 punto de 20).
  - **2X:** 3 bloques base contra 6 esperados.
  - **+25 %:** 4 bloques (100) contra 5 (125). El bloque nuevo se destaca.
  - Son los mismos bloques que en *Tiempo de entrega*, así que toda la presentación habla un solo idioma visual.
- **Nueva lámina «Tiempo de entrega»** en 3 pasos, con los multiplicadores por iniciativa (2×, 4×, 3,5×) y «28 semanas menos». Ambos datos se calculan a partir de tus cifras.
- **Pantalla de preparación** con precarga real de medios e inicio en pantalla completa.
- **Copy.** Se eliminaron las etiquetas que repetían el texto en «Valor para el negocio», para dar aire a la ilustración y al mensaje.

## Decisiones a confirmar

- **Orden y nombre en «Tiempo de entrega».** Las filas siguen el orden de la presentación (Fraude, Carterizados, Multisesión) y usan «Alertas de fraude» en vez de «Alertas Monitor», para que el mismo nombre se use en toda la presentación. Si el comité conoce el proyecto como «Alertas Monitor», cámbialo en index.html.
- **Numeración 01/02/03.** Si «01» era un código de eje estratégico del Plan Fórmula 1N, vuelve a «01» en los títulos.

## Pendientes de negocio

- **Carterizados y Multisesión:** cifras mostradas como impacto esperado; confirmar unidad y horizonte.

## Validación técnica

Chrome headless (Playwright), a 1920 × 1080 y 1366 × 768:
- **Inicio:** desde la pantalla de preparación, la flecha del presentador arranca la presentación. Antes de estar lista, no hace nada.
- **Avance:** 22 avances seguidos, incluso pulsando a mitad de una transición, siguen el orden correcto: 9 escenas y 15 pasos. Los 5 retrocesos desde el cierre también.
- **Métricas:** un clic sobre una cifra no avanza la lámina.
- **Desbordes:** 0 elementos se salen de su panel en las 5 láminas claras.
- **Accesibilidad:** axe-core (WCAG 2.1 A/AA) por escena y en la pantalla de preparación, 0 infracciones. Esta revisión automática cubre cerca del 60 % de los problemas.
- **Errores de JavaScript:** 0.
- **Defecto corregido:** después de varias transiciones, Chrome dejaba sin pintar el título de una lámina aunque estaba visible. Las escenas ahora se ocultan con `display`, que obliga a recalcular el estilo al volver.

Pendiente en el recinto: audio, proyector, presentador físico y apertura desde Windows.
