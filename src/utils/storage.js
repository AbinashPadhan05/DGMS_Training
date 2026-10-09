export function loadJSON(key, storage = localStorage) {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    return null;
  }
}

export function saveJSON(key, value, storage = localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Could not save to storage", e);
  }
}
