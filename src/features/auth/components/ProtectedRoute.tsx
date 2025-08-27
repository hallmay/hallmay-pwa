import { Navigate, Outlet } from 'react-router';
import useAuth from '../../../shared/context/auth/AuthContext';

const PrivateRoute = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;