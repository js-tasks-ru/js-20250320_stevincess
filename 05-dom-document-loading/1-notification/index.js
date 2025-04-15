export default class NotificationMessage {

  static lastShownComponent

  #message
  #options
  #timerId


  /**
   *
   * @param { string } message
   * @param { object } [options]
   * @param { number } [options.duration=1000] ms
   * @param { string } [options.type=success]
   * @return {*}
   */
  constructor(message, options) {
    const notificationType = options?.type || 'success'

    const allowedNotificationTypes = ['success', 'error']

    if (!allowedNotificationTypes.includes(notificationType)) {
      throw new Error(`Тип сообщения может быть одним из: ${allowedNotificationTypes.join(', ')}`)
    }

    const duration = Math.round((options?.duration ?? 1_000) / 1_000)

    this.#message = message
    this.#options = {
      duration: duration,
      type: notificationType,
    }

    this.remove = this.remove.bind(this)

    this.element = this.#createElement()
  }


  get duration() {
    return this.#options.duration * 1_000
  }


  /**
   * @param { HTMLElement } [newElement]
   */
  show(newElement) {
    if (newElement) {
      const oldElement = this.element
      this.element.replaceWith(newElement)
      this.element = newElement
      oldElement.remove()
    }

    if (NotificationMessage.lastShownComponent) {
      NotificationMessage.lastShownComponent.remove()
    }

    NotificationMessage.lastShownComponent = this

    this.#timerId = setTimeout(
      () => {
        this.remove()
      },
      this.duration
    )
  }


  /**
   * @return { HTMLElement }
   */
  #createElement() {
    const element = document.createElement('div')

    element.classList.add('notification', this.#options.type)
    element.style.setProperty('--value', `${this.#options.duration}s`)

    element.innerHTML = `
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.#options.type}</div>
        <div class="notification-body">
          ${this.#message}
        </div>
      </div>
    `

    return element
  }


  remove() {
    if (this.#timerId) {
      clearTimeout(this.#timerId)
    }

    this.element?.remove()
  }


  destroy() {
    this.remove()
  }
}
