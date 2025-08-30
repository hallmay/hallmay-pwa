import { ArrowLeft, AlertCircle } from "lucide-react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "../../shared/components/commons/Button";
import Card from "../../shared/components/commons/Card";

import { useSiloBagMovements } from "./hooks/useSilobagMovements";
import { useSiloBag } from "./hooks/useSilobag";

import PageHeader from "../../shared/components/layout/PageHeader";
import MovementsListDesktop from "./components/desktop/MovementsList";
import MovementsListMobile from "./components/mobile/MovementsList";
import SiloBagDetailsDesktop from "./components/desktop/SilobagDetails";
import SiloBagDetailsMobile from "./components/mobile/SilobagDetails";
import PageLoader from "../../shared/components/layout/PageLoader";
import ScrollableContainer from "../../shared/components/commons/ScrollableContainer";

const SiloBagDetail: FC = () => {
    const { siloId } = useParams<{ siloId: string }>();
    const navigate = useNavigate();
    const { siloBag, loading: loadingSilo, error: errorSilo } = useSiloBag(siloId);
    const { movements, loading: loadingMovements, error: errorMovements } = useSiloBagMovements(siloBag?.id);
    const isLoading = loadingSilo || loadingMovements;
    const error = errorSilo || errorMovements;

    if (isLoading) {
        return <PageLoader title="Detalle de Silo" breadcrumbs={[{ label: 'Silo...' }]} message="Cargando detalles del silo..." />;
    }
    if (error) return <div className="text-center text-red-500 py-10">Error al cargar los datos: {error.message}</div>;
    if (!siloBag) return <div className="text-center text-text-secondary py-10">No se encontró el silobolsa seleccionado.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Detalle de Silo" breadcrumbs={[{ label: `Silo ${siloBag.name}` }]} />
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Volver a Silobolsas</Button>

            <Card>
                <SiloBagDetailsMobile siloBag={siloBag} />
                <SiloBagDetailsDesktop siloBag={siloBag} />
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-text-primary mb-4">Historial de Movimientos</h3>
                {movements.length > 0 ? (
                    <>
                        <MovementsListDesktop movements={movements} />
                        <div className="md:hidden">
                            <ScrollableContainer maxHeight="60vh">
                                <MovementsListMobile movements={movements} />
                            </ScrollableContainer>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-text-secondary">
                        <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron movimientos para este silobolsa.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SiloBagDetail;