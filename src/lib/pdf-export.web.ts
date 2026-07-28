// PDF export uses native print-to-file; dev-web skips it.

export const canExportPdf = false;

export async function exportPdf(_html: string): Promise<void> {}
