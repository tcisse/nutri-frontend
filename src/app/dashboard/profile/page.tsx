"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserLicenseApi, activateLicenseApi } from "@/lib/licenseApi";
import { toast } from "sonner";
import { Key, Calendar, FileText, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";

interface LicenseData {
  id: string;
  licenseId: string;
  userId: string;
  activatedAt: string;
  expiresAt: string | null;
  menusGenerated: number;
  menusRemaining: number | null;
  isActive: boolean;
  license: {
    id: string;
    code: string;
    type: "QUOTA" | "SUBSCRIPTION";
    name: string;
    description: string | null;
    menuQuota: number | null;
    durationDays: number | null;
    isActive: boolean;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [licenseCode, setLicenseCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [codeError, setCodeError] = useState<string | null>(null);

  const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
  const userName = typeof window !== "undefined" ? sessionStorage.getItem("userName") : null;

  // Validate license code format
  const validateLicenseCode = (code: string): boolean => {
    // Remove any spaces and convert to uppercase
    const cleanCode = code.replace(/\s/g, "").toUpperCase();

    // Check format: NUTRI-XXXX-XXXX-XXXX
    const regex = /^NUTRI-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
    return regex.test(cleanCode);
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const fetchLicense = async () => {
    if (!userId) {
      setFetching(false);
      return;
    }

    setFetching(true);
    try {
      const data = await getUserLicenseApi(userId);
      setLicense(data);
    } catch (error) {
      // No license is not an error, just means user hasn't activated one yet
      setLicense(null);
    } finally {
      setFetching(false);
    }
  };

  const handleActivate = async () => {
    if (!userId || !licenseCode.trim()) {
      toast.error("Veuillez entrer un code de licence");
      return;
    }

    // Validate format before submitting
    const cleanCode = licenseCode.replace(/\s/g, "").toUpperCase();
    if (!validateLicenseCode(cleanCode)) {
      setCodeError("Le code doit être au format NUTRI-XXXX-XXXX-XXXX (4 caractères par segment)");
      return;
    }

    setCodeError(null);
    setLoading(true);
    try {
      await activateLicenseApi(userId, cleanCode);
      toast.success("Licence activée avec succès!");
      await fetchLicense();
      setLicenseCode("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Erreur lors de l'activation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/\s/g, "");

    // Remove all non-alphanumeric characters except hyphens
    value = value.replace(/[^A-Z0-9-]/g, "");

    // Auto-format: add hyphens after NUTRI and every 4 characters
    if (value.startsWith("NUTRI")) {
      const parts = [value.slice(0, 5)]; // "NUTRI"
      const rest = value.slice(5).replace(/-/g, ""); // Remove existing hyphens

      // Limit rest to 12 characters (3 segments of 4)
      const limitedRest = rest.slice(0, 12);

      // Split rest into chunks of 4
      for (let i = 0; i < limitedRest.length; i += 4) {
        parts.push(limitedRest.slice(i, i + 4));
      }

      value = parts.filter(p => p.length > 0).join("-");
    } else {
      // If doesn't start with NUTRI yet, limit to 5 characters
      value = value.slice(0, 5);
    }

    setLicenseCode(value);

    // Clear error when user types
    if (codeError) {
      setCodeError(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground mt-1">
              Bienvenue {userName || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au menu
          </Button>
        </div>

        {/* License Card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Ma Licence</h2>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : license ? (
            <div className="space-y-4">
              {/* License Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border">
                <div className="flex items-center gap-2">
                  {license.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {license.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    license.license.type === "QUOTA"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  }`}
                >
                  {license.license.type === "QUOTA" ? "Quota" : "Abonnement"}
                </span>
              </div>

              {/* License Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Nom de la licence
                  </span>
                  <span className="font-medium">{license.license.name}</span>
                </div>

                {license.license.description && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <span className="text-sm text-right max-w-xs">
                      {license.license.description}
                    </span>
                  </div>
                )}

                {license.license.type === "QUOTA" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Menus restants</span>
                      <span className="font-medium text-lg">
                        {license.menusRemaining ?? 0}
                        {license.license.menuQuota && ` / ${license.license.menuQuota}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Menus générés</span>
                      <span className="font-medium">{license.menusGenerated}</span>
                    </div>
                    {license.menusRemaining !== null && license.menusRemaining <= 3 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ Attention: Il ne vous reste que {license.menusRemaining} menu(s)
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date d'activation
                      </span>
                      <span className="font-medium">{formatDate(license.activatedAt)}</span>
                    </div>
                    {license.expiresAt && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Date d'expiration</span>
                          <span className="font-medium">{formatDate(license.expiresAt)}</span>
                        </div>
                        {isExpiringSoon(license.expiresAt) && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              ⚠️ Votre abonnement expire bientôt
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-6 bg-secondary/10 border border-dashed border-border rounded-lg text-center">
                <Key className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">
                  Aucune licence active
                </p>
                <p className="text-sm text-muted-foreground">
                  Activez une licence pour générer des menus
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="licenseCode" className="text-sm font-medium">
                  Code de licence
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="licenseCode"
                      type="text"
                      placeholder="NUTRI-XXXX-XXXX-XXXX"
                      value={licenseCode}
                      onChange={handleLicenseCodeChange}
                      className={`uppercase font-mono ${codeError ? "border-destructive focus:ring-destructive" : ""}`}
                      maxLength={20}
                      disabled={loading}
                    />
                    {codeError && (
                      <p className="text-sm text-destructive mt-1">{codeError}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleActivate}
                    disabled={!licenseCode.trim() || loading}
                    className="min-w-25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Activation...
                      </>
                    ) : (
                      "Activer"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format requis : NUTRI-XXXX-XXXX-XXXX (chaque segment doit avoir 4 caractères)
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
