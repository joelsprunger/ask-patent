const STORAGE_KEYS = {
  HAS_LOGGED_IN: "has_logged_in",
  ANONYMOUS_REQUEST_COUNT: "anonymous_request_count"
} as const

export const LocalStorage = {
  setHasLoggedIn: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.HAS_LOGGED_IN, "true")
    } catch (e) {
      console.error("Error setting localStorage:", e)
    }
  },

  getHasLoggedIn: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.HAS_LOGGED_IN) === "true"
    } catch (e) {
      console.error("Error getting localStorage:", e)
      return false
    }
  },

  incrementAnonymousRequests: () => {
    try {
      const count = Number(
        localStorage.getItem(STORAGE_KEYS.ANONYMOUS_REQUEST_COUNT) || "0"
      )
      localStorage.setItem(
        STORAGE_KEYS.ANONYMOUS_REQUEST_COUNT,
        String(count + 1)
      )
      return count + 1
    } catch (e) {
      console.error("Error with localStorage:", e)
      return 0
    }
  },

  resetAnonymousRequests: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANONYMOUS_REQUEST_COUNT, "0")
    } catch (e) {
      console.error("Error with localStorage:", e)
    }
  },

  getAnonymousRequestCount: () => {
    try {
      return Number(
        localStorage.getItem(STORAGE_KEYS.ANONYMOUS_REQUEST_COUNT) || "0"
      )
    } catch (e) {
      console.error("Error with localStorage:", e)
      return 0
    }
  },

  getAnonymousAIRequestCount: () => {
    return parseInt(localStorage.getItem("anonymousAIRequestCount") || "0")
  },

  incrementAnonymousAIRequests: () => {
    const count = LocalStorage.getAnonymousAIRequestCount()
    localStorage.setItem("anonymousAIRequestCount", (count + 1).toString())
    return count + 1
  }
}
