"use client";

import * as React from "react";
import { getCurrentProfile } from "@/lib/repositories/auth";
import type { ProfileRole } from "@/lib/types";

interface RoleContextValue {
  role: ProfileRole | null;
  loading: boolean;
  /** owner/admin/gestor: pode criar e editar dados de dominio. */
  canEdit: boolean;
  /** owner/admin: pode excluir dados de dominio. */
  canDelete: boolean;
}

const RoleContext = React.createContext<RoleContextValue>({
  role: null,
  loading: true,
  canEdit: false,
  canDelete: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<ProfileRole | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    getCurrentProfile()
      .then((profile) => {
        if (mounted) setRole(profile.role);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = React.useMemo<RoleContextValue>(() => {
    const canEdit = role !== null && role !== "operador";
    const canDelete = role === "owner" || role === "admin";
    return { role, loading, canEdit, canDelete };
  }, [role, loading]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  return React.useContext(RoleContext);
}
