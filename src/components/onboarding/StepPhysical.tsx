"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { physicalInfoSchema, type PhysicalInfoFormData } from "@/lib/validations";
import { Ruler, Weight, Calendar } from "lucide-react";

interface StepPhysicalProps {
  values: {
    age: number | null;
    weight: number | null;
    height: number | null;
  };
  onChange: (info: { age: number; weight: number; height: number }) => void;
}

export const StepPhysical = ({ values, onChange }: StepPhysicalProps) => {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<PhysicalInfoFormData>({
    resolver: zodResolver(physicalInfoSchema),
    mode: "onChange",
    defaultValues: {
      age: values.age ?? undefined,
      weight: values.weight ?? undefined,
      height: values.height ?? undefined,
    },
  });

  const lastSentRef = useRef<string>("");
  const age = watch("age");
  const weight = watch("weight");
  const height = watch("height");

  useEffect(() => {
    if (isValid && age && weight && height) {
      const key = `${age}|${weight}|${height}`;
      if (key !== lastSentRef.current) {
        lastSentRef.current = key;
        onChange({ age, weight, height });
      }
    }
  }, [age, weight, height, isValid, onChange]);

  const fields = [
    {
      id: "age" as const,
      label: "Âge",
      placeholder: "25",
      unit: "ans",
      icon: Calendar,
    },
    {
      id: "weight" as const,
      label: "Poids",
      placeholder: "70",
      unit: "kg",
      icon: Weight,
    },
    {
      id: "height" as const,
      label: "Taille",
      placeholder: "175",
      unit: "cm",
      icon: Ruler,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Vos mesures
        </h2>
        <p className="text-muted-foreground">
          Ces données permettent de calculer vos besoins
        </p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        {fields.map((field) => {
          const Icon = field.icon;
          const error = errors[field.id];

          return (
            <div key={field.id} className="space-y-2">
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Icon className="w-4 h-4 text-primary" />
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.id}
                  type="number"
                  inputMode="numeric"
                  placeholder={field.placeholder}
                  {...register(field.id, { valueAsNumber: true })}
                  className={`pr-12 h-12 text-lg bg-card border-2 transition-all ${
                    error
                      ? "border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-primary"
                  }`}
                  aria-invalid={!!error}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {field.unit}
                </span>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
