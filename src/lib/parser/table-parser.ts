import type { TokenEntry } from '@/types';
import { stripBackticks } from '@/lib/utils';
import type { Table, TableRow, TableCell } from 'mdast';

function getCellText(cell: TableCell): string {
  let text = '';
  for (const child of cell.children) {
    if (child.type === 'text') {
      text += child.data ?? child.value ?? '';
    } else if (child.type === 'inlineCode') {
      text += child.value ?? '';
    } else if ('children' in child) {
      // Recurse into nested nodes (emphasis, strong, link, etc.)
      for (const grandchild of (child as { children: Array<{ type: string; value?: string }> }).children) {
        if (grandchild.type === 'text' || grandchild.type === 'inlineCode') {
          text += grandchild.value ?? '';
        }
      }
    }
  }
  return text.trim();
}

export function parseTable(table: Table): { headers: string[]; entries: TokenEntry[] } {
  const rows = table.children as TableRow[];
  if (rows.length < 2) return { headers: [], entries: [] };

  const headerRow = rows[0];
  const headers = (headerRow.children as TableCell[]).map((cell) =>
    getCellText(cell)
  );

  const entries: TokenEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = (rows[i].children as TableCell[]).map((cell) =>
      stripBackticks(getCellText(cell))
    );

    if (cells.length === 0 || cells.every((c) => !c)) continue;

    // First column is always the name
    const name = cells[0] || '';
    // Try to find the value column (hex, value, size, etc.)
    const valueIdx = findValueColumnIndex(headers);
    const value = valueIdx !== -1 && cells[valueIdx] ? cells[valueIdx] : cells[1] || '';

    // Try to find usage column
    const usageIdx = findUsageColumnIndex(headers);
    const usage = usageIdx !== -1 && cells[usageIdx] ? cells[usageIdx] : undefined;

    // Collect remaining columns as extra
    const extra: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      if (j === 0) continue; // name
      if (j === valueIdx) continue; // value
      if (j === usageIdx) continue; // usage
      if (cells[j]) {
        extra[headers[j].toLowerCase()] = cells[j];
      }
    }

    entries.push({ name, value, usage, extra });
  }

  return { headers, entries };
}

function findValueColumnIndex(headers: string[]): number {
  const patterns = [/^hex$/i, /^value$/i, /^colou?r$/i, /^size$/i, /^desktop/i];
  for (const pattern of patterns) {
    const idx = headers.findIndex((h) => pattern.test(h.trim()));
    if (idx !== -1) return idx;
  }
  return -1;
}

function findUsageColumnIndex(headers: string[]): number {
  const patterns = [/^usage$/i, /^description$/i, /^notes?$/i, /^context$/i];
  for (const pattern of patterns) {
    const idx = headers.findIndex((h) => pattern.test(h.trim()));
    if (idx !== -1) return idx;
  }
  return -1;
}
