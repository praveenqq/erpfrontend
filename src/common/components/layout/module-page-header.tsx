"use client";

import Link from "next/link";
import type { ModulePageConfig } from "@/domain/models/workspace";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";

interface ModulePageHeaderProps {
  config: ModulePageConfig;
}

export function ModulePageHeader({ config }: ModulePageHeaderProps) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {config.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">
            {config.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {config.description}
          </p>
        </div>
        {(config.primaryAction || config.secondaryAction) && (
          <div className="flex flex-wrap gap-3">
            {config.secondaryAction?.href && (
              <Button variant="outline" asChild>
                <Link href={config.secondaryAction.href}>
                  {config.secondaryAction.label}
                </Link>
              </Button>
            )}
            {config.primaryAction?.href && (
              <Button asChild>
                <Link href={config.primaryAction.href}>
                  {config.primaryAction.label}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      {config.metrics && config.metrics.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {config.metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-2xl">{metric.value}</CardTitle>
              </CardHeader>
              {metric.trend && (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {metric.trend}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      {config.supportText && (
        <p className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          {config.supportText}
        </p>
      )}
    </section>
  );
}
