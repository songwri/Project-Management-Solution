// Minimal shared-access-code auth for the Worker API. This is intentionally
// lightweight for the MVP (internal tool, small team). The Worker checks
// this bearer token against a secret before writing to GitHub.
//
// Upgrade path: replace with Microsoft Entra ID (Azure AD) SSO since the
// company already runs Microsoft 365 / Teams — see docs/DEPLOYMENT.md.
const STORAGE_KEY = 'pm-solution-access-token'

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}
