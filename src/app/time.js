// 날짜 도우미: 기기 시간대 기준(한국이면 한국 시간)으로 오늘을 정한다.

const pad = (n) => String(n).padStart(2, '0');

/** YYYY-MM-DD */
export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
