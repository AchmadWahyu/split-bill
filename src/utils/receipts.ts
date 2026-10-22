import { FeeType, ItemType, ReceiptMetaType, EventType } from '@/types';

export const DEFAULT_RECEIPT_NAME = 'Receipt';

export function calculateFeeAmount(fee: FeeType, base: number): number {
  const value = Number(fee.value || 0);
  if (fee.type === 'PERCENTAGE') {
    return Math.round((value / 100) * base);
  }
  return value;
}

export function getReceiptSubtotal(
  receiptId: string,
  items: ItemType[],
): number {
  return items
    .filter((item) => item.receiptId === receiptId)
    .reduce((sum, item) => sum + Number(item.price || 0), 0);
}

export function recomputeGlobalFees(
  receipts: ReceiptMetaType[],
  items: ItemType[],
): Pick<EventType['expense'], 'tax' | 'discount' | 'serviceCharge'> {
  let taxAmount = 0;
  let discountAmount = 0;
  let serviceChargeAmount = 0;

  for (const receipt of receipts) {
    const subtotal = getReceiptSubtotal(receipt.id, items);

    const receiptDiscount = calculateFeeAmount(receipt.discount, subtotal);
    const discountedBase = subtotal - receiptDiscount;

    const receiptServiceCharge = calculateFeeAmount(
      receipt.serviceCharge,
      discountedBase,
    );
    const taxableBase = discountedBase + receiptServiceCharge;

    const receiptTax = calculateFeeAmount(receipt.tax, taxableBase);

    taxAmount += receiptTax;
    discountAmount += receiptDiscount;
    serviceChargeAmount += receiptServiceCharge;
  }

  return {
    tax: { value: String(taxAmount), type: 'AMOUNT' as const },
    discount: { value: String(discountAmount), type: 'AMOUNT' as const },
    serviceCharge: {
      value: String(serviceChargeAmount),
      type: 'AMOUNT' as const,
    },
  };
}

export function generateReceiptName(
  scanTitle: string,
  fallbackIndex: number,
): string {
  const trimmed = scanTitle?.trim();
  if (trimmed) return trimmed;
  return `${DEFAULT_RECEIPT_NAME} ${fallbackIndex}`;
}

export function generateEventTitle(receipts: ReceiptMetaType[]): string {
  if (receipts.length === 0) return '';
  const names = receipts.map((r) => r.name).filter(Boolean);
  if (names.length === 0) return '';
  if (names.length <= 2) return names.join(', ');
  return `${names[0]}, ${names[1]} +${names.length - 2} lainnya`;
}

export function createReceiptFromScan(
  scanResult: Pick<EventType, 'title' | 'expense'>,
  fallbackIndex: number,
): ReceiptMetaType {
  return {
    id: crypto.randomUUID(),
    name: generateReceiptName(scanResult.title, fallbackIndex),
    tax: scanResult.expense.tax,
    discount: scanResult.expense.discount,
    serviceCharge: scanResult.expense.serviceCharge,
  };
}

export function mergeScanResultIntoEvent(
  existingEvent: EventType,
  scanResult: Omit<EventType, 'id'>,
): EventType {
  const newReceipt = createReceiptFromScan(
    scanResult,
    existingEvent.receipts.length + 1,
  );

  const newItems = scanResult.expense.items.map((item) => ({
    ...item,
    receiptId: newReceipt.id,
  }));

  const updatedReceipts = [...existingEvent.receipts, newReceipt];
  const updatedItems = [...existingEvent.expense.items, ...newItems];

  const updatedFees = recomputeGlobalFees(updatedReceipts, updatedItems);

  return {
    ...existingEvent,
    title: generateEventTitle(updatedReceipts),
    receipts: updatedReceipts,
    expense: {
      items: updatedItems,
      tax: updatedFees.tax,
      discount: updatedFees.discount,
      serviceCharge: updatedFees.serviceCharge,
    },
  };
}

export function removeReceiptFromEvent(
  event: EventType,
  receiptId: string,
): EventType {
  const updatedReceipts = event.receipts.filter((r) => r.id !== receiptId);
  const updatedItems = event.expense.items.filter(
    (item) => item.receiptId !== receiptId,
  );

  const updatedFees = recomputeGlobalFees(updatedReceipts, updatedItems);

  return {
    ...event,
    title: generateEventTitle(updatedReceipts),
    receipts: updatedReceipts,
    expense: {
      items: updatedItems,
      tax: updatedFees.tax,
      discount: updatedFees.discount,
      serviceCharge: updatedFees.serviceCharge,
    },
  };
}

export function renameReceiptInEvent(
  event: EventType,
  receiptId: string,
  newName: string,
): EventType {
  const updatedReceipts = event.receipts.map((r) =>
    r.id === receiptId ? { ...r, name: newName } : r,
  );

  return {
    ...event,
    title: generateEventTitle(updatedReceipts),
    receipts: updatedReceipts,
  };
}

export function migrateEventToReceipts(event: EventType): EventType {
  if (event.receipts && event.receipts.length > 0) {
    return event;
  }

  const receiptId = crypto.randomUUID();
  const receiptName = event.title || DEFAULT_RECEIPT_NAME;

  return {
    ...event,
    receipts: [
      {
        id: receiptId,
        name: receiptName,
        tax: event.expense.tax,
        discount: event.expense.discount,
        serviceCharge: event.expense.serviceCharge,
      },
    ],
    expense: {
      ...event.expense,
      items: event.expense.items.map((item) => ({
        ...item,
        receiptId,
      })),
    },
  };
}
