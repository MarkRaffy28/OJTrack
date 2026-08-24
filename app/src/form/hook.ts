import { createFormHook } from "@tanstack/react-form";
import { Form } from "@/components/form";

import { fieldContext, formContext } from "@/form/context";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Field: Form.Field,
    DatePicker: Form.DatePicker,
    Select: Form.Select,
  },
  formComponents: {
    ErrorMessage: Form.ErrorMessage,
    Submit: Form.Submit,
  },
});

export type AppFormInstance<TFormData> = ReturnType<
  typeof useAppForm<
    TFormData,
    any, // TOnMount
    any, // TOnChange
    any, // TOnChangeAsync
    any, // TOnBlur
    any, // TOnBlurAsync
    any, // TOnSubmit
    any, // TOnSubmitAsync
    any, // TOnDynamic
    any, // TOnDynamicAsync
    any, // TOnServer
    any // TSubmitMeta
  >
>;
