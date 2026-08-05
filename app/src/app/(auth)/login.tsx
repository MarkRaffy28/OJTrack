import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { Form } from "@/components/Form";
import { SafeView } from "@/components/UI/SafeView";
import { LoginRequestSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/store/settings.selectors";
import { getApiErrorMessage } from "@/utils/api";

export default function LoginScreen() {
  const theme = useTheme();

  const [error, setError] = useState("");

  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: async (session) => {
      await login(session);

      console.info("Logged in");
    },
    onError: (error) => {
      setError(getApiErrorMessage(error));
    },
  });

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
    validators: {
      onChange: LoginRequestSchema,
      onSubmit: LoginRequestSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <SafeView>
      <View>
        <form.Field name="identifier">
          {(field) => (
            <Form.Field
              field={field}
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
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Form.Field
              field={field}
              label="Password"
              placeholder="Password"
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              icon="lock-outline"
              secure
            />
          )}
        </form.Field>

        <Text style={{ color: theme.colors.error }}>{error}</Text>

        <Form.Button form={form}>Login</Form.Button>
      </View>
    </SafeView>
  );
}
