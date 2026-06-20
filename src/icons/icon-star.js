/**
 * Star icon — supports filled/outline via `filled` prop.
 * @param {Object} options
 * @param {number} [options.size=24]
 * @param {string} [options.className='']
 * @param {boolean} [options.filled=false]
 * @returns {string} SVG markup
 */
export function iconStar({ size = 24, className = '', filled = false } = {}) {
  const path = filled
    ? '<polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\" fill=\"currentColor\" stroke=\"none\"/>'
    : '<path d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>';
  return `<svg width=\"${size}\" height=\"${size}\" viewBox=\"0 0 24 24\" class=\"${className}\">${path}</svg>`;
}