import * as z from "zod";

export interface CustomField {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
}

export interface TournamentConfig {
  id: string;
  title: string;
  minMembers: number;
  maxMembers: number;
  customFields?: CustomField[];
}

export const makeSchema = (cfg: TournamentConfig, t: any) => {
  const customFieldsShape: z.ZodRawShape = {};

  if (cfg.customFields) {
    cfg.customFields.forEach((field) => {
      if (field.required) {
        customFieldsShape[field.id] = z
          .string()
          .min(
            1,
            t(
              "validation.requiredCustom",
              `Поле "${field.label}" є обов'язковим`,
            ),
          );
      } else {
        customFieldsShape[field.id] = z.string().optional();
      }
    });
  }

  return z
    .object({
      format: z.enum(["team", "solo"]),
      teamName: z.string().optional(),
      captainFullName: z.string().optional(),
      customFields: z.object(customFieldsShape).optional(),
      members: z.array(
        z.object({
          name: z
            .string()
            .min(2, t("validation.nameRequired", "Введіть ПІБ або нікнейм")),
          email: z
            .string()
            .email(t("validation.invalidEmail", "Невірний email")),
          customFields: z.object(customFieldsShape).optional(),
        }),
      ),
    })
    .superRefine((data, ctx) => {
      if (
        data.format === "team" &&
        (!data.teamName || data.teamName.trim().length < 2)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.teamNameRequired", "Введіть назву команди"),
          path: ["teamName"],
        });
      }
    });
};

export type RegFormData = z.infer<ReturnType<typeof makeSchema>>;
