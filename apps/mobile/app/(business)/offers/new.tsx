import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { HarvestScreen } from "../../../src/components/harvest-screen";
import { ImpactButton } from "../../../src/components/impact-button";
import { mobileApi } from "../../../src/lib/api-client";
import { theme } from "../../../src/theme";

const schema = z.object({
  businessId: z.string().uuid("Business ID inválido"),
  title: z.string().min(4),
  description: z.string().min(8),
  category: z.string().min(2),
  originalPriceArs: z.coerce.number().int().positive(),
  rescuePriceArs: z.coerce.number().int().positive(),
  quantityTotal: z.coerce.number().int().positive(),
  pickupStartAt: z.string().min(8),
  pickupEndAt: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function BusinessCreateOfferScreen() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessId: "",
      title: "",
      description: "",
      category: "PANADERIA",
      originalPriceArs: 3000,
      rescuePriceArs: 1200,
      quantityTotal: 15,
      pickupStartAt: new Date().toISOString(),
      pickupEndAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mobileApi.createBusinessOffer({
      ...values,
      imageUrls: [],
      tags: [],
    });
  });

  return (
    <HarvestScreen>
      <Text style={styles.title}>Nueva oferta</Text>
      <View style={styles.form}>
        {[
          { name: "businessId", label: "Business ID" },
          { name: "title", label: "Título" },
          { name: "description", label: "Descripción" },
          { name: "category", label: "Categoría" },
          { name: "originalPriceArs", label: "Precio original" },
          { name: "rescuePriceArs", label: "Precio rescate" },
          { name: "quantityTotal", label: "Cantidad" },
        ].map((field) => (
          <View key={field.name}>
            <Text style={styles.label}>{field.label}</Text>
            <Controller
              name={field.name as keyof FormValues}
              control={form.control}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value)}
                  onChangeText={onChange}
                  placeholder={field.label}
                  keyboardType={typeof value === "number" ? "number-pad" : "default"}
                />
              )}
            />
          </View>
        ))}
      </View>

      <ImpactButton label="PUBLICAR OFERTA" onPress={onSubmit} />
    </HarvestScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: theme.spacing.section,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 48,
    lineHeight: 52,
  },
  form: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    minHeight: 44,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(171,173,174,0.3)",
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
  },
});
