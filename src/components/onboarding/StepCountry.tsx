"use client";

import { cn } from "@/lib/utils";
import type { Country } from "@/types";
import { COUNTRY_LABELS } from "@/types";
import { MapPin } from "lucide-react";

interface StepCountryProps {
  value: Country | null;
  onChange: (country: Country) => void;
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

export const StepCountry = ({ value, onChange }: StepCountryProps) => {
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
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option.value);
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

      {/* Info note */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground opacity-0 animate-fade-up stagger-5">
        <MapPin className="w-4 h-4" />
        <span>Les repas seront adaptés aux aliments de votre région</span>
      </div>
    </div>
  );
};
