import type { PostProcessorModule } from 'i18next';

// Leaflet rebrand at runtime: translation bundles built from the upstream
// locale files keep working while every user-facing "Readest" renders as
// "Leaflet", so we don't have to fork ~35 locale JSONs in the repo.
export const REBRAND_PROCESSOR = 'leaflet-rebrand';

const rebrand = (value: unknown): unknown => {
  if (typeof value === 'string') return value.replace(/Readest/g, 'Leaflet');
  return value;
};

const postProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: REBRAND_PROCESSOR,
  process: (value: string) => rebrand(value) as string,
};

export default postProcessor;
