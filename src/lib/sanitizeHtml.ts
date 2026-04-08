import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'em',
  'h1',
  'h2',
  'h3',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  's',
  'span',
  'strong',
  'u',
  'ul',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function sanitizeRichHtml(input: string | undefined | null): string {
  if (!input) return '';

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'srcdoc'],
    FORBID_TAGS: ['iframe', 'object', 'embed', 'script', 'style'],
  });
}
