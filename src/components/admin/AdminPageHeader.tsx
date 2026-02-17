import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminPageHeaderStat {
  label: string;
  value: string;
}

interface AdminPageHeaderProps {
  title: string;
  description: string;
  stats?: AdminPageHeaderStat[];
  action?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  stats = [],
  action,
}: AdminPageHeaderProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background">
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          {action}
        </div>

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stats.map((stat) => (
              <Badge key={stat.label} variant="secondary" className="px-3 py-1 text-xs">
                {stat.label}: <span className="ml-1 font-semibold">{stat.value}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
