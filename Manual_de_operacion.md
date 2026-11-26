# Vision 360 · Guía de operación (V9)

1. Descomprime el ZIP completo en una carpeta local y abre **index.html** en Chrome o Edge. Mantén `assets` (con `assets/fonts`), `styles.css`, `motion.js` y `presentation.js` junto al HTML.
2. Se abre la **portada**: título, resumen y agenda de la sesión. Mientras tanto carga tipografías, imágenes y los dos videos; el avance se ve en el botón. Cuando cambie a «Iniciar en pantalla completa», púlsalo o pulsa → / AvPág / Espacio en el presentador. La portada sirve para tener la sala en espera antes de empezar. La apertura empieza al entrar a pantalla completa, así se ve entera y sin el aviso del navegador encima.
3. Si entras a pantalla completa más tarde (F) mientras estás en la apertura, la apertura vuelve a empezar.
4. Secuencia: apertura → equipo → comercial → **Tres evoluciones** → Fraude (4 pasos) → Carterizados (4) → Multisesión (4) → **Tiempo de entrega** (3) → cierre.

| Acción | Controles |
|---|---|
| Avanzar | Clic, →, ↓, AvPág, Enter o Espacio |
| Retroceder | ←, ↑, RePág o Retroceso |
| Pausar o continuar | P |
| Repetir escena o video | R |
| Mostrar todos los pasos de la lámina | A |
| Repetir la animación de las cifras visibles | M |
| Abrir ensayo y saltar a escena o paso | G |
| Salir del panel de ensayo | Esc o G |
| Apertura / cierre | Inicio / Fin |
| Pantalla completa | F |

## Pasos por lámina

- **Iniciativas:** 1 Desafío · 2 Estrategia · 3 Resultados (el resto se atenúa para que la cifra mande) · 4 Valor.
- **Tiempo de entrega:** 1 sprints sin agentes · 2 los sprints con agentes se vuelven verdes, los ahorrados quedan punteados y aparece el multiplicador · 3 resumen total (3x, 7 vs 21 sprints, 14 vs 42 semanas).

## Métricas interactivas

Las cifras se cuentan solas al revelarse. Con el mouse, señala una cifra para ver su detalle junto a «Resultados»; un clic la vuelve a contar y deja el detalle fijo, **sin avanzar la lámina**. Con el presentador todo funciona igual, sin tocar nada.

## Contingencia

- Respaldo de la apertura: `assets/Apertura_Vision360.mp4` (1920 × 1080, 10,5 s).
- Si un video no carga, la pantalla de preparación lo dice y permite iniciar igual. Los MP4 de `assets` se pueden abrir en el reproductor local.
- Para retomar en una lámina: G → Escena → cerrar el panel. La carpeta `capturas` tiene cada lámina como imagen de respaldo.

## Edición

- **index.html:** orden de escenas y textos.
- **styles.css:** tipografía, colores, posiciones y animaciones de cada elemento.
- **motion.js:** la apertura.
- **presentation.js:** pantalla de preparación, transiciones entre láminas, métricas y `fraudData` (cifras de Fraude).
