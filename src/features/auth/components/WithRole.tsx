import { Navigate } from 'react-router';
import useAuth from '../../../shared/context/auth/AuthContext';

/**
 * HOC para restringir el acceso a un componente basado en roles de usuario.
 * @param Component El componente a proteger.
 * @param allowedRoles Un array de strings con los roles permitidos (ej: ['admin', 'owner']).
 */
const withRole = (Component, allowedRoles) => {
    const AuthenticatedComponent = (props) => {
        const { currentUser } = useAuth();

        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
            return <Navigate to="/" />;
        }

        return <Component {...props} />;
    };

    return AuthenticatedComponent;
};

export default withRole;