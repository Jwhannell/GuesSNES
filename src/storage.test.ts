import { describe, it, expect, beforeEach } from 'vitest';
import { readSet, writeSet, appendToSet, clearKey } from './storage';

const KEY = 'test_storage_key';

describe('storage adapter', () => {
  beforeEach(() => {
    clearKey(KEY);
  });

  it('should read/write sets', () => {
    const set = new Set(['a', 'b']);
    writeSet(KEY, set);
    const read = readSet(KEY);
    expect(read.has('a')).toBe(true);
    expect(read.has('b')).toBe(true);
  });

  it('should append and trim to max size', () => {
    appendToSet(KEY, ['1', '2', '3'], 2);
    const set = readSet(KEY);
    expect(set.size).toBe(2);
    // Should keep the most recent two entries (in insertion order)
    expect(set.has('2')).toBe(true);
    expect(set.has('3')).toBe(true);
    expect(set.has('1')).toBe(false);
  });
});
