import StatusColumn from "./StatusColumn";

const LogisticsBoard = ({ organizedTasks, statusOptions, openUpdateModal }) => (
    <div className="flex gap-4 overflow-x-auto md:overflow-x-visible pb-4 -webkit-overflow-scrolling-touch scroll-smooth">
        {statusOptions.map(status => (
            <StatusColumn
                key={status.value}
                status={status}
                trucks={organizedTasks[status.value] || []}
                openUpdateModal={openUpdateModal}
            />
        ))}
    </div>
);

export default LogisticsBoard;