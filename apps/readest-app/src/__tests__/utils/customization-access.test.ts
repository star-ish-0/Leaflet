// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  getCustomizationPurchased,
  getSubscriptionPlan,
  getUserProfilePlan,
  isAnkiAllowed,
  isAbsOfflineAllowed,
  isCloudSyncAllowed,
  isCustomizationAllowed,
  isCustomTranslatorAllowed,
  isNearbyPairingAllowed,
  isSelfHosted,
  isTTSCacheAllowed,
} from '@/utils/access';

describe('Leaflet ships everything unlocked', () => {
  it('reports every token as a Pro subscription', () => {
    expect(getSubscriptionPlan('anything')).toBe('pro');
    expect(getUserProfilePlan('anything')).toBe('pro');
  });

  it('reports the Customization unlock as always bought', () => {
    expect(getCustomizationPurchased('anything')).toBe(true);
  });

  it('behaves like a self-hosted deployment with no store', () => {
    expect(isSelfHosted()).toBe(true);
  });

  it('opens Full Customization for every plan and purchase state', () => {
    expect(isCustomizationAllowed('free', false)).toBe(true);
    expect(isCustomizationAllowed('plus', false)).toBe(true);
    expect(isCustomizationAllowed('pro', false)).toBe(true);
    expect(isCustomizationAllowed('purchase', false)).toBe(true);
  });

  it('allows a custom translator even signed out', () => {
    expect(isCustomTranslatorAllowed(null)).toBe(true);
    expect(isCustomTranslatorAllowed(undefined)).toBe(true);
  });

  it('opens every plan-based gate', () => {
    expect(isCloudSyncAllowed('free', false)).toBe(true);
    expect(isTTSCacheAllowed('free', false)).toBe(true);
    expect(isAbsOfflineAllowed('free', false)).toBe(true);
    expect(isAnkiAllowed('free', false)).toBe(true);
    expect(isNearbyPairingAllowed('free', false)).toBe(true);
  });
});
