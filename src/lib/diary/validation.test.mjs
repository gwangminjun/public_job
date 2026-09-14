import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, validMonth, validateEntry, validatePhotos, decodeCursor, encodeCursor } from './validation.ts';

test('rejects impossible calendar dates and accepts leap day', () => {
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2024-02-29'), true);
  assert.equal(validDate('2026-13-01'), false);
  assert.equal(validMonth('2026-00'), false);
  assert.equal(validMonth('2026-09'), true);
});
test('rejects invalid entry values without throwing for malformed JSON values', () => {
  assert.ok(validateEntry(null));
  assert.ok(validateEntry({ content: 4, entryDate: '2026-09-14' }));
  assert.ok(validateEntry({ content: ' ', entryDate: '2026-09-14' }));
  assert.ok(validateEntry({ content: 'hello', entryDate: '2026-09-14', mood: 'invalid' }));
  assert.equal(validateEntry({ content: 'hello', entryDate: '2026-09-14', mood: null }), null);
});
test('enforces photo type, size and combined retained count', () => {
  assert.ok(validatePhotos([{ type: 'image/gif', size: 1 }], 0));
  assert.ok(validatePhotos([{ type: 'image/png', size: 11 * 1024 * 1024 }], 0));
  assert.ok(validatePhotos([{ type: 'image/png', size: 1 }], 6));
  assert.equal(validatePhotos([{ type: 'image/webp', size: 5 }], 5), null);
});
test('cursor preserves all tie breakers and rejects PostgREST expression injection', () => {
  const value = { date: '2026-09-14', created: '2026-09-14T10:11:12.123456+00:00', id: '12345678-1234-1234-1234-123456789abc' };
  assert.deepEqual(decodeCursor(encodeCursor(value)), value);
  assert.throws(() => decodeCursor('not-valid'));
  assert.throws(() => decodeCursor(encodeCursor({ ...value, id: 'x),author.eq.A' })));
});
test('entry validation handles a missing JSON body without throwing', () => {
  assert.equal(validateEntry(null), '입력 형식이 올바르지 않습니다.');
});
