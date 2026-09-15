export function calculateTripBudget(input) {
  const number = key => Math.max(0, Number(input[key]) || 0);
  const travelers = Math.max(1, Math.floor(number('travelers')));
  const nights = Math.floor(number('nights'));
  const days = Math.floor(number('days'));
  const rooms = Math.floor(number('rooms'));
  const stay = nights * rooms * number('roomRate');
  const shared = stay + number('transport') + number('extras');
  const individual = travelers * (number('returnTravel') + days * number('meals') + number('activities'));
  const subtotal = shared + individual;
  const reserve = subtotal * Math.min(100, number('contingency')) / 100;
  return { stay, shared, individual, subtotal, reserve, total: subtotal + reserve, perPerson: (subtotal + reserve) / travelers };
}

