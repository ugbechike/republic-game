export const money = (n: number) => `$${n.toFixed(1)}B`;
export const date = (month: number) => `${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][month % 12]} ${2030 + Math.floor(month / 12)}`;
export const human = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
