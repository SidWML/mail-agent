const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Read email addresses typed into a field (separated by comma, semicolon, space or new line). */
export function parseAddresses(text: string) {
  const parts = text.split(/[,;\s]+/).filter(Boolean);
  return {
    valid: parts.filter((part) => EMAIL.test(part)),
    invalid: parts.filter((part) => !EMAIL.test(part)),
  };
}

/** Add addresses to a list without repeating one (compared without capital letters). */
export function mergeAddresses(current: string[], added: string[]) {
  const seen = new Set(current.map((address) => address.toLowerCase()));
  const result = [...current];
  for (const address of added) {
    if (!seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase());
      result.push(address);
    }
  }
  return result;
}
