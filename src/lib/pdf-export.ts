import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const canExportPdf = true;

export async function exportPdf(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
  }
}
