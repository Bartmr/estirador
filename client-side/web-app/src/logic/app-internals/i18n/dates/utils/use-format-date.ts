import format from 'date-fns/format';
import { useDatesContext } from '../dates-context';

export enum DateFormat {
  WeekdayOnly = 'EE',
  DateAndTime = 'date-and-time',
}

export function useFormatDate() {
  const { dateFnsLocale } = useDatesContext();

  function formatDate(date: Date, dateFormat: DateFormat) {
    if (dateFormat === DateFormat.DateAndTime) {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

    return format(date, dateFormat, { locale: dateFnsLocale });
  }

  return formatDate;
}
