export const calcAge = (dob) => {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { timeStyle: 'short' });

// ISO string -> value for <input type="datetime-local"> in the user's local time.
export const toLocalInput = (iso) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
