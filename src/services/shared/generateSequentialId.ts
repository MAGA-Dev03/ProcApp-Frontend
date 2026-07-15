export function generateSequentialId(existingIds: string[], prefix: string, padLength = 3): string {
  const numbers = existingIds
    .map((id) => {
      const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${prefix}${String(next).padStart(padLength, '0')}`;
}
