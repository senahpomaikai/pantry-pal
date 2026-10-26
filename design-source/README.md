# design-source (read-only reference)

Exported from the "Pantry Pal – Lo-fi Prototype" Design canvas.

- `Main.dc.html`    – the interactive prototype (390x844). Source of truth for behavior, copy, and layout.
- `Library.dc.html` – design library v0.4 (colors, type, components). Source of truth for tokens.
- `canvas.json`     – canvas index (artboard positions). Not needed for the port.
- `dc-format-reference.md` – explains the .dc.html template format.

These files use a custom template format (`<sc-if>`, `<sc-for>`, `{{dotted.lookups}}`, `class Component extends DCLogic`).
They cannot be opened in a browser on their own (`./support.js` is a platform runtime that is not included).
Read them as source code / spec. Do not edit them.
