// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { isNearbyPairingAllowed, isNearbyPairingInPlan } from '@/utils/access';

describe('isNearbyPairingInPlan', () => {
  test('every plan can pair Nearby BookDrop devices', () => {
    expect(isNearbyPairingInPlan('free', false)).toBe(true);
    expect(isNearbyPairingInPlan('plus', false)).toBe(true);
    expect(isNearbyPairingInPlan('pro', false)).toBe(true);
    expect(isNearbyPairingInPlan('purchase', false)).toBe(true);
  });
});

describe('isNearbyPairingAllowed (no paywall)', () => {
  test('pairing for confirmation-free drops is open to every plan', () => {
    expect(isNearbyPairingAllowed('free', false)).toBe(true);
    expect(isNearbyPairingAllowed('plus', false)).toBe(true);
    expect(isNearbyPairingAllowed('pro', false)).toBe(true);
    expect(isNearbyPairingAllowed('purchase', false)).toBe(true);
  });

  test('the Full Customization unlock entitles a free user', () => {
    expect(isNearbyPairingAllowed('free', true)).toBe(true);
    expect(isNearbyPairingAllowed('purchase', true)).toBe(true);
  });
});
