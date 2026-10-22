(function (root) {
  'use strict';
  const SPEEDS = Object.freeze({slow: 175, normal: 90, fast: 45});
  function validateRequest(input) {
    if (!input || typeof input.text !== 'string' || input.text.trim().length === 0 || input.text.length > 3000) {
      throw new Error('Text must contain between 1 and 3000 characters.');
    }
    if (!Object.prototype.hasOwnProperty.call(SPEEDS, input.speed)) {
      throw new Error('Select slow, normal, or fast typing.');
    }
    return {text: input.text, speed: input.speed};
  }
  function timingDelay(char, speed, random = Math.random) {
    if (!Object.prototype.hasOwnProperty.call(SPEEDS, speed)) throw new Error('Unknown typing speed.');
    const jitter = 0.7 + random() * 0.6;
    const pause = /[.!?]/.test(char) ? 260 : /[,;:\n]/.test(char) ? 115 : 0;
    return Math.round(SPEEDS[speed] * jitter + pause);
  }
  const utils = Object.freeze({validateRequest, timingDelay});
  root.PhoneTypingUtils = utils;
  if (typeof module !== 'undefined' && module.exports) module.exports = utils;
})(globalThis);
