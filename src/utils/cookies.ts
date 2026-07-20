/**
 * Cookie utility functions for storing and retrieving player info,
 * settings, and game configuration.
 */

export function setCookie(name: string, value: any, days: number = 365): void {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    // Use JSON.stringify for complex objects, fallback to string
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const cookieValue = encodeURIComponent(stringValue);
    
    // Cookie string configuration with secure parameters
    document.cookie = `${name}=${cookieValue};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  } catch (error) {
    console.error(`Error setting cookie [${name}]:`, error);
  }
}

export function getCookie<T = any>(name: string): T | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        const rawValue = decodeURIComponent(c.substring(nameEQ.length, c.length));
        try {
          return JSON.parse(rawValue) as T;
        } catch {
          // If it fails to parse as JSON, return raw value
          return rawValue as unknown as T;
        }
      }
    }
  } catch (error) {
    console.error(`Error reading cookie [${name}]:`, error);
  }
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Strict`;
}
