const slugifyLib = require('slugify');

function toSlug(text) {
  return slugifyLib(text, { lower: true, strict: true, locale: 'es' });
}

module.exports = { toSlug };