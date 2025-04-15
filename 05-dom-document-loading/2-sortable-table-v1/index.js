export default class SortableTable {

  #props

  static dataElements = {
    header: 'header',
    body: 'body',
  }

  subElements = {}

  // тут название поле по которому была сортировка или null
  #sortedFieldName


  /**
   *
   * @param { object[] }  [headerConfig]
   * @param { string }    headerConfig.id
   * @param { string }    headerConfig.title
   * @param { boolean }   headerConfig.sortable
   * @param { function(): string }  [headerConfig.template]
   * @param { object[] }  [data]
   */
  constructor(headerConfig = [], data = []) {


    this.#props = {
      // тут у нас может быть ф-ция, поэтому так просто сеарилизовать не можем
      headerConfig,

      // тут можно было бы клонировать входные данные чтобы они не мутировались извне случайно,
      // но не в этот раз
      data: JSON.parse(JSON.stringify(data)),
    }

    this.#sortedFieldName = null

    this.element = this.#createElement()
    this.#selectSubElements()
  }


  /**
   * @return { HTMLDivElement }
   */
  #createElement() {
    const element = document.createElement('div')
    element.classList.add('sortable-table')

    element.innerHTML = this.#buildTemplate()

    return element
  }


  /**
   * @return { string }
   */
  #buildTemplate() {
    const header = `
      <div data-element="${SortableTable.dataElements.header}" class="sortable-table__header sortable-table__row">
        ${this.#buildHeaderItemsTemplate()}
      </div>
    `


    const body = `
      <div data-element="${SortableTable.dataElements.body}" class="sortable-table__body">
        ${this.#buildBodyItemsTemplate()}
      </div>
    `

    return [ header, body ].join('\n')
  }


  /**
   * @return { string }
   */
  #buildHeaderItemsTemplate() {
    const headerItems = []

    const arrowSortable = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `

    for (const headerItem of this.#props.headerConfig) {
      headerItems
        .push(
          `
        <div class="sortable-table__cell" data-id="${headerItem.id}" data-sortable="${headerItem.sortable}">
          <span>${headerItem.title}</span>
          ${this.#sortedFieldName && headerItem.id === this.#sortedFieldName ? arrowSortable : '' }
        </div>
          `
        )
    }

    return headerItems.join('\n')
  }


  /**
   * @return { string }
   */
  #buildBodyItemsTemplate() {
    const bodyItems = []

    for (const item of this.#props.data) { // tr
      const trStart = `<a href="${item.id}" class="sortable-table__row">`

      const tdItems = []

      for (const headerItem of this.#props.headerConfig) { // td
        // id, title, sortable, [template], [sortType]

        if (typeof headerItem.template === 'function') {
          tdItems
            .push(
              headerItem.template(item[headerItem.id])
            )
          continue
        }

        tdItems
          .push(
            `<div class="sortable-table__cell">${item[headerItem.id]}</div>`
          )
      }

      const trEnd = '</a>'

      bodyItems
        .push([trStart, ...tdItems, trEnd].join('\n'))
    }

    return bodyItems.join('\n')
  }


  #selectSubElements() {
    this.element.querySelectorAll('[data-element]')
      .forEach(
        (element) => {
          this.subElements[element.dataset.element] = element
        }
      )
  }


  /**
   * @param { string } field
   * @param { string } [order]
   */
  sort(field, order) {
    if (!['asc', 'desc'].includes(order)) {
      throw new Error(`Sortable order ${order} not exists.`)
    }

    const headerItem = this.#props.headerConfig
      .find((item) => item.id === field)

    if (!headerItem) {
      throw new Error(`Sortable header item ${field} not exists.`)
    }

    if (headerItem.sortable !== true) {
      throw new Error(`Sortable header item not sortable.`)
    }

    const isAscModify = order === 'asc' ? 1 : -1

    switch (headerItem.sortType) {
      case 'string':
        this.#props.data
          .sort(
            (a, b) => {
              return a[field]
                .localeCompare(
                  b[field],
                  ['ru', 'en'],
                  {
                    caseFirst: 'upper',
                    ignorePunctuation: true,
                  }
                ) * isAscModify
            }
          )
        break


      case 'number':
        this.#props.data
          .sort(
            (a, b) => (a[field] - b[field]) * isAscModify
          )
        break

      default:
        throw new Error(`Sortable sortType ${headerItem.sortType} not exists.`)
    }

    this.#sortedFieldName = field

    this.subElements[SortableTable.dataElements.header].innerHTML = this.#buildHeaderItemsTemplate()
    this.subElements[SortableTable.dataElements.body].innerHTML = this.#buildBodyItemsTemplate()
  }


  destroy() {
    this.element.remove()
  }
}

