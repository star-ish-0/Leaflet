// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { isTTSCacheAllowed, isTTSCacheInPlan } from '@/utils/access';

describe('isTTSCacheInPlan', () => {
  test('every plan carries the offline TTS audio cache', () => {
    expect(isTTSCacheInPlan('free', false)).toBe(true);
    expect(isTTSCacheInPlan('plus', false)).toBe(true);
    expect(isTTSCacheInPlan('pro', false)).toBe(true);
    expect(isTTSCacheInPlan('purchase', false)).toBe(true);
  });
});

describe('isTTSCacheAllowed (no paywall)', () => {
  test('downloading TTS audio for offline playback is open to every plan', () => {
    expect(isTTSCacheAllowed('free', false)).toBe(true);
    expect(isTTSCacheAllowed('plus', false)).toBe(true);
    expect(isTTSCacheAllowed('pro', false)).toBe(true);
    expect(isTTSCacheAllowed('purchase', false)).toBe(true);
  });

  test('entitles a free user who bought Full Customization', () => {
    expect(isTTSCacheAllowed('free', true)).toBe(true);
    expect(isTTSCacheAllowed('purchase', true)).toBe(true);
  });
});
