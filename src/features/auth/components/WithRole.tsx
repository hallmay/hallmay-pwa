import { Navigate } from 'react-router';
import { memo, useMemo } from 'react';
import useAuth from '../../../shared/context/auth/AuthContext';

type AllowedRole = string;

/**
 * HOC para restringir el acceso a un componente basado en roles de usuario.
 * @param Component El componente a proteger.
 * @param allowedRoles Un array de strings con los roles permitidos (ej: ['admin', 'owner']).
 */
const withRole = <P extends object>(
    Component: React.ComponentType<P>, 
    allowedRoles: AllowedRole[]
) => {
    const AuthenticatedComponent = memo((props: P) => {
        const { currentUser } = useAuth();

        // Memoizar la verificación de acceso
        const hasAccess = useMemo(() => {
            return currentUser && allowedRoles.includes(currentUser.role);
        }, [currentUser?.role]);

        if (!hasAccess) {
            return <Navigate to="/" replace />;
        }

        return <Component {...props} />;
    });

    return AuthenticatedComponent;
};

export default withRole;