const slugify = require('slugify');

/**
 * Generate a URL-safe slug from a string
 * @param {string} text - Input string
 * @returns {string} - URL-safe slug
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Generate a unique slug by appending a counter if needed
 * @param {string} text - Input string
 * @param {Model} Model - Mongoose model to check uniqueness against
 * @param {string|null} excludeId - Document ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (text, Model, excludeId = null) => {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let count = 1;

  const query = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  while (await Model.exists(query)) {
    slug = `${baseSlug}-${count}`;
    query.slug = slug;
    count++;
  }

  return slug;
};

module.exports = { generateSlug, generateUniqueSlug };
