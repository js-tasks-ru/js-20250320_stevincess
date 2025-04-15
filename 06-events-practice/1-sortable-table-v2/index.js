export default class SortableTable {


  /** @type { boolean } **/
  isSortLocally

  #props

  static dataElements = {
    header: 'header',
    body: 'body',
  }

  subElements = {}

  /**
   * @type {{id: string | null, order: string | null}}
   */
  #sorted = {
    id: null,
    order: null,
  }


  /**
   *
   * @param { object[] }  headersConfig
   * @param { string }    headersConfig.id
   * @param { string }    headersConfig.title
   * @param { boolean }   headersConfig.sortable
   * @param { function(): string }  [headersConfig.template]
   * @param { object }    [options]
   * @param { object[] }  [options.data]
   * @param { string }    [options.sorted.id]
   * @param { string }    [options.sorted.order]
   */
  constructor(
    headersConfig,
    options
  ) {
    let {
      data = [],
      sorted = {},
    } = options

    /** в данной версии таблицы мы осуществляем сортировку на клиенте **/
    this.isSortLocally = true


    this.#props = {
      headersConfig,
      data,
    }

    this.#sorted.id = sorted.id ?? null
    this.#sorted.order = sorted.order ?? null

    this.element = this.#createElement()
    this.#selectSubElements()
    this.sort()

    this.#addEvent()
  }


  /**
   * Добавляем обработку кликов
   */
  #addEvent() {
    this.subElements[SortableTable.dataElements.header]
      .addEventListener(
        'click',
        (event) => {
          const cell = event.target.closest('.sortable-table__cell')

          if (
            cell.dataset.sortable !== 'true'
            || !cell.dataset.id
            || !cell.dataset.order
          ) {
            // это не наш пациент
            return
          }

          // // по дефолту сортируем так
          // let order = 'ask'
          //
          // // если мы уже сортировали это в прошлый раз, то меняем порядок сортировки
          // if (
          //   this.#sorted.id === cell.dataset.id
          //   && this.#sorted.order === cell.dataset.order
          // ) {
          let order = ['asc', 'desc']
              .find((order) => cell.dataset.order !== order)
          // }

          cell.dataset.order = order

          this.#sorted.id = cell.dataset.id
          this.#sorted.order = order

          this.sort()

          // у нас больше нет никаких слушателей этого события
          event.stopPropagation()
        },
        {
          passive: true,
        }
      )
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
        <!-- сюда вставляем данные после сортировки -->
      </div>
    `
    // ${this.#buildHeaderItemsTemplate()}


    const body = `
      <div data-element="${SortableTable.dataElements.body}" class="sortable-table__body">
        <!-- сюда вставляем данные после сортировки -->
        
      </div>
    `
    // ${this.#buildBodyItemsTemplate()}

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

    for (const headerItem of this.#props.headersConfig) {
      let order = 'ask'

      if (headerItem.id === this.#sorted.id) {
        order = this.#sorted.order
      }

      const dataOrder = headerItem.sortable ? `data-order="${order}"` : ''

      headerItems
        .push(
          `
        <div class="sortable-table__cell" data-id="${headerItem.id}" data-sortable="${headerItem.sortable}" ${dataOrder} >
          <span>${headerItem.title}</span>
          ${this.#sorted.id && headerItem.id === this.#sorted.id ? arrowSortable : '' }
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

      for (const headerItem of this.#props.headersConfig) { // td
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


  sort() {
    if (this.isSortLocally) {
      this.sortOnClient()
    }
    else {
      this.sortOnServer()
    }

    this.#replaceTableInDOM()
  }


  /**
   * Добавляем отсортированные данные в DOM
   */
  #replaceTableInDOM() {
    this.subElements[SortableTable.dataElements.header].innerHTML = this.#buildHeaderItemsTemplate()
    this.subElements[SortableTable.dataElements.body].innerHTML = this.#buildBodyItemsTemplate()
  }


  /**
   * Сортируем данные на клиенте
   */
  sortOnClient() {
    const field = this.#sorted.id
    const order = this.#sorted.order

    if (!field || !order) {
      // наверное, нечего сортировать
      return
    }

    if (!['asc', 'desc'].includes(order)) {
      throw new Error(`Sortable order ${order} not exists.`)
    }

    const headerItem = this.#props.headersConfig
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
  }


  sortOnServer() {
    // просто заглушка на будущее
  }


  destroy() {
    this.element.remove()
  }
}
