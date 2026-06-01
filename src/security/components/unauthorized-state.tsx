"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { ROUTES } from "@/common/navigation/routes";

interface UnauthorizedStateProps {
  title?: string;
  description?: string;
  showHomeLink?: boolean;
}

export function UnauthorizedState({
  title = "You do not have access to this area",
  description = "Your account is signed in, but it does not include the permission required for this page. Ask your platform or organization administrator if you need access.",
  showHomeLink = true,
}: UnauthorizedStateProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/70 text-amber-950 shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-amber-800/80">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-800/90">
        <p>
          Access is checked against the same roles and permissions enforced by the server, so
          restricted actions are blocked before a request is sent.
        </p>
        {showHomeLink ? (
          <Button asChild size="sm" variant="outline">
            <Link href={ROUTES.HOME}>Return to home</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
