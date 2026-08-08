/**
 * Sanitizes HTML string using DOMParser to allow safe elements & attributes
 * while removing dangerous scripts, event listeners, and dangerous URIs.
 * 
 * @param {string} html 
 * @returns {string} Safe HTML string
 */
export function sanitizeHtml(html) {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set([
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'P', 'BR', 'HR', 'SPAN', 'DIV',
    'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'INS', 'SUB', 'SUP', 'MARK', 'CODE', 'PRE',
    'UL', 'OL', 'LI',
    'BLOCKQUOTE', 'CITE',
    'A', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD'
  ]);

  const allowedAttributes = {
    'A': ['href', 'target', 'rel', 'title'],
    'SPAN': ['class', 'style'],
    'DIV': ['class', 'style'],
    'P': ['class', 'style'],
    'TH': ['colspan', 'rowspan'],
    'TD': ['colspan', 'rowspan']
  };

  function cleanNode(node) {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toUpperCase();

        if (!allowedTags.has(tagName)) {
          // Replace disallowed tag with its text/children
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
          continue;
        }

        // Clean attributes
        const allowedAttrs = allowedAttributes[tagName] || [];
        const attrs = Array.from(child.attributes);

        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();

          // Block all event handlers (onload, onclick, onerror, etc.)
          if (attrName.startsWith('on')) {
            child.removeAttribute(attr.name);
            continue;
          }

          // Validate links
          if (attrName === 'href') {
            const val = attr.value.trim().toLowerCase();
            if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
              child.removeAttribute(attr.name);
              continue;
            }
          }

          if (!allowedAttrs.includes(attrName)) {
            child.removeAttribute(attr.name);
          }
        }

        // If 'a' tag has target="_blank", ensure rel="noopener noreferrer"
        if (tagName === 'A' && child.getAttribute('target') === '_blank') {
          child.setAttribute('rel', 'noopener noreferrer');
        }

        // Recursively clean child elements
        cleanNode(child);
      } else if (child.nodeType !== Node.TEXT_NODE && child.nodeType !== Node.COMMENT_NODE) {
        node.removeChild(child);
      }
    }
  }

  cleanNode(doc.body);
  return doc.body.innerHTML;
}
