"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activateLicenseApi } from "@/lib/api";
import { Sparkles, KeyRound, Loader2, CheckCircle2 } from "lucide-react";

export default function ActivatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("userId");
    if (!id) {
      // Not logged in — redirect to login, then come back here
      router.replace("/login?redirect=/activate");
    } else {
      setUserId(id);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !code.trim()) return;

    setIsLoading(true);
    try {
      await activateLicenseApi(userId, code.trim().toUpperCase());
      setActivated(true);
      toast.success("Licence activée avec succès !");

      setTimeout(() => {
        const sessionId = sessionStorage.getItem("sessionId");
        router.push(sessionId ? "/dashboard" : "/new-session");
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code de licence invalide");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) return null;

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
          <h1 className="text-2xl font-bold text-foreground">Activer ma licence</h1>
          <p className="text-muted-foreground text-sm">
            Entrez la clé reçue après votre achat pour accéder à votre plan alimentaire
          </p>
        </div>

        {activated ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-14 h-14 text-primary" />
            <p className="text-lg font-semibold text-foreground">Licence activée !</p>
            <p className="text-sm text-muted-foreground">Redirection en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Clé de licence
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="h-12 text-base font-mono tracking-widest bg-card border-2 border-border focus:border-primary uppercase"
                autoComplete="off"
                spellCheck={false}
                required
              />
              <p className="text-xs text-muted-foreground">
                Votre clé se trouve dans l&apos;email de confirmation ou sur la page d&apos;achat Chariow.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !code.trim()}
              className="w-full h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Activer ma licence"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
