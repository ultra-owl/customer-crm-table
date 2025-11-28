// src/hooks/useDebounce.js

import { useState, useEffect } from "react";

/**
 * Debounce a changing value.
 *
 * @param {*} value - The input value that changes frequently (search term, filter, etc.)
 * @param {number} delay - Delay in ms before updating the debounced value
 * @returns {*} debouncedValue - The value after the specified delay
 */
export function useDebounce(value, delay = 300) {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timer that will update the debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: runs before next effect
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  return debouncedValue;
}
