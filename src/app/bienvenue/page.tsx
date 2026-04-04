"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, KeyRound, Mail, ShoppingBag, UserCircle, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

const steps = [
  {
    icon: ShoppingBag,
    title: "Achat confirmé",
    description: "Vous venez d'acheter votre plan alimentaire sur notre boutique.",
  },
  {
    icon: Mail,
    title: "Récupérez votre clé",
    description:
      "Votre clé de licence se trouve dans l'email de confirmation ou sur la page d'achat.",
  },
  {
    icon: UserCircle,
    title: "Créez votre compte",
    description: "Inscrivez-vous et entrez votre clé de licence pour débloquer votre programme.",
  },
  {
    icon: KeyRound,
    title: "Accédez à votre programme",
    description: "Votre plan alimentaire personnalisé est prêt à être consulté.",
  },
];

export default function ActivatePage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.4 },
        colors: ["#22c55e", "#16a34a", "#4ade80", "#bbf7d0", "#ffffff"],
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo + titre */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Merci pour votre achat ! 🎉</h1>
            <p className="text-muted-foreground text-sm">
              Votre plan alimentaire vous attend. Suivez les étapes ci-dessous pour y accéder.
            </p>
          </div>
        </div>

        {/* Étapes */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Procédure d&apos;activation
          </p>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3 items-start">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild size="lg" className="w-full h-12">
            <Link href="/onboarding">
              <UserPlus className="w-4 h-4 mr-2" />
              Créer mon compte
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full h-12">
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              J&apos;ai déjà un compte
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
