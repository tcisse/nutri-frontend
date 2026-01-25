"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminLicensesApi,
  createLicenseApi,
  deactivateLicenseApi,
} from "@/lib/licenseApi";
import { toast } from "sonner";
import {
  Plus,
  Filter,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Ban,
} from "lucide-react";

interface License {
  id: string;
  code: string;
  type: "QUOTA" | "SUBSCRIPTION";
  name: string;
  description: string | null;
  menuQuota: number | null;
  durationDays: number | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  activations: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [licenseType, setLicenseType] = useState<"QUOTA" | "SUBSCRIPTION">("QUOTA");
  const [licenseName, setLicenseName] = useState("");
  const [licenseDescription, setLicenseDescription] = useState("");
  const [menuQuota, setMenuQuota] = useState<number>(10);
  const [durationDays, setDurationDays] = useState<number>(30);

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [licenses, typeFilter, statusFilter, searchQuery]);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const data = await getAdminLicensesApi();
      setLicenses(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors du chargement des licences");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...licenses];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((l) => l.type === typeFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((l) => l.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((l) => !l.isActive);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.code.toLowerCase().includes(query) ||
          l.name.toLowerCase().includes(query)
      );
    }

    setFilteredLicenses(filtered);
  };

  const handleCreateLicense = async () => {
    if (!licenseName.trim()) {
      toast.error("Veuillez entrer un nom pour la licence");
      return;
    }

    if (licenseType === "QUOTA" && menuQuota < 1) {
      toast.error("Le quota doit être au moins 1");
      return;
    }

    if (licenseType === "SUBSCRIPTION" && durationDays < 1) {
      toast.error("La durée doit être au moins 1 jour");
      return;
    }

    setCreating(true);
    try {
      await createLicenseApi({
        type: licenseType,
        name: licenseName.trim(),
        description: licenseDescription.trim() || undefined,
        menuQuota: licenseType === "QUOTA" ? menuQuota : undefined,
        durationDays: licenseType === "SUBSCRIPTION" ? durationDays : undefined,
      });

      toast.success("Licence créée avec succès!");
      setShowCreateDialog(false);
      resetForm();
      await fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papiers");
  };

  const handleDeactivate = async (licenseId: string, licenseName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir désactiver la licence "${licenseName}" ?`)) {
      return;
    }

    try {
      await deactivateLicenseApi(licenseId, "Désactivée par l'admin");
      toast.success("Licence désactivée");
      await fetchLicenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la désactivation");
    }
  };

  const resetForm = () => {
    setLicenseType("QUOTA");
    setLicenseName("");
    setLicenseDescription("");
    setMenuQuota(10);
    setDurationDays(30);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Licences</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez les licences utilisateur
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer une licence
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-medium">Filtres</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeFilter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="typeFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="QUOTA">Quota</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilter">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <Input
                id="search"
                type="text"
                placeholder="Code ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Licenses Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune licence trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-medium text-muted-foreground">Code</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Nom</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Quota/Durée</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Activations</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Statut</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((license) => (
                    <tr key={license.id} className="border-b border-border hover:bg-secondary/20">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                            {license.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyCode(license.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{license.name}</p>
                          {license.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {license.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            license.type === "QUOTA"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          }`}
                        >
                          {license.type === "QUOTA" ? "Quota" : "Abonnement"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {license.type === "QUOTA"
                            ? `${license.menuQuota} menus`
                            : `${license.durationDays} jours`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium">{license.activations.length}</span>
                        {license.activations.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {license.activations[0].user.email}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {license.isActive ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(license.createdAt)}
                        </span>
                      </td>
                      <td className="p-4">
                        {license.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(license.id, license.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Désactiver
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create License Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle licence</DialogTitle>
            <DialogDescription>
              Générez une licence pour permettre aux utilisateurs de générer des menus
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de licence</Label>
              <Select
                value={licenseType}
                onValueChange={(value) => setLicenseType(value as "QUOTA" | "SUBSCRIPTION")}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUOTA">Quota (nombre de menus limité)</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Abonnement (période limitée)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom de la licence *</Label>
              <Input
                id="name"
                placeholder="Ex: Pack 10 menus"
                value={licenseName}
                onChange={(e) => setLicenseName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Description de la licence..."
                value={licenseDescription}
                onChange={(e) => setLicenseDescription(e.target.value)}
                rows={3}
              />
            </div>

            {licenseType === "QUOTA" ? (
              <div className="space-y-2">
                <Label htmlFor="menuQuota">Nombre de menus *</Label>
                <Input
                  id="menuQuota"
                  type="number"
                  min={1}
                  max={1000}
                  value={menuQuota}
                  onChange={(e) => setMenuQuota(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Nombre de menus mensuels que l'utilisateur pourra générer
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="durationDays">Durée (jours) *</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min={1}
                  max={3650}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Durée de validité de l'abonnement en jours
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
              disabled={creating}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateLicense} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
