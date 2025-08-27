import type { FC } from "react";
import Card from "../../../../shared/components/commons/Card";
import { formatNumber } from "../../../../shared/utils";

interface HarvestProgressCardProps {
    harvestedHectares: number;
    hectares: number;
}

const HarvestProgressCard: FC<HarvestProgressCardProps> = ({ harvestedHectares, hectares }) => {

    const progress = (harvestedHectares / hectares) * 100;

    return (
        <Card className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Avance de Cosecha</h3>
            <div className="text-3xl font-bold text-text-primary mb-4">{progress.toFixed(1)}%</div>
            <div className="w-full bg-background rounded-full h-3 mb-2  overflow-hidden">
                <div
                    className="bg-primary-darker h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-text-secondary text-sm">
                {formatNumber(harvestedHectares)} ha / {formatNumber(hectares)} ha
            </p>
        </Card>
    )
};

export default HarvestProgressCard;