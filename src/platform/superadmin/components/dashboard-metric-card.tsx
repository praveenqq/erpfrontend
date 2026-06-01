import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { cn } from "@/common/utils/cn";

interface DashboardMetricCardProps {
  label: string;
  value: number;
  description?: string;
  href?: string;
  tone?: "default" | "success" | "warning" | "destructive";
}

const toneClasses: Record<NonNullable<DashboardMetricCardProps["tone"]>, string> = {
  default: "",
  success: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30",
  warning: "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30",
  destructive: "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30",
};

export function DashboardMetricCard({
  label,
  value,
  description,
  href,
  tone = "default",
}: DashboardMetricCardProps) {
  const content = (
    <Card className={cn("transition hover:shadow-sm", toneClasses[tone], href && "hover:border-primary/30")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          {href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" /> : null}
        </div>
        <CardTitle className="text-3xl tabular-nums">{value.toLocaleString()}</CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">{description}</CardContent>
      ) : null}
    </Card>
  );

  if (!href) return content;

  return (
    <Link className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={href}>
      {content}
    </Link>
  );
}
