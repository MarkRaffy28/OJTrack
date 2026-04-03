export const ensureUnique = async (res, finderFn, value, fieldName) => {
  const exists = await finderFn(value);
  if (exists) {
    res.status(409).json({ message: `${fieldName} already exists` });
    return false;
  };

  return true;
};

export const ensureUniqueField = async (res, finderFn, newValue, oldValue, userId, fieldName) => {
  if (newValue !== oldValue) {
    const existing = await finderFn(newValue);

    if (existing && existing.id !== userId) {
      res.status(409).json({ message: `${fieldName} already exists` });
      return false;
    }
  }

  return true;
};

export const ensureUserExists = async (res, finderFn, identifier, notFoundMessage = "User not found") => {
  const user = await finderFn(identifier);
  if (!user) {
    res.status(404).json({ message: notFoundMessage });
    return null;
  };

  return user;
};