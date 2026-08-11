import { View } from "react-native";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { SafeView } from "@/components/ui/SafeView";
import { useAppForm } from "@/form/context";
import { LoginRequestSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/store/auth.store";
import { getApiErrorMessage } from "@/utils/api.util";

export default function LoginScreen() {
  const login = useLogin();

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: async (session) => {
      await login(session);

      if (session.user.status === "pre_activated") {
        router.push("/complete-registration");
      } else {
        router.push("/");
      }
    },
  });

  const form = useAppForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    validators: {
      onChange: LoginRequestSchema,
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch (error) {
        form.setErrorMap({ onSubmit: getApiErrorMessage(error) });
      }
    },
  });

  return (
    <SafeView>
      <form.AppForm>
        <View>
          <form.AppField name="identifier">
            {(field) => (
              <field.Field
                label="Identifier"
                placeholder="User ID, Username or Email"
                maxLength={100}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                icon="key-outline"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.Field
                label="Password"
                placeholder="Password"
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                icon="lock-outline"
                secure
              />
            )}
          </form.AppField>

          <form.ErrorMessage />

          <form.Submit>Login</form.Submit>
        </View>
      </form.AppForm>
    </SafeView>
  );
}
