import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "draft" | "pending" | "processing" | "completed" | "rejected";
type Role = "admin" | "user";

interface StatusBadgeProps {
  status: Status;
}

interface RoleBadgeProps {
  role: Role;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  processing: { label: "En cours", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  completed: { label: "Terminé", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  rejected: { label: "Rejeté", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

const roleConfig: Record<Role, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  user: { label: "Utilisateur", className: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.user;
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "font-medium",
        isActive 
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
      )}
    >
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  );
}
