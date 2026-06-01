"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/common/components/ui/badge";
import {
  formatModuleType,
  getModuleCatalogLabels,
  type ModuleRegistryEntry,
} from "@/domain/models/module-registry";

function catalogBadgeVariant(label: string) {
  switch (label) {
    case "Core":
      return "default" as const;
    case "Paid":
      return "warning" as const;
    case "Default":
      return "success" as const;
    default:
      return "secondary" as const;
  }
}

function typeBadgeVariant(moduleType: string) {
  switch (moduleType) {
    case "HCM":
      return "default" as const;
    case "FINANCE":
      return "warning" as const;
    case "ANALYTICS":
      return "success" as const;
    default:
      return "secondary" as const;
  }
}

function DependencyList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function createModuleRegistryColumns(
  onSelect?: (entry: ModuleRegistryEntry) => void,
): ColumnDef<ModuleRegistryEntry>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <button
          className="font-mono text-sm font-semibold text-primary hover:underline"
          onClick={() => onSelect?.(row.original)}
          type="button"
        >
          {row.original.code}
        </button>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: "moduleType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={typeBadgeVariant(row.original.moduleType)}>
          {formatModuleType(row.original.moduleType)}
        </Badge>
      ),
    },
    {
      id: "catalogStatus",
      header: "Catalog status",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {getModuleCatalogLabels(row.original).map((label) => (
            <Badge key={label} variant={catalogBadgeVariant(label)}>
              {label}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "dependsOnModules",
      header: "Module dependencies",
      cell: ({ row }) => (
        <DependencyList emptyLabel="None" items={row.original.dependsOnModules} />
      ),
    },
    {
      accessorKey: "platformCapabilities",
      header: "Platform capabilities",
      cell: ({ row }) => (
        <DependencyList emptyLabel="None" items={row.original.platformCapabilities} />
      ),
    },
  ];
}
