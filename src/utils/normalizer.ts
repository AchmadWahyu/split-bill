import { DynacicPercentageValue, EventType } from '../types';

const itemDefaultValues = {
  title: '',
  price: '0',
  receiver: [] as string[],
};

export const eventDefaultValues: EventType = {
  id: '',
  title: '',
  personList: [],
  expense: {
    items: [itemDefaultValues],
    tax: { value: '0', type: 'AMOUNT' as DynacicPercentageValue },
    discount: { value: '0', type: 'AMOUNT' as DynacicPercentageValue },
    serviceCharge: { value: '0', type: 'AMOUNT' as DynacicPercentageValue },
  },
};

function convertPercentageToAmount(
  field: { type: DynacicPercentageValue; value: string },
  base: number
): { type: DynacicPercentageValue; value: string } {
  if (field.type === 'PERCENTAGE') {
    const amount = Math.round((Number(field.value) / 100) * base);
    return { type: 'AMOUNT', value: String(amount) };
  }
  return field;
}

export function migrateEventData(event: EventType): EventType {
  const subtotal = event.expense.items.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  const discount = convertPercentageToAmount(event.expense.discount, subtotal);
  const serviceCharge = convertPercentageToAmount(
    event.expense.serviceCharge,
    subtotal
  );

  const discountAmount = Number(discount.value);
  const serviceAmount = Number(serviceCharge.value);
  const adjustedBase = subtotal - discountAmount + serviceAmount;

  const tax = convertPercentageToAmount(event.expense.tax, adjustedBase);

  return {
    ...event,
    expense: {
      items: event.expense.items.map((item) => ({
        title: item.title,
        price: item.price,
        receiver: (item.receiver || []).filter((r) => Boolean(r)),
      })),
      tax,
      discount,
      serviceCharge,
    },
  };
}

export const normalizeEventData = (
  event: EventType | undefined
): EventType => {
  return {
    id: event?.id || '',
    title: event?.title || '',
    personList:
      !event?.personList || event?.personList?.length === 0
        ? []
        : event.personList.filter((p) => Boolean(p.name)),
    expense: {
      items:
        !event?.expense?.items || event?.expense?.items?.length === 0
          ? [itemDefaultValues]
          : event.expense.items.map((item) => ({
              title: item.title || '',
              price: item.price || '0',
              receiver: (item.receiver || []).filter((r) => Boolean(r)),
            })),
      tax: {
        type: event?.expense?.tax?.type || 'AMOUNT',
        value: event?.expense?.tax?.value || '0',
      },
      discount: {
        type: event?.expense?.discount?.type || 'AMOUNT',
        value: event?.expense?.discount?.value || '0',
      },
      serviceCharge: {
        type: event?.expense?.serviceCharge?.type || 'AMOUNT',
        value: event?.expense?.serviceCharge?.value || '0',
      },
    },
  };
};

export const normalizeEventListData = (
  eventList: string | null
): EventType[] => {
  if (!eventList) {
    return [eventDefaultValues];
  }

  return JSON.parse(eventList);
};
