// Auth helpers
export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveUser(user: { id: string; name: string; email: string; isAdmin: boolean }): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): { id: string; name: string; email: string; isAdmin: boolean } | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}
