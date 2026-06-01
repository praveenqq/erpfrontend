const DEV_SESSION_KEY = "erp.devSession";

export type DevSessionState = "signed-in" | "signed-out";

function readState(): DevSessionState {
  if (typeof window === "undefined") return "signed-in";
  const value = sessionStorage.getItem(DEV_SESSION_KEY);
  return value === "signed-out" ? "signed-out" : "signed-in";
}

export function isDevSessionSignedIn(): boolean {
  return readState() === "signed-in";
}

export function markDevSessionSignedIn(): void {
  sessionStorage.setItem(DEV_SESSION_KEY, "signed-in");
}

export function markDevSessionSignedOut(): void {
  sessionStorage.setItem(DEV_SESSION_KEY, "signed-out");
}
