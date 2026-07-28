import { buildMonthGrid, dateKey } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { patternShiftId } from '@/lib/pattern';
import { formatMoney, monthSalary } from '@/lib/salary';
import { formatHours, shiftHours, type AppData } from '@/lib/types';

function monthHtml(data: AppData, year: number, month: number): string {
  const shiftById = new Map(data.shiftTypes.map((s) => [s.id, s]));
  const weeks = buildMonthGrid(year, month);

  const rows = weeks
    .map((week) => {
      const cells = week
        .map((cell) => {
          if (!cell.inMonth) return '<td></td>';
          const assignment = data.assignments[cell.key];
          const shiftId = assignment ? assignment.shiftTypeId : patternShiftId(data, cell.key);
          const shift = shiftId ? shiftById.get(shiftId) : undefined;
          const body = shift
            ? `<div class="shift" style="background:${shift.color}33;color:#0F172A">${shift.abbrev}</div>`
            : '';
          const note = assignment?.note ? `<div class="note">${escapeHtml(assignment.note)}</div>` : '';
          return `<td><div class="day">${cell.day}</div>${body}${note}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  const counts = new Map<string, number>();
  let hours = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(year, month, day);
    const assignment = data.assignments[key];
    const shiftId = assignment ? assignment.shiftTypeId : patternShiftId(data, key);
    if (!shiftId) continue;
    counts.set(shiftId, (counts.get(shiftId) ?? 0) + 1);
    const shift = shiftById.get(shiftId);
    if (shift) hours += shiftHours(shift);
  }
  const salary = monthSalary(data, year, month);
  const statParts = data.shiftTypes
    .filter((s) => counts.has(s.id))
    .map((s) => `${s.name} ×${counts.get(s.id)}`);
  statParts.push(`${t('totalHours')}: ${formatHours(hours)}${t('hoursShort')}`);
  if (salary !== null) statParts.push(`${t('salaryEstimate')}: ${formatMoney(salary)}`);

  const headers = t('weekdaysShort')
    .map((label) => `<th>${label}</th>`)
    .join('');

  return `
    <section>
      <h2>${t('months')[month]} ${year}</h2>
      <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
      <p class="stats">${statParts.join(' · ')}</p>
    </section>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A4 printable HTML for `count` months starting at year/month. */
export function buildPdfHtml(data: AppData, year: number, month: number, count: number): string {
  const sections: string[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(year, month + i, 1);
    sections.push(monthHtml(data, date.getFullYear(), date.getMonth()));
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font-family: -apple-system, Roboto, sans-serif; color: #0F172A; margin: 24px; }
    section { page-break-after: always; }
    section:last-child { page-break-after: auto; }
    h2 { font-size: 20px; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th { font-size: 10px; color: #64748B; text-transform: uppercase; padding: 4px; text-align: center; }
    td { border: 0.5px solid #E2E8F0; height: 64px; vertical-align: top; padding: 3px; }
    .day { font-size: 10px; color: #64748B; }
    .shift { font-size: 13px; font-weight: 700; text-align: center; border-radius: 6px; padding: 3px 0; margin-top: 2px; }
    .note { font-size: 8px; color: #64748B; margin-top: 2px; overflow: hidden; }
    .stats { font-size: 11px; color: #334155; margin-top: 10px; }
  </style></head><body>${sections.join('')}</body></html>`;
}
