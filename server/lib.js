'use strict';
const crypto = require('node:crypto');
const {validateRequest, timingDelay} = require('../extension/typing-utils.js');
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
module.exports = {validateRequest, timingDelay, safeEqual};
