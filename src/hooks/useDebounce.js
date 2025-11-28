// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';
import { debounce } from 'lodash-es';

/**
 * Custom hook to debounce a value update.
 * @param {*} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Create a debounced function instance
    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();

    // Cleanup function
    return () => {
      handler.cancel(); // Cancel the timer if value changes before delay
    };
  }, [value, delay]);

  return debouncedValue;
};
