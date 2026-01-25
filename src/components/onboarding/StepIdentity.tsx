"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { identitySchema, type IdentityFormData } from "@/lib/validations";
import { User, Lock, Eye, EyeOff, Mail, Users } from "lucide-react";
import type { Gender } from "@/types";

interface StepIdentityProps {
  values: {
    fullName: string | null;
    email: string | null;
    password: string | null;
    gender: Gender | null;
  };
  onChange: (info: { fullName: string; email: string; password: string; gender: Gender }) => void;
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Homme" },
  { value: "female", label: "Femme" },
];

export const StepIdentity = ({ values, onChange }: StepIdentityProps) => {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    mode: "onChange",
    defaultValues: {
      fullName: values.fullName ?? undefined,
      email: values.email ?? undefined,
      password: values.password ?? undefined,
    },
  });

  const [selectedGender, setSelectedGender] = useState<Gender | null>(values.gender);
  const [showPassword, setShowPassword] = useState(false);
  const lastSentRef = useRef<string>("");

  const fullName = watch("fullName");
  const email = watch("email");
  const password = watch("password");

  useEffect(() => {
    if (isValid && fullName && email && password && selectedGender) {
      const key = `${fullName}|${email}|${password}|${selectedGender}`;
      if (key !== lastSentRef.current) {
        lastSentRef.current = key;
        onChange({ fullName, email, password, gender: selectedGender });
      }
    }
  }, [fullName, email, password, isValid, selectedGender, onChange]);

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    if (isValid && fullName && email && password) {
      const key = `${fullName}|${email}|${password}|${gender}`;
      lastSentRef.current = key;
      onChange({ fullName, email, password, gender });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Créez votre compte
        </h2>
        <p className="text-muted-foreground">
          Vos informations de base pour commencer
        </p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {/* Full Name */}
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <User className="w-4 h-4 text-primary" />
            Nom complet
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Prénom Nom"
            {...register("fullName")}
            className={`h-12 text-lg bg-card border-2 transition-all ${
              errors.fullName
                ? "border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary"
            }`}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-primary" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            {...register("email")}
            className={`h-12 text-lg bg-card border-2 transition-all ${
              errors.email
                ? "border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary"
            }`}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-primary" />
            Mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              {...register("password")}
              className={`pr-12 h-12 text-lg bg-card border-2 transition-all ${
                errors.password
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border focus:border-primary"
              }`}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Gender Selection */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Sexe
          </Label>
          <Select
            value={selectedGender ?? undefined}
            onValueChange={(value) => handleGenderSelect(value as Gender)}
          >
            <SelectTrigger className="h-12 w-full text-lg bg-card border-2 border-border focus:border-primary">
              <SelectValue placeholder="Sélectionnez votre sexe" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
