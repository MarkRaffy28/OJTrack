export const fetchOrFail = async (res, fetchFn, args, notFoundMessage) => {
  const data = await fetchFn(...args);
  if (!data) {
    res.status(404).json({ message: notFoundMessage });
    return null;
  }
  
  return data;
};