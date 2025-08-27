import Papa from "papaparse";
import * as xlsx from 'xlsx';
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import type { HarvestSession, HarvestSessionRegister } from "../types";
import { typeNamesMap } from "../utils/constants";

// Función auxiliar para no repetir código
function prepareExportData(session: HarvestSession, registers: HarvestSessionRegister[]) {
    const summaryData = [{
        "Campaña": session.campaign?.name || '-',
        "Campo": session.field?.name || '-',
        "Cultivo": session.crop.name,
        "Lote": session.plot.name,
        "Has. Sembradas": session.hectares,
        "Total Kilos": session.harvested_kgs || 0,
        "Rinde estimado": session.estimated_yield.toFixed(2) || 0,
        "Rinde has. Cosechadas": session.yields.harvested.toFixed(2),
        "Rinde has. Semb": session.yields.seed.toFixed(2),
        "Rinde real vs estimado": session.yields.real_vs_projected.toFixed(2)
    }];

    const registersData = registers.map(r => ({
        "Fecha": r.created_at instanceof Timestamp ? format(r.created_at.toDate(), 'dd/MM/yyyy HH:mm') : '-',
        "Tipo": typeNamesMap[r.type],
        "Kilos": r.weight_kg,
        "Humedad": r.humidity || '-',
        "ID/Patente": r.type === 'truck' ? r.truck.license_plate : r.silo_bag.name || '-',
        "Chofer": r.type === 'truck' ? r.truck.driver : '-',
        "Destino": r.type === 'truck' ? r.destination.name : '-',
        "Ubicacion": r.type === 'silo_bag' ? r.silo_bag.location : '-',
        "Observaciones": r.details || '-'
    }));

    const fileName = `Cosecha_${session.campaign?.name}_${session.field?.name}_${session.plot.name}`.replace(/ /g, '_');

    return { summaryData, registersData, fileName };
}

export const exportToCsv = (session: HarvestSession, registers: HarvestSessionRegister[],) => {
    const { summaryData, registersData, fileName } = prepareExportData(session, registers);
    const summaryCsv = Papa.unparse(summaryData);
    const registersCsv = Papa.unparse(registersData);
    const finalCsv = `${summaryCsv}\n\n${registersCsv}`;

    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToXlsx = (session: HarvestSession, registers: HarvestSessionRegister[]) => {
    const { summaryData, registersData, fileName } = prepareExportData(session, registers);
    const summaryWorksheet = xlsx.utils.json_to_sheet(summaryData);
    const recordsWorksheet = xlsx.utils.json_to_sheet(registersData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, summaryWorksheet, "Resumen");
    xlsx.utils.book_append_sheet(workbook, recordsWorksheet, "Registros");
    xlsx.writeFile(workbook, `${fileName}.xlsx`);
};