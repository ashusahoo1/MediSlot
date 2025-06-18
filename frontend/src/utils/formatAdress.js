export const formatAddress = (addr) =>
  [addr?.street, addr?.city, addr?.state, addr?.country, addr?.postcode].filter(Boolean).join(', ');
