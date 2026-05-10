import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // no token = direction login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // décoder le token
    let decodedToken = null;
    try {
        decodedToken = jwtDecode(token);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
    }

    // si le décodage a échoué
    if (!decodedToken) {
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }

    // "?" permet de pas planter si "roles" n'existe pas
    if (!decodedToken.roles?.includes('ROLE_ADMIN')) {
        alert("Accès refusé : vous n'avez pas les droits d'administration.");
        return <Navigate to="/" replace />;
    }

    // on affiche la page
    return children;
};

export default AdminRoute;