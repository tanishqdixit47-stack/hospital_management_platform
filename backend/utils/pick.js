// Copies only the listed keys from an object (stops clients from setting fields like patientId).
module.exports = (obj, keys) =>
  keys.reduce((out, key) => {
    if (obj[key] !== undefined) out[key] = obj[key];
    return out;
  }, {});
