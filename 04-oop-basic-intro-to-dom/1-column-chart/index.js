export default class ColumnChart {

  #options
  #columnProps
  #element
  #titleElement
  #columnChartContainer


  /**
   * @constructor
   *
   * @param [options]
   * @param { number[] }  [options.data]
   * @param { string }    [options.label]
   * @param { number }    [options.value]
   * @param { string }    [options.link]
   * @param { function }  [options.formatHeading]
   */
  constructor(
    {
      data= [],
      label,
      value,
      link,
      formatHeading = (data) => `${data}`
    } = {}
  ) {
    this.chartHeight = 50

    this.#options = {
      data: [ ...data ],
      label,
      value,
      link,
      formatHeading,
    }
    this.#columnProps = []

    this.#createElement()

    this.update(this.#options.data)
  }


  get element() {
    return this.#element
  }


  #createElement() {
    // root element
    this.#element = document.createElement('div')
    this.#element.classList.add('column-chart')
    this.#element.style.setProperty('--chart-height', `${this.chartHeight}`)

    this.#titleElement = document.createElement('div')
    this.#titleElement.classList.add('column-chart__title')

    this.#columnChartContainer = {
      element: document.createElement('div'),

      header: document.createElement('div'),
      body: document.createElement('div'),
    }

    this.#columnChartContainer.element.classList.add('column-chart__container')

    this.#columnChartContainer.header.classList.add('column-chart__header')
    this.#columnChartContainer.header.setAttribute('data-element', 'header')

    this.#columnChartContainer.body.classList.add('column-chart__chart')
    this.#columnChartContainer.body.setAttribute('data-element', 'body')


    this.#element.append(this.#titleElement)
    this.#element.append(this.#columnChartContainer.element)

    this.#columnChartContainer.element
      .append(
        this.#columnChartContainer.header,
        this.#columnChartContainer.body
      )
  }


  #fillingValues() {
    // сразу очищаем чтобы потом заполнить актуальными данными
    while (this.#columnChartContainer.body.firstElementChild) {
      this.#columnChartContainer.body.firstElementChild.remove()
    }


    if (this.#options.link) {
      this.#titleElement.innerHTML = `${this.#options.label || ''} <a class="column-chart__link" href="${this.#options.link}">View all</a>`
    }
    else {
      this.#titleElement.innerText = `${this.#options.label || ''}`
    }


    const valueTextHeader = typeof this.#options.formatHeading === 'function'
      ? this.#options.formatHeading(this.#options.value)
      : this.#options.value

    this.#columnChartContainer.header.innerText = valueTextHeader


    if (!this.#columnProps.length) {
      // устанавливаем скилетон
      this.#element.classList.add('column-chart_loading')

      return
    }

    // очищаем скилетон если он был
    // добавляем данные

    if (this.#element.classList.contains('column-chart_loading')) {
      this.#element.classList.remove('column-chart_loading')
    }

    for (let { percent, value } of this.#columnProps) {
      const divElement = document.createElement('div')

      divElement.style.setProperty('--value', value)
      divElement.setAttribute('data-tooltip', percent)

      this.#columnChartContainer.body.append(divElement)
    }
  }


  /**
   * @param { number[] } data
   * @return { { percent: string, value: string }[] }
   */
  #getColumnProps(data) {
    const maxValue = Math.max(...data)
    const scale = 50 / maxValue

    return data
      .map(
        (item) => {
          return {
            percent: (item / maxValue * 100).toFixed(0) + '%',
            value: String(Math.floor(item * scale))
          }
        }
      )
  }


  /**
   * @param { number[] } [data]
   */
  update(data = []) {
    this.#options.data = [ ...data ]

    this.#columnProps = this.#getColumnProps(this.#options.data)

    this.#fillingValues()
  }


  remove() {
    this.#element.remove()
  }


  destroy() {
    this.remove()
  }
}
