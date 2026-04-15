import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { z } from "zod";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { APP_STRINGS } from "../../src/lib/constants";
import { mobileApi } from "../../src/lib/api-client";
import { useSessionStore } from "../../src/stores/session-store";
import { theme } from "../../src/theme";

const signInSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
  firstName: z.string().min(2, "Ingresá tu nombre"),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const setSession = useSessionStore((state) => state.setSession);

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      firstName: "",
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const clerkUserId = `mock_${values.email.toLowerCase()}`;
    const result = await mobileApi.login({
      clerkUserId,
      email: values.email,
      firstName: values.firstName,
      locale: "es-AR",
    });

    setSession({
      userId: result.userId,
      role: result.role,
    });

    router.replace("/(tabs)/home");
  });

  return (
    <HarvestScreen>
      <Text style={styles.title}>Entrá y rescatá hoy</Text>

      <View style={styles.formBlock}>
        <Text style={styles.label}>EMAIL</Text>
        <Controller
          control={form.control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor="#7d7d7d"
            />
          )}
        />
        {form.formState.errors.email ? <Text style={styles.error}>{form.formState.errors.email.message}</Text> : null}

        <Text style={styles.label}>NOMBRE</Text>
        <Controller
          control={form.control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="words"
              placeholder="Tu nombre"
              placeholderTextColor="#7d7d7d"
            />
          )}
        />
        {form.formState.errors.firstName ? <Text style={styles.error}>{form.formState.errors.firstName.message}</Text> : null}
      </View>

      <ImpactButton label="CONTINUAR" onPress={onSubmit} disabled={!form.formState.isValid} />

      <View style={styles.oauthRow}>
        <Pressable style={styles.oauthButton}>
          <Text style={styles.oauthText}>Continuar con Apple</Text>
        </Pressable>
        <Pressable style={styles.oauthButton}>
          <Text style={styles.oauthText}>Continuar con Google</Text>
        </Pressable>
      </View>

      <Text style={styles.footnote}>{APP_STRINGS.appName} usa conexión encriptada de alta seguridad.</Text>
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 46,
    lineHeight: 50,
    letterSpacing: -1,
    marginTop: theme.spacing.section,
  },
  formBlock: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
  },
  input: {
    minHeight: 48,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(171,173,174,0.3)",
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 18,
  },
  error: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
  },
  oauthRow: {
    gap: theme.spacing.md,
  },
  oauthButton: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radii.lg,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  oauthText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyMedium,
    fontSize: 18,
  },
  footnote: {
    color: "#575757",
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
