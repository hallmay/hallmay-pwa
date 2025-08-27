import { PlayCircle } from "lucide-react";
import { useNavigate } from "react-router";
import type { FC } from "react";
import Button from "../../../shared/components/commons/Button";


interface Session {
    id: string;
    name: string;
    field: { name: string };
    crop: { name: string };
    progress?: number;
}

const SessionCardList: FC<{ sessions: Session[], showProgress?: boolean }> = ({ sessions, showProgress = false }) => {
    const navigate = useNavigate();
    const SessionCardComponent = ({ session }: { session: Session }) => (
        <div className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`harvest-sessions/${session.id}/details`)}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-900">Lote {session.name}</p>
                    <p className="text-gray-500 text-sm">{session.field.name} - {session.crop.name}</p>
                </div>
                {showProgress ? (
                    <span className="font-bold text-gray-900">{session.progress || 0}%</span>
                ) : (
                    <Button
                        variant="secondary"
                        icon={PlayCircle}
                        className="!px-3 !py-1.5 !text-xs !rounded-full !bg-green-100 !text-green-800 hover:!bg-green-200"
                    >
                        Iniciar
                    </Button>
                )}
            </div>
            {showProgress && (
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-darker h-2 rounded-full transition-all duration-300"
                            style={{ width: `${session.progress || 0}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-3">
            {sessions.length > 0 ? (
                sessions.map(session => (
                    <SessionCardComponent key={session.id} session={session} />
                ))
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>No hay lotes {showProgress ? 'en progreso' : 'pendientes'}.</p>
                </div>
            )}
        </div>
    );
};

export default SessionCardList;