export const EDIT_TOKEN_KEY = 'site-data:edit-token';

export function getEditToken(): string | null {
  try {
    return localStorage.getItem(EDIT_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setEditToken(token: string) {
  try {
    localStorage.setItem(EDIT_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearEditToken() {
  try {
    localStorage.removeItem(EDIT_TOKEN_KEY);
  } catch {
    // ignore
  }
}

