import { useState } from "react";

export default function useSessionStorage<V>(key: string, initialValue: V) {
  const [storedValue, setStoredValue] = useState<V>(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(error);
        return initialValue;
      }
    } else {
      return initialValue;
    }
  });

  const setValue = (value: V | ((val: V) => V)) => {
    if (typeof window !== "undefined") {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    } else {
      console.warn(
        "useSessionStorage hook unable to access platform (window) sessionStorage"
      );
      setStoredValue(value);
    }
  };

  return [storedValue, setValue] as const;
}
