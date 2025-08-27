import type { FC } from "react";

const MovementTypeBadge: FC<{ type: string }> = ({ type }) => {
    const typeStyles: { [key: string]: { label: string; classes: string } } = {
        creation: { label: "Creación", classes: "bg-blue-100 text-blue-800" },
        harvest_entry: { label: "Entrada Cosecha", classes: "bg-green-100 text-green-800" },
        substract: { label: "Salida", classes: "bg-red-100 text-red-800" },
        loss: { label: "Ajuste/Pérdida", classes: "bg-yellow-100 text-yellow-800" },
        close: { label: "Cierre", classes: "bg-gray-200 text-gray-800" },
    };
    const style = typeStyles[type] || { label: type, classes: "bg-gray-100 text-gray-800" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style.classes}`}>{style.label}</span>;
};

export default MovementTypeBadge;