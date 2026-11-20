// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { isAbsOfflineAllowed, isAbsOfflineInPlan } from '@/utils/access';

describe('isAbsOfflineInPlan', () => {
  test('every plan can download Audiobookshelf books for offline use', () => {
    expect(isAbsOfflineInPlan('free', false)).toBe(true);
    expect(isAbsOfflineInPlan('plus', false)).toBe(true);
    expect(isAbsOfflineInPlan('pro', false)).toBe(true);
    expect(isAbsOfflineInPlan('purchase', false)).toBe(true);
  });
});

describe('isAbsOfflineAllowed (no paywall)', () => {
  test('offline Audiobookshelf downloads are open to every plan', () => {
    expect(isAbsOfflineAllowed('free', false)).toBe(true);
    expect(isAbsOfflineAllowed('plus', false)).toBe(true);
    expect(isAbsOfflineAllowed('pro', false)).toBe(true);
    expect(isAbsOfflineAllowed('purchase', false)).toBe(true);
  });

  test('entitles a free user who bought Full Customization', () => {
    expect(isAbsOfflineAllowed('free', true)).toBe(true);
  });
});
