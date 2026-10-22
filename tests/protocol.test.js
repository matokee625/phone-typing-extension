const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRequest, timingDelay, safeEqual } = require('../server/lib');

test('accepts text with normal speed and preserves whitespace', () => {
  assert.deepEqual(validateRequest({ text: ' Hello! \n', speed: 'normal' }), {text: ' Hello! \n', speed: 'normal'});
});
test('rejects empty, overly long, or non-text commands', () => {
  for (const text of ['', ' ', 23, 'x'.repeat(3001)]) {
    assert.throws(() => validateRequest({text, speed:'slow'}));
  }
});
test('rejects unknown typing speed', () => {
  assert.throws(() => validateRequest({text:'hello', speed:'instant'}));
});
test('human-paced delays stay bounded and pause longer for punctuation', () => {
  const ordinary = timingDelay('a', 'normal', () => 0.5);
  const punctuation = timingDelay('.', 'normal', () => 0.5);
  assert.ok(ordinary >= 25 && ordinary <= 300);
  assert.ok(punctuation > ordinary);
  assert.ok(timingDelay('a','slow',()=>0.5)>ordinary);
  assert.ok(timingDelay('a','fast',()=>0.5)<ordinary);
});
test('pairing check compares secrets without allowing different lengths', () => {
  assert.equal(safeEqual('12345678','12345678'),true);
  assert.equal(safeEqual('12345678','12345679'),false);
  assert.equal(safeEqual('12345678','1'),false);
});
