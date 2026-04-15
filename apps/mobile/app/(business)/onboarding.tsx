import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { HarvestScreen } from "../../src/components/harvest-screen";
import { ImpactButton } from "../../src/components/impact-button";
import { theme } from "../../src/theme";

export default function BusinessOnboardingScreen() {
  const form = useForm({
    defaultValues: {
      businessName: "",
      cuit: "",
      address: "",
      category: "",
    },
  });

  return (
    <HarvestScreen>
      <Text style={styles.title}>Registro de local</Text>
      <Text style={styles.subtitle}>Completá los datos para activar tu panel business.</Text>

      <View style={styles.form}>
        {[
          { name: "businessName", label: "Nombre del local" },
          { name: "cuit", label: "CUIT (opcional)" },
          { name: "address", label: "Dirección" },
          { name: "category", label: "Categoría" },
        ].map((field) => (
          <View key={field.name}>
            <Text style={styles.label}>{field.label}</Text>
            <Controller
              control={form.control}
              name={field.name as never}
              render={({ field: { value, onChange } }) => (
                <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={field.label} />
              )}
            />
          </View>
        ))}
      </View>

      <ImpactButton
        label="CONTINUAR"
        onPress={() => {
          router.replace("/(business)/dashboard");
        }}
      />
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.section,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 52,
    lineHeight: 54,
  },
  subtitle: {
    color: "#5d5d5d",
    fontFamily: theme.typography.fontFamily,
    fontSize: 17,
    lineHeight: 26,
  },
  form: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: theme.spacing.xs,
  },
  input: {
    minHeight: 46,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(171,173,174,0.3)",
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 17,
  },
});
