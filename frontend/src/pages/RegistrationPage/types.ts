import * as z from "zod";

export interface TournamentConfig {
  id: string;
  title: string;
  minMembers: number;
  maxMembers: number;
}

export const makeSchema = (cfg: TournamentConfig, t: any) => {
  return z.object({
    format: z.literal("team"),
    teamName: z.string().min(2, t("validation.teamNameRequired")),
    teamPhone: z
      .string()
      .min(10, t("validation.phoneRequired"))
      .regex(
        /^(\+?38)?0(39|50|63|66|67|68|73|91|92|93|94|95|96|97|98|99)\d{7}$/,
        t("validation.invalidPhone"),
      ),
    captainFullName: z.string().min(2, t("validation.nameRequired")),
    captainTelegram: z.string().min(2, t("validation.telegramRequired")),
    captainInstitution: z.string().min(2, t("validation.institutionRequired")),
    members: z.array(
      z.object({
        name: z.string().min(2, t("validation.nameRequired")),
        email: z.string().email(t("validation.invalidEmail")),
        telegram: z.string().min(2, t("validation.telegramRequired")),
        institution: z.string().min(2, t("validation.institutionRequired")),
      }),
    ),
  });
};

export type RegFormData = z.infer<ReturnType<typeof makeSchema>>;
