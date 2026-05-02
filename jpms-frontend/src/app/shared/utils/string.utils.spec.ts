import { StringUtils } from './string.utils';
import { describe, it, expect } from 'vitest';

describe('StringUtils', () => {
  it('should capitalize strings', () => {
    expect(StringUtils.capitalize('hello')).toBe('Hello');
    expect(StringUtils.capitalize('')).toBe('');
    expect(StringUtils.capitalize('WORLD')).toBe('World');
  });

  it('should truncate strings', () => {
    expect(StringUtils.truncate('hello world', 5)).toBe('hello...');
    expect(StringUtils.truncate('hi', 5)).toBe('hi');
    expect(StringUtils.truncate('', 5)).toBe('');
  });

  it('should validate emails', () => {
    expect(StringUtils.isEmail('test@test.com')).toBe(true);
    expect(StringUtils.isEmail('invalid')).toBe(false);
  });

  it('should slugify text', () => {
    expect(StringUtils.slugify('Hello World')).toBe('hello-world');
    expect(StringUtils.slugify('  Trim  ')).toBe('trim');
  });

  it('should generate random strings', () => {
    const s1 = StringUtils.generateRandomString(10);
    expect(s1.length).toBe(10);
    const s2 = StringUtils.generateRandomString(10);
    expect(s1).not.toBe(s2);
  });
});
