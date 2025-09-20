import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  iconBg: string;
}

const StatsCard = ({ title, value, change, isPositive, icon, iconBg }: StatsCardProps) => {
  return (
    <Card className="p-6 bg-card shadow-soft border border-border/50 hover:shadow-medium transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-dms-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${isPositive ? "text-dms-success" : "text-destructive"}`}>
              {change} from last month
            </span>
          </div>
        </div>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;