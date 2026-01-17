import { z } from "zod";

export const physicalInfoSchema = z.object({
  age: z
    .number({ message: "L'âge doit être un nombre valide" })
    .min(10, "L'âge minimum est 10 ans")
    .max(120, "L'âge maximum est 120 ans"),
  weight: z
    .number({ message: "Le poids doit être un nombre valide" })
    .min(20, "Le poids minimum est 20 kg")
    .max(300, "Le poids maximum est 300 kg"),
  height: z
    .number({ message: "La taille doit être un nombre valide" })
    .min(100, "La taille minimum est 100 cm")
    .max(250, "La taille maximum est 250 cm"),
});

export type PhysicalInfoFormData = z.infer<typeof physicalInfoSchema>;
