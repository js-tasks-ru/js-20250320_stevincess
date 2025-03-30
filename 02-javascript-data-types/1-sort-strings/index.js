/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortedArray = [...arr]

  const compareFn = (a, b) => {
    // Сначала сравниваем без учета регистра
    const result = a
      .localeCompare(
        b,
        ['ru', 'en'],
        {
          caseFirst: 'upper',
          ignorePunctuation: true,
        }
      )

    return param === 'asc' ? result : -result
  }

  sortedArray.sort(compareFn)

  return sortedArray
}
