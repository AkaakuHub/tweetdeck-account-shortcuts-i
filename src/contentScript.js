"use strict"

let lastSelectedAccountIndex = 0
let isFunctionEnabled = true

const setCookie = (key, value) => {
  document.cookie = `${key}=${value}; path=/; max-age=31536000 samesite=strict`
}

const getCookie = (key) => {
  const cookies = document.cookie.split(";")
  const cookie = cookies.find((cookie) => cookie.includes(key))
  return cookie ? cookie.split("=")[1] : null
}

const changeLastSelectedAccountIndex = (index) => {
  lastSelectedAccountIndex = index
  setCookie("lastSelectedAccountIndex", index)
}

const changeIsFunctionEnabled = (isEnabled) => {
  isFunctionEnabled = isEnabled
  setCookie("isFunctionEnabled", isEnabled)
}

const setIndexByClickEvent = () => {
  // アカウントのアイコン画像をクリックした際の処理
  const accountButtonCheckTimer = setInterval(accountButtonCheckIsReady, 50)
  function accountButtonCheckIsReady() {
    if (document.querySelectorAll(".js-account-item").length !== 0) {
      clearInterval(accountButtonCheckTimer)
      const accountButtons = document.querySelectorAll(".js-account-item")
      accountButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          changeLastSelectedAccountIndex(index)
          setIndexByClickEvent()
        })
      })
    }
  }
}

const toggleButtonElement = document.createElement("button")
toggleButtonElement.classList.add("tas_toggle_button")

// on/offボタンを追加
const onClickToggleButton = () => {
  if (isFunctionEnabled) {
    changeLastSelectedAccountIndex(0)
  }
  changeIsFunctionEnabled(!isFunctionEnabled)
  toggleButtonElement.textContent = isFunctionEnabled
    ? "保持する"
    : "保持しない"
}

toggleButtonElement.addEventListener("click", onClickToggleButton)

const injectToggleButton = () => {
  const addToggleButtonCheckTimer = setInterval(addToggleButtonCheckIsReady, 50)
  function addToggleButtonCheckIsReady() {
    if (document.querySelector(".js-account-list") !== undefined) {
      clearInterval(addToggleButtonCheckTimer)

      const targetElement = document.querySelector(".js-account-list")
      // すでにある場合は追加しない
      const isAlreadyExist =
        targetElement.nextElementSibling === toggleButtonElement
      if (isAlreadyExist) return

      toggleButtonElement.textContent = isFunctionEnabled
        ? "保持する"
        : "保持しない"
      targetElement.insertAdjacentElement("afterend", toggleButtonElement)
    }
  }
}

const determineButtonToClick = (buttonElements, index) =>
  index < buttonElements.length ? buttonElements[index] : buttonElements[0]

const clickAccountInTheIndex = (index) => {
  const buttons = Array.from(document.getElementsByClassName("js-account-item"))
  if (!buttons.length) return

  const buttonToClick = determineButtonToClick(buttons, index)
  buttonToClick?.click()
}

const selectAccount = (index) => {
  const retweetModal = document.getElementById("actions-modal")
  if (retweetModal?.style?.display === "block") {
    const buttons = Array.from(
      retweetModal.querySelectorAll(".js-account-item")
    )
    if (!buttons?.length) return

    const buttonToClick = determineButtonToClick(buttons, index)
    buttonToClick?.click()
    // lastSelectedAccountIndex = index;

    return
  }

  const replyPopoutButton = document.querySelector('button[title="Popout"]')
  if (replyPopoutButton) {
    replyPopoutButton.click()
    clickAccountInTheIndex(index)
    // lastSelectedAccountIndex = index;
    return
  }

  const drawerToggleButton =
    document.getElementsByClassName("js-show-drawer")[0]
  const application = document.getElementsByClassName("application")[0]
  if (!drawerToggleButton || !application) return

  if (!application.classList.contains("hide-detail-view-inline")) {
    drawerToggleButton.click()
    setIndexByClickEvent()
    injectToggleButton()
  }

  clickAccountInTheIndex(index)
  changeLastSelectedAccountIndex(index)
}

const quote = () =>
  document.querySelector('button[data-action="quote"]')?.click()

const isTyping = () => {
  const inputTags = ["INPUT", "TEXTAREA", "SELECT"]
  const tagName = document.activeElement.tagName
  return inputTags.includes(tagName) ? true : false
}

;(() => {
  document.onkeydown = (e) => {
    if (!isTyping() && e.shiftKey && e.code.includes("Digit")) {
      e.preventDefault()
      const numKeyIndex = e.code.slice(-1)
      numKeyIndex > 0 ? selectAccount(numKeyIndex - 1) : selectAccount(9)
    }

    // 前回のアカウントを選択
    if (!isTyping() && e.key === "n") {
      const drawerToggleButton =
        document.getElementsByClassName("js-show-drawer")[0]
      const application = document.getElementsByClassName("application")[0]
      if (!drawerToggleButton || !application) return

      if (!application.classList.contains("hide-detail-view-inline")) {
        e.preventDefault()

        drawerToggleButton.click()
        injectToggleButton()
        setIndexByClickEvent()
        if (!isFunctionEnabled) return

        clickAccountInTheIndex(lastSelectedAccountIndex)
      }
    }

    if (!isTyping() && e.altKey && e.key === "Enter") {
      quote()
    }
  }

  // ドローワーを開くボタンにイベントリスナーを追加
  const drawerToggleButtonCheckTimer = setInterval(
    drawerToggleButtonCheckIsReady,
    50
  )
  function drawerToggleButtonCheckIsReady() {
    if (document.getElementsByClassName("js-show-drawer")[0] !== undefined) {
      clearInterval(drawerToggleButtonCheckTimer)
      const drawerToggleButton =
        document.getElementsByClassName("js-show-drawer")[0]
      drawerToggleButton.addEventListener("click", () => {
        injectToggleButton()
        setIndexByClickEvent()
        if (!isFunctionEnabled) return

        selectAccount(lastSelectedAccountIndex)
      })
    }
  }

  // cookieからlastSelectedAccountIndex, isFunctionEnabledがあれば取得
  if (getCookie("lastSelectedAccountIndex") !== null) {
    lastSelectedAccountIndex = Number(getCookie("lastSelectedAccountIndex"))
  }
  if (getCookie("isFunctionEnabled") !== null) {
    isFunctionEnabled = getCookie("isFunctionEnabled") === "true"
  }
})()
