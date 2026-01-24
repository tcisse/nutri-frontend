"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Salad, Heart, Target } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  // Check if user already has a plan
  useEffect(() => {
    const plan = sessionStorage.getItem("nutritionPlan");
    if (plan) {
      // User has a plan, could redirect to dashboard
      // For now, let them choose
    }
  }, []);

  const handleStart = () => {
    router.push("/onboarding");
  };

  const features = [
    {
      icon: Target,
      title: "Personnalisé",
      description: "Adapté à vos objectifs",
    },
    {
      icon: Salad,
      title: "Local",
      description: "Aliments de votre région",
    },
    {
      icon: Heart,
      title: "Sain",
      description: "Équilibré et nutritif",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 opacity-0 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4 opacity-0 animate-fade-up stagger-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Votre Plan Alimentaire
              <span className="block text-primary mt-2">Personnalisé</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Créez un programme nutritionnel adapté à vos besoins, vos
              objectifs et les aliments de votre région.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto opacity-0 animate-fade-up stagger-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="opacity-0 animate-fade-up stagger-3">
            <Button
              size="lg"
              onClick={handleStart}
              className="h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              aria-label="Commencer le questionnaire"
            >
              Commencer
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground opacity-0 animate-fade-up stagger-4">
            Répondez à quelques questions • Moins de 2 minutes
          </p>

          {/* Login link */}
          <p className="text-sm text-muted-foreground opacity-0 animate-fade-up stagger-4">
            Déjà inscrit ?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-primary font-medium hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 NutriPlan • Votre santé, notre priorité
        </p>
      </footer>
    </div>
  );
}
