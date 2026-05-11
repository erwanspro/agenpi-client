import { Navigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // connecté = vers tableau de bord
    if (token) {
        return <Navigate to="/home" replace />;
    }

    // pas connecté = page login
    return children;
};

export default GuestRoute;