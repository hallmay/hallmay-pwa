// src/pages/silobags/Silobags.tsx
import { useState, lazy, Suspense } from "react";
import Filters from "./components/Filters";
import SiloBagCard from "./components/SilobagCard";
import PageHeader from "../../shared/components/layout/PageHeader";
import { useSiloBags } from "./hooks/useSilobags";
import { useCampaignFields } from "../../shared/hooks/field/useCampaignFields";
import { useActiveCampaign } from "../../shared/hooks/campaign/useActiveCampaign";
import Button from "../../shared/components/commons/Button";
import { PlusCircle } from "lucide-react";
import { useCrops } from "../../shared/hooks/crop/useCrops";
import { useSiloBagManager } from "./hooks/useSilobagManager";
import PageLoader from "../../shared/components/layout/PageLoader";
import ScrollableContainer from "../../shared/components/commons/ScrollableContainer";
import FlexContainer from "../../shared/components/commons/FlexContainer";

// Lazy load modals
const CreateSiloBagModal = lazy(() => import("./components/modals/CreateSilobagModal"));
const ExtractKgsModal = lazy(() => import("./components/modals/ExtractKgsModal"));
const CloseSiloBagModal = lazy(() => import("./components/modals/CloseSilobagModal"));

const SiloBags = () => {
    const [selectedField, setSelectedField] = useState('');
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('active');

    // Hooks de datos
    const { campaign } = useActiveCampaign();
    const { campaignFields } = useCampaignFields();
    const { crops } = useCrops();
    const { siloBags, loading, error } = useSiloBags(campaign?.id ?? null, selectedField, { fieldId: selectedField, cropId: selectedCrop, status: selectedStatus });

    // 2. Instanciamos nuestro nuevo manager, pasándole los datos que necesita
    const manager = campaign ? useSiloBagManager(campaign, campaignFields, crops) : null;


    if (loading) {
        return <PageLoader title="Silobolsas" breadcrumbs={[{ label: 'Silobolsas' }]} message="Cargando silobolsas..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader title="Silobolsas" breadcrumbs={[{ label: 'Silobolsas' }]} />
                <div className="text-center text-red-500 py-8">Error: {error}</div>
            </div>
        );
    }

    return (
        <>
            <FlexContainer className="space-y-6 h-[calc(100vh-8rem)]">
                <PageHeader title="Silobolsas" breadcrumbs={[{ label: 'Silobolsas' }]}>
                    <div className="w-full md:w-auto">
                        {/* 3. Los eventos ahora llaman a los manejadores del hook */}
                        <Button
                            className="w-full sm:px-10 sm:py-3 sm:text-base"
                            icon={PlusCircle}
                            onClick={() => manager?.openModal('create')}
                        >
                            Crear Silobolsa
                        </Button>
                    </div>
                </PageHeader>

                <Filters
                    selectedField={selectedField}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    onFieldChange={setSelectedField}
                    fields={campaignFields || []}
                    crops={crops || []}
                    selectedCrop={selectedCrop}
                    onCropChange={setSelectedCrop}
                />
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Silobolsas</h3>
                    <ScrollableContainer maxHeight="65vh" showScrollbarOnDesktop={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {siloBags.length > 0 ? (
                                siloBags.map(silobag => (
                                    <SiloBagCard
                                        key={silobag.id}
                                        silo={silobag}
                                        onExtract={() => manager?.openModal('extract', silobag)}
                                        onClose={() => manager?.openModal('close', silobag)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center text-text-secondary py-8">
                                    {selectedField !== '' ? <p>No se encontraron silobolsas con los filtros seleccionados.</p> : <p>Por favor, seleccione un campo.</p>}
                                </div>
                            )}
                        </div>
                    </ScrollableContainer>
                </div>
            </FlexContainer>
            
            {manager?.modalState.type === 'create' && (
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-4 rounded">Cargando...</div></div>}>
                    <CreateSiloBagModal
                        isOpen={true}
                        onClose={manager.closeModal}
                        onSubmit={manager.handlers.create}
                        fields={campaignFields || []}
                        crops={crops || []}
                    />
                </Suspense>
            )}

            {manager?.modalState.data && (
                <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-4 rounded">Cargando...</div></div>}>
                    <ExtractKgsModal
                        isOpen={manager?.modalState.type === 'extract'}
                        onClose={manager?.closeModal}
                        siloBag={manager?.modalState.data}
                        onSubmit={manager?.handlers.extract}
                    />
                    <CloseSiloBagModal
                        isOpen={manager?.modalState.type === 'close'}
                        onClose={manager?.closeModal}
                        siloBag={manager?.modalState.data}
                        onSubmit={manager?.handlers.close} 
                    />
                </Suspense>
            )}
        </>
    );
};

export default SiloBags;