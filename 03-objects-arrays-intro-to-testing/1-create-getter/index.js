/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arr = path.split('.')

  return function (obj) {
    return arr
      .reduce(
        (acc, current) => {
          return acc && acc.hasOwnProperty(current) ? acc[current] : undefined
        },
        obj
      )
  }
}
