// Protection contre l'injection de code (XSS) pour les contenus rédigés par d'autres utilisateurs
// (descriptions d'offres, contrats) et affichés avec dangerouslySetInnerHTML.

/** Échappe un texte brut avant de le formater en HTML : `<script>` s'affiche comme du texte. */
export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ALLOWED_TAGS = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'I', 'LI', 'OL',
  'P', 'PRE', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'U', 'UL'
]);
const REMOVED_WITH_CONTENT = new Set([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT',
  'SVG', 'MATH', 'BASE', 'TEMPLATE', 'NOSCRIPT'
]);
const ALLOWED_ATTRIBUTES = new Set(['class', 'style', 'colspan', 'rowspan', 'href']);

/** Assainit du HTML : ne garde que des balises et attributs de mise en forme (pas de script, ni d'événement `on…`). */
export function sanitizeHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');

  const clean = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.nodeType !== Node.ELEMENT_NODE) {
        node.remove(); // commentaires, instructions de traitement
        return;
      }

      if (REMOVED_WITH_CONTENT.has(node.tagName)) {
        node.remove();
        return;
      }
      if (!ALLOWED_TAGS.has(node.tagName)) {
        clean(node);
        node.replaceWith(...node.childNodes); // balise inconnue : on garde son contenu
        return;
      }

      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();
        const unsafeStyle = name === 'style' && /url\s*\(|expression|javascript:|@import/i.test(value);
        const unsafeHref = name === 'href' && !/^(https?:|mailto:|#)/i.test(value);
        if (!ALLOWED_ATTRIBUTES.has(name) || unsafeStyle || unsafeHref) {
          node.removeAttribute(attr.name);
        }
      });
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
      clean(node);
    });
  };

  clean(doc.body);
  return doc.body.innerHTML;
}
