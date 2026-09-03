const ACCESS_USERNAME = 'upbound';
const ACCESS_PASSWORD = 'rmf2026';
const ACCESS_COOKIE_NAME = 'upbound_registry_access';
const ACCESS_COOKIE_VALUE = 'granted-v1';
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function constantTimeEqual(left: string, right: string): boolean {
  const maximumLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < maximumLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function credentialsAreValid(username: string, password: string): boolean {
  return (
    constantTimeEqual(username.trim().toLowerCase(), ACCESS_USERNAME) &&
    constantTimeEqual(password, ACCESS_PASSWORD)
  );
}

export function hasPersistentAccess(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((entry) => {
    const [rawName, ...rawValue] = entry.trim().split('=');
    return rawName === ACCESS_COOKIE_NAME && decodeURIComponent(rawValue.join('=')) === ACCESS_COOKIE_VALUE;
  });
}

export function persistAccess(): void {
  if (typeof document === 'undefined') return;
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACCESS_COOKIE_NAME}=${encodeURIComponent(ACCESS_COOKIE_VALUE)}; Path=/; Max-Age=${THIRTY_DAYS_IN_SECONDS}; SameSite=Strict${secureAttribute}`;
}

export function revokeAccess(): void {
  if (typeof document === 'undefined') return;
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACCESS_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict${secureAttribute}`;
}

export const accessControlInternals = { ACCESS_COOKIE_NAME };
