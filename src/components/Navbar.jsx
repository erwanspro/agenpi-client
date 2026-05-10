import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // init des variables utilisateur
    let isAuthenticated = false;
    let roles = [];

    // décode le token s'il existe pour connaître les perm
    if (token) {
        try {
            const decoded = jwtDecode(token);
            isAuthenticated = true;
            roles = decoded.roles || [];
        } catch (error) {
            // Nettoyage si le token est corrompu
            localStorage.removeItem('token');
        }
    }

    // déconnecter
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    const navLinkStyle = ({ isActive }) => 
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive 
                ? "bg-(--accent) text-white shadow-md shadow-(--accent-bg)"
                : "text-(--text) hover:text-(--text-h) hover:bg-(--code-bg)"
        }`;

    return (
        <nav className="w-full flex items-center justify-between px-6 py-4 bg-(--bg-secondary) border-b border-(--border) sticky top-0 z-50">
            
            <div className="flex items-center gap-3">
                <div className="mr-6 font-extrabold text-(--text-h) tracking-tight flex items-center gap-2">
                    <span className="text-(--accent) text-lg">/</span>
                    AGENPI
                </div>

                {/* --- LIENS COMMUNS / DASHBOARD --- */}
                {isAuthenticated && (
                    <NavLink to="/home" className={navLinkStyle}>
                        Tableau de bord
                    </NavLink>
                )}

                {/* --- ACCÈS ADMIN : Création d'employés --- */}
                {isAuthenticated && roles.includes('ROLE_ADMIN') && (
                    <NavLink to="/create_employee" className={navLinkStyle}>
                        Ajouter un employé
                    </NavLink>
                )}

                {/* --- ACCÈS RH : Utilisateurs et Absences --- */}
                {isAuthenticated && (roles.includes('ROLE_RH') || roles.includes('ROLE_ADMIN')) && (
                    <>
                        <NavLink to="/users_manage" className={navLinkStyle}>
                            Liste Employés
                        </NavLink>
                        <NavLink to="/absence_manage" className={navLinkStyle}>
                            Gestion Absences
                        </NavLink>
                    </>
                )}

                {/* --- ACCÈS DEV : Tâches et projet --- */}
                {isAuthenticated && roles.includes('ROLE_DEV') && (
                    <NavLink to="/task" className={navLinkStyle}>
                        Mes Tâches
                    </NavLink>
                )}

                {isAuthenticated && roles.includes('ROLE_DEV') && (
                    <NavLink to="/my_absence" className={navLinkStyle}>
                        Mes Absences
                    </NavLink>
                )}
                
            </div>

            {/* --- ESPACE CONNEXION / DÉCONNEXION --- */}
            <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                    <NavLink to="/" className={navLinkStyle}>
                        Se connecter
                    </NavLink>
                ) : (
                    <button 
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                        Déconnexion
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;