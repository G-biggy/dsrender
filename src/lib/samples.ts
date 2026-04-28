export const SAMPLE_FILES = [
  { name: 'Claude', file: 'claude-DESIGN.md' },
  { name: 'Stripe', file: 'stripe-DESIGN.md' },
  { name: 'PlayStation', file: 'playstation-DESIGN.md' },
  { name: 'Atmospheric Glass', file: 'google-atmospheric-glass-DESIGN.md' },
] as const;

export async function fetchSample(file: string): Promise<string> {
  const res = await fetch(`/samples/${file}`);
  if (!res.ok) throw new Error(`Failed to load sample: ${file}`);
  return res.text();
}
