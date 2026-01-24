"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getAdminUsers, type UserListItem, type UserListResponse } from "@/lib/adminApi";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const COUNTRY_LABELS: Record<string, string> = {
  general: "Autre", senegal: "Sénégal", mali: "Mali", benin: "Bénin",
  togo: "Togo", ghana: "Ghana", cote_ivoire: "Côte d'Ivoire",
  cameroun: "Cameroun", burkina: "Burkina Faso",
  niger: "Niger", congo: "Congo",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminUsers(page, search || undefined);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} utilisateur{data.total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher par nom..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Rechercher</Button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground animate-pulse">
          Chargement...
        </div>
      ) : !data || data.users.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Aucun utilisateur trouve
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nom</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Pays</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Inscription</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Dernier mois</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((user: UserListItem) => (
                  <tr key={user.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{user.role}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {COUNTRY_LABELS[user.country] || user.country}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {user.lastSession ? `Mois ${user.lastSession.month}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {data.page} / {data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
