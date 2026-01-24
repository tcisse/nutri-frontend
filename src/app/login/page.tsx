"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUserApi, calculateCalories } from "@/lib/api";
import { setUserToken } from "@/lib/cookies";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import type { UserProfile, ActivityLevel, Goal, WeightChangeRate, Country } from "@/types";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { user, token } = await loginUserApi(email, password);
      setUserToken(token);

      const fullName = `${user.firstName} ${user.lastName}`.trim();
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userName", user.firstName);
      sessionStorage.setItem("userFullName", fullName);

      // If user has a latest session, load their plan
      const latestSession = user.sessions?.[0];
      if (latestSession) {
        const profile: UserProfile = {
          gender: user.gender as "male" | "female",
          age: latestSession.age,
          weight: latestSession.weight,
          height: user.height,
          activity: latestSession.activityLevel as ActivityLevel,
          goal: latestSession.goal as Goal,
          rate: latestSession.rate as WeightChangeRate | undefined,
          country: user.country as Country,
        };

        const result = await calculateCalories(profile);

        sessionStorage.setItem("sessionId", latestSession.id);
        sessionStorage.setItem("userProfile", JSON.stringify(profile));
        sessionStorage.setItem("nutritionPlan", JSON.stringify(result));
        sessionStorage.setItem("userMonth", String(latestSession.month));

        toast.success(`Bon retour, ${user.firstName} !`);
        router.push("/dashboard");
      } else {
        // No session yet — redirect to new session flow
        toast.success(`Bienvenue, ${user.firstName} !`);
        router.push("/new-session");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Email ou mot de passe incorrect"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="text-muted-foreground text-sm">
            Accédez à votre plan alimentaire
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="h-12 text-lg bg-card border-2 border-border focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="pr-12 h-12 text-lg bg-card border-2 border-border focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !email || !password}
            className="w-full h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/onboarding" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
