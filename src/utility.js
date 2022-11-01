// =============================================================================

/**
 * Returns 2-digit number with leading zero if param is 1-digit
 * @param {number} n
 * @returns {number}
 */
export const makeTwoDigits = (n) => {
  return String(n).length > 1 ? n : `0${n}`;
};

// =============================================================================

/**
 * Normalizes datastamp making "00:07:12" from "7:12"
 * @param {string} stamp
 * @returns {string}
 */
export const normalizeTimestampt = (stamp) => {
  let splitted = stamp.split(":").map((el) => {
    return makeTwoDigits(el);
  });

  if (splitted.length !== 3) splitted.unshift("00");
  return splitted.join(":");
};

// =============================================================================

/**
 * Detects whether param is timestamp
 * @param {string} text=
 * @returns {boolean}
 */
export const isTimestamp = (text) => /^\d{1,2}:\d{1,2}(:\d{1,2})?\s/.test(text);

// =============================================================================

/**
 * Returns next timestamp from array, ignores titles
 * @param {string} current timestamp of "00:00 chunk_name" format
 * @param {string[]} arr array of timestamps and numbers
 * @returns {string}
 */
export const getNextTimestamp = (current, arr) => {
  const position = arr.indexOf(current);
  for (let i = position + 1; i < arr.length; i++) {
    if (isTimestamp(arr[i])) return arr[i];
  }
  return null;
};

// =============================================================================
