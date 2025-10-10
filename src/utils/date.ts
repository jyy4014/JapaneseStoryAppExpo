import dayjs from 'dayjs';

export function today(format = 'YYYY-MM-DD') {
  return dayjs().format(format);
}

