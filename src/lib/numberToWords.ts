const ONES = [
  "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
  "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
  "SEVENTEEN", "EIGHTEEN", "NINETEEN",
];
const TENS = [
  "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? " " + ONES[ones] : ""}`;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  if (hundred === 0) return twoDigits(rest);
  return `${ONES[hundred]} HUNDRED${rest ? " " + twoDigits(rest) : ""}`;
}

/** Converts a non-negative integer amount into Indian-numbering words (Rupees only, no paise). */
export function amountToWordsIndian(amount: number): string {
  const rupees = Math.round(amount);
  if (rupees === 0) return "ZERO RUPEES ONLY";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} CRORE`);
  if (lakh) parts.push(`${threeDigits(lakh)} LAKH`);
  if (thousand) parts.push(`${threeDigits(thousand)} THOUSAND`);
  if (hundred) parts.push(threeDigits(hundred));

  return `${parts.join(" ")} RUPEES ONLY`;
}
