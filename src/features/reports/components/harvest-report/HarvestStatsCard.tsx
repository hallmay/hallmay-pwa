import type { FC } from "react";
import StatCard from "../commons/StatCard";
import { Weight, Leaf, Tractor } from "lucide-react";
import { formatNumber } from "../../../../shared/utils";

interface HarvestStatsCardsProps {
    totalHarvestedKgs: number;
    yieldPerSown: number;
    yieldPerHarvested: number;
}

const HarvestStatsCards: FC<HarvestStatsCardsProps> = ({ totalHarvestedKgs, yieldPerSown, yieldPerHarvested }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatCard title="Kg Cosechados" value={formatNumber(totalHarvestedKgs)} unit="kgs" icon={Weight} color="orange" />
        <StatCard title="Rinde Sembrado" value={formatNumber(yieldPerSown)} unit="kg/ha" icon={Leaf} color="blue" />
        <StatCard title="Rinde Cosechado" value={formatNumber(yieldPerHarvested)} unit="kg/ha" icon={Tractor} color="green" />
    </div>
);

export default HarvestStatsCards;