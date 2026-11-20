export const TELEMETRY_OPT_OUT_KEY = 'leaflet-telemetry-opt-out';
export const TELEMETRY_DECISION_KEY = 'leaflet-telemetry-decision';

export type TelemetryDecision = 'opt-in' | 'opt-out' | 'pending';

/** Kept for API compatibility; the prompt bucket is always empty. */
export const TELEMETRY_PROMPT_BUCKET_RATE = 0;

// Leaflet ships with telemetry removed. The decision API below is kept as a
// stable no-op surface so callers (settings, boot) keep working unchanged.

export const hasOptedOutTelemetry = () => true;

export const getTelemetryDecision = (): TelemetryDecision => 'opt-out';

export const setTelemetryDecision = (_decision: TelemetryDecision) => {};

export const rollIntoTelemetryPromptBucket = (_rng: () => number = Math.random) => false;

export const captureEvent = (_event: string, _properties?: Record<string, unknown>) => {};

export const optInTelemetry = () => {};

export const optOutTelemetry = () => {};

export const applyPostHogConsent = () => {};

export const reconcileTelemetryConsent = (_setting?: boolean): boolean => false;
