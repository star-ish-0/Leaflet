'use client';

import { ReactNode } from 'react';

// Leaflet removed telemetry entirely: this is a pass-through provider and a
// no-op init, kept so the boot sequence stays unchanged.

export const initPostHog = () => {};

export const CSPostHogProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
