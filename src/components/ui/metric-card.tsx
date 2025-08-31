import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  onViewDetails?: () => void;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  onViewDetails,
  variant = "default" 
}: MetricCardProps) => {
  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "destructive":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`h-8 w-8 ${getIconColor()}`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {onViewDetails && (
          <Button 
            className="w-full mt-4" 
            variant="default"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};