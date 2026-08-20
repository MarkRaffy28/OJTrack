import { StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import { ICON_SIZES } from "@/constants/icons.constants";
import { useTheme } from "@/store/settings.store";

type PasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

const REQUIREMENTS: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "Uppercase letter (A-Z)", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "Lowercase letter (a-z)", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "Number (0-9)", test: (pwd) => /\d/.test(pwd) },
  { label: "Special character (!@#$%...)", test: (pwd) => /[^A-Za-z0-9]/.test(pwd) },
];

type Props = {
  password: string;
};

export function PasswordStrength({ password }: Props) {
  const theme = useTheme();

  const metRequirements = REQUIREMENTS.filter((req) => req.test(password)).length;
  const isStrong = metRequirements === REQUIREMENTS.length;

  const strengthColor = isStrong ? theme.colors.success : theme.colors.warning;
  const strengthLabel = isStrong ? "Strong" : metRequirements >= 3 ? "Good" : "Weak";

  return (
    <View style={styles.root}>
      <View style={styles.meterRow}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Password strength
        </Text>
        <Text
          variant="labelSmall"
          style={{
            color: strengthColor,
            fontWeight: "600",
          }}
        >
          {strengthLabel}
        </Text>
      </View>

      <View style={styles.meterBar}>
        <View
          style={[
            styles.meterFill,
            {
              width: `${(metRequirements / REQUIREMENTS.length) * 100}%`,
              backgroundColor: strengthColor,
            },
          ]}
        />
      </View>

      <View style={styles.requirementsList}>
        {REQUIREMENTS.map((req, idx) => {
          const met = req.test(password);
          return (
            <View key={idx} style={styles.requirementRow}>
              <Icon
                source={met ? "check-circle" : "circle-outline"}
                size={ICON_SIZES.sm}
                color={met ? theme.colors.success : theme.colors.outlineVariant}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.requirementLabel,
                  {
                    color: met ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {req.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  meterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meterBar: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 2,
  },
  requirementsList: {
    gap: 6,
    paddingTop: 4,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementLabel: {
    flex: 1,
  },
});
