import { treeifyError } from "zod";

export const validate = (res, schema, data) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    res.status(400).json(treeifyError(parsed.error));
    return null;
  };

  return parsed.data;
};