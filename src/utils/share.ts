import { formatCurrencyIDR } from './currency';
import { PersonShareBreakdown } from './calculations';

export function formatShareText(
  eventTitle: string,
  personCount: number,
  itemCount: number,
  totalAmount: number,
  shares: PersonShareBreakdown[]
): string {
  const lines: string[] = [];

  lines.push(`🧾 ${eventTitle}`);
  lines.push(`Total tagihan: ${formatCurrencyIDR(totalAmount)}`);
  lines.push(`${personCount} anggota · ${itemCount} item`);
  lines.push('──────────────');

  shares.forEach((person) => {
    if (person.itemCount === 0) return;

    lines.push('');
    lines.push(
      `👤 ${person.name} (${person.itemCount} item) — ${formatCurrencyIDR(person.total)}`
    );

    person.items.forEach((item, index) => {
      lines.push(
        `  ${index + 1}. ${item.title}: ${formatCurrencyIDR(item.pricePerPerson)}`
      );
    });

    if (person.tax > 0) {
      lines.push(`  + Pajak: ${formatCurrencyIDR(person.tax)}`);
    }
    if (person.serviceCharge > 0) {
      lines.push(
        `  + Biaya layanan: ${formatCurrencyIDR(person.serviceCharge)}`
      );
    }
    if (person.discount > 0) {
      lines.push(`  - Diskon: ${formatCurrencyIDR(person.discount)}`);
    }
  });

  lines.push('');
  lines.push('──────────────');
  lines.push('Via https://split.achwahyu.com');

  return lines.join('\n');
}

export function shareToWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
