import { DateUtils } from './date.utils';
import { describe, it, expect } from 'vitest';

describe('DateUtils', () => {
  it('should format dates', () => {
    const d = new Date('2023-01-01');
    expect(DateUtils.format(d)).toBeTruthy();
  });

  it('should calculate time ago', () => {
    const now = new Date();
    expect(DateUtils.timeAgo(now)).toBe('Just now');
    
    const yesterday = new Date(Date.now() - 86400000);
    expect(DateUtils.timeAgo(yesterday)).toBe('1 days ago');

    const twoHours = new Date(Date.now() - 7200000);
    expect(DateUtils.timeAgo(twoHours)).toBe('2 hours ago');

    const fiveMins = new Date(Date.now() - 300000);
    expect(DateUtils.timeAgo(fiveMins)).toBe('5 mins ago');
  });

  it('should detect future dates', () => {
    const future = new Date(Date.now() + 10000);
    expect(DateUtils.isFuture(future)).toBe(true);
    
    const past = new Date(Date.now() - 10000);
    expect(DateUtils.isFuture(past)).toBe(false);
  });

  it('should calculate days between', () => {
    const d1 = '2023-01-01';
    const d2 = '2023-01-05';
    expect(DateUtils.getDaysBetween(d1, d2)).toBe(4);
  });
});
