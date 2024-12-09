import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const InsightCard = ({ title, description, icon: Icon }: InsightCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="w-6 h-6 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base whitespace-pre-line">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};