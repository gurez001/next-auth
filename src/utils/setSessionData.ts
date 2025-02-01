interface Item {
  value: string;
  expiry: number; // Fixed typo: 'expriry' → 'expiry'
}

export function setSessionData(
  key: string,
  value: string,
  expiryInMinutes: number
) {
  const now = new Date();
  const item: Item = {
    value: value,
    expiry: now.getTime() + expiryInMinutes * 60 * 1000, // Convert minutes to milliseconds
  };
  sessionStorage.setItem(key, JSON.stringify(item)); // Convert object to string
}
export function getSessionData(key: string) {
  const token: any = sessionStorage.getItem(key);
  return JSON.parse(token); // Convert object to string
}
