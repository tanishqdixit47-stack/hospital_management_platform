// Builds readable IDs such as P-0001 or D-0001 from the highest existing one.
module.exports = async (Model, field, prefix) => {
  const last = await Model.findOne().sort({ [field]: -1 }).select(field);
  const next = last ? parseInt(last[field].split('-')[1], 10) + 1 : 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
};
