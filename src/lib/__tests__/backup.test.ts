import { normalizeBackup, parseBackup } from '@/lib/backup-core';

const valid = {
  shiftTypes: [{ id: 'm', name: 'Morning', abbrev: 'M', color: '#000', start: '', end: '' }],
  assignments: { '2026-08-01': { shiftTypeId: 'm' } },
};

describe('normalizeBackup', () => {
  it('accepts a minimal old backup and fills missing fields', () => {
    const result = normalizeBackup(valid);
    expect(result).not.toBeNull();
    expect(result!.patterns).toEqual([]);
    expect(result!.activePattern).toBeNull();
    expect(result!.settings.reminderTime).toBe('20:00');
    expect(result!.settings.sundayExtraPct).toBe(0);
  });

  it('keeps fields that are present', () => {
    const result = normalizeBackup({
      ...valid,
      patterns: [{ id: 'p', name: 'x', sequence: ['m'] }],
      activePattern: { patternId: 'p', anchor: '2026-08-01' },
      settings: { reminderEnabled: true, reminderTime: '19:30', sundayExtraPct: 25 },
    });
    expect(result!.patterns).toHaveLength(1);
    expect(result!.activePattern?.anchor).toBe('2026-08-01');
    expect(result!.settings.reminderTime).toBe('19:30');
  });

  it('rejects payloads that are not backups', () => {
    expect(normalizeBackup(null)).toBeNull();
    expect(normalizeBackup('string')).toBeNull();
    expect(normalizeBackup({})).toBeNull();
    expect(normalizeBackup({ shiftTypes: 'nope', assignments: {} })).toBeNull();
    expect(normalizeBackup({ shiftTypes: [{ id: 1 }], assignments: {} })).toBeNull();
  });
});

describe('parseBackup', () => {
  it('parses valid JSON and rejects broken JSON', () => {
    expect(parseBackup(JSON.stringify(valid))).not.toBeNull();
    expect(parseBackup('{not json')).toBeNull();
    expect(parseBackup('42')).toBeNull();
  });
});
