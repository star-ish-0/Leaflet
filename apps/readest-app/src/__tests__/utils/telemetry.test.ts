// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    __loaded: true,
    capture: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import {
  applyPostHogConsent,
  captureEvent,
  getTelemetryDecision,
  hasOptedOutTelemetry,
  optInTelemetry,
  optOutTelemetry,
  reconcileTelemetryConsent,
  rollIntoTelemetryPromptBucket,
  setTelemetryDecision,
  TELEMETRY_PROMPT_BUCKET_RATE,
} from '@/utils/telemetry';

// Leaflet ships without telemetry: the module is a stable no-op surface kept
// so settings and boot code keep working unchanged. These tests pin that.
describe('telemetry is removed from Leaflet', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('always reports the reader as opted out', () => {
    expect(hasOptedOutTelemetry()).toBe(true);
    expect(getTelemetryDecision()).toBe('opt-out');
  });

  it('never stores a decision, whatever callers write', () => {
    setTelemetryDecision('opt-in');
    setTelemetryDecision('opt-out');
    expect(getTelemetryDecision()).toBe('opt-out');
  });

  it('never rolls readers into the prompt bucket', () => {
    expect(TELEMETRY_PROMPT_BUCKET_RATE).toBe(0);
    expect(rollIntoTelemetryPromptBucket(() => 0)).toBe(false);
    expect(rollIntoTelemetryPromptBucket(() => 1)).toBe(false);
  });

  it('never records events or calls PostHog', () => {
    captureEvent('app-opened', { source: 'test' });
    optInTelemetry();
    optOutTelemetry();
    applyPostHogConsent();
    expect(reconcileTelemetryConsent(true)).toBe(false);
    expect(reconcileTelemetryConsent(false)).toBe(false);
    expect(posthog.capture).not.toHaveBeenCalled();
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
    expect(posthog.opt_out_capturing).not.toHaveBeenCalled();
  });
});
