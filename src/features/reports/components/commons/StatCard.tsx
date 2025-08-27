import Card from "../../../../shared/components/commons/Card";

const StatCard = ({ title, value, unit, icon: Icon, color = 'green' }) => {
    const colorClasses = {
        green: 'bg-primary-light text-primary-dark',
        blue: 'bg-blue-100 text-blue-800',
        orange: 'bg-orange-100 text-orange-800',
    };

    return (
        <Card className="flex-1">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-text-secondary text-sm">{title}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-gray-900">{value}</span>
                        <span className="text-sm text-text-secondary">{unit}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default StatCard;