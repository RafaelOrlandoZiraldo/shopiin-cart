const storageKey = "shopping-cart-session-id";

export function getCartSessionId(): string {
  const existingSessionId = window.localStorage.getItem(storageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(storageKey, sessionId);

  return sessionId;
}
