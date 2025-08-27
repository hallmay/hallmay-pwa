import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { FC } from "react";
import { Card } from "../../../../shared/components/commons/Card";

interface YieldPerformanceCardProps {
    realVsProjected: number;
    estimatedYield: number;
    realYield: number;
}

const YieldPerformanceCard: FC<YieldPerformanceCardProps> = ({ realVsProjected, estimatedYield, realYield }) => {
    const percentageDifference = estimatedYield > 0 ? (realVsProjected / estimatedYield) * 100 : 0;
    const isPositive = realVsProjected >= 0;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <Card className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Rendimiento vs. Estimado</h3>
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-text-primary">{realYield.toFixed(0)}</span>
                        <span className="text-text-secondary">kg/ha</span>
                    </div>
                    <p className="text-text-secondary text-sm">Estimado: {estimatedYield.toFixed(0)} kg/ha</p>
                </div>
                <div className="text-right">
                    <div className={`flex items-center ${colorClass}`}>
                        <Icon />
                        <span className="text-xl font-bold">{percentageDifference.toFixed(1)}%</span>
                    </div>
                    <p className={`text-sm ${colorClass}`}>
                        {isPositive ? '+' : ''}{realVsProjected.toFixed(0)} kg/ha
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default YieldPerformanceCard;