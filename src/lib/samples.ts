export const SAMPLE_FILES = [
  { name: 'Northwind Editorial', file: 'northwind-editorial-DESIGN.md' },
  { name: 'Stoneware UI', file: 'stoneware-ui-DESIGN.md' },
] as const;

export async function fetchSample(file: string): Promise<string> {
  const res = await fetch(`/samples/${file}`);
  if (!res.ok) throw new Error(`Failed to load sample: ${file}`);
  return res.text();
}
