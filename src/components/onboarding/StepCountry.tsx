"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Country } from "@/types";
import { COUNTRY_LABELS } from "@/types";
import { MapPin, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepCountryProps {
  value: Country | null;
  licenseCode: string | null;
  onChange: (country: Country, licenseCode: string) => void;
}

const countryOptions: { value: Country; flag: string }[] = [
  { value: "senegal", flag: "🇸🇳" },
  { value: "mali", flag: "🇲🇱" },
  { value: "benin", flag: "🇧🇯" },
  { value: "togo", flag: "🇹🇬" },
  { value: "ghana", flag: "🇬🇭" },
  { value: "cote_ivoire", flag: "🇨🇮" },
  { value: "cameroun", flag: "🇨🇲" },
  { value: "guinea", flag: "🇬🇳" },
  { value: "burkina", flag: "🇧🇫" },
  { value: "niger", flag: "🇳🇪" },
  { value: "congo", flag: "🇨🇬" },
  { value: "nigeria", flag: "🇳🇬" },
  { value: "general", flag: "🌍" },
];

export const StepCountry = ({ value, licenseCode, onChange }: StepCountryProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(value);
  const [code, setCode] = useState<string>(licenseCode || "");

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    if (code.trim()) {
      onChange(country, code.trim());
    }
  };

  const handleLicenseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.toUpperCase().replace(/\s/g, "");

    // Remove all non-alphanumeric characters except hyphens
    newValue = newValue.replace(/[^A-Z0-9-]/g, "");

    // Auto-format: add hyphens after NUTRI and every 4 characters
    if (newValue.startsWith("NUTRI")) {
      const parts = [newValue.slice(0, 5)]; // "NUTRI"
      const rest = newValue.slice(5).replace(/-/g, ""); // Remove existing hyphens

      // Limit rest to 12 characters (3 segments of 4)
      const limitedRest = rest.slice(0, 12);

      // Split rest into chunks of 4
      for (let i = 0; i < limitedRest.length; i += 4) {
        parts.push(limitedRest.slice(i, i + 4));
      }

      newValue = parts.filter(p => p.length > 0).join("-");
    } else {
      // If doesn't start with NUTRI yet, limit to 5 characters
      newValue = newValue.slice(0, 5);
    }

    setCode(newValue);
    if (selectedCountry && newValue.trim()) {
      onChange(selectedCountry, newValue.trim());
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Dans quel pays habitez-vous ?
        </h2>
        <p className="text-muted-foreground">
          Pour vous proposer des aliments locaux adaptés
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
        {countryOptions.map((option, index) => {
          const isSelected = selectedCountry === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleCountryChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCountryChange(option.value);
                }
              }}
              tabIndex={0}
              aria-label={`Sélectionner ${COUNTRY_LABELS[option.value]}`}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group opacity-0 animate-fade-up",
                `stagger-${Math.min(index + 1, 5)}`,
                isSelected
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                  <svg
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Flag */}
              <span
                className={cn(
                  "text-3xl mb-2 transition-transform",
                  isSelected ? "scale-110" : "group-hover:scale-105"
                )}
                role="img"
                aria-hidden="true"
              >
                {option.flag}
              </span>

              {/* Label */}
              <p
                className={cn(
                  "font-medium text-sm transition-colors text-center",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {COUNTRY_LABELS[option.value]}
              </p>
            </button>
          );
        })}
      </div>

      {/* License Code (Required) */}
      <div className="max-w-md mx-auto space-y-2 opacity-0 animate-fade-up stagger-6">
        <Label
          htmlFor="licenseCode"
          className="text-sm font-medium text-foreground flex items-center gap-2"
        >
          <Key className="w-4 h-4 text-primary" />
          Code de licence <span className="text-destructive">*</span>
        </Label>
        <Input
          id="licenseCode"
          type="text"
          placeholder="NUTRI-XXXX-XXXX-XXXX"
          value={code}
          onChange={handleLicenseCodeChange}
          className="h-12 text-lg bg-card border-2 border-border focus:border-primary uppercase font-mono"
          maxLength={20}
          required
        />
        <p className="text-xs text-muted-foreground">
          Format requis : NUTRI-XXXX-XXXX-XXXX (chaque segment doit avoir 4 caractères)
        </p>
      </div>

      {/* Info note */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground opacity-0 animate-fade-up stagger-7">
        <MapPin className="w-4 h-4" />
        <span>Les repas seront adaptés aux aliments de votre région</span>
      </div>
    </div>
  );
};
