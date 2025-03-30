/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string
  }

  return string
    .split('')
    .reduce(
      (acc, cur) => {
        const index = acc.lastIndexOf(cur)

        if (index === -1 && size < 1) {
          return acc
        }

        if (acc.endsWith(cur.repeat(size))) {
          return acc
        }

        return `${acc}${cur}`
      },
      ''
    )
}
