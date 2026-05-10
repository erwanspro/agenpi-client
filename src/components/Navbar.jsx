import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // --- GESTION DU THÈME ---
    const [isDark, setIsDark] = useState(() => {
        // Au chargement, on lit le localStorage OU la préférence système
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // À chaque changement de isDark, on applique la classe sur <html>
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);
    // ------------------------

    let isAuthenticated = false;
    let roles = [];

    if (token) {
        try {
            const decoded = jwtDecode(token);
            isAuthenticated = true;
            roles = decoded.roles || [];
        } catch (error) {
            localStorage.removeItem('token');
        }
    }

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
        <nav className="w-full flex items-center justify-between px-6 py-4 bg-(--bg-secondary) border-b border-(--border) sticky top-0 z-50 transition-colors duration-200">
            
            <div className="flex items-center gap-3">
                <div className="mr-6 font-extrabold text-(--text-h) tracking-tight flex items-center gap-2 transition-colors duration-200">
                    <span className="text-(--accent) text-lg">/</span>
                    AGENPI
                </div>

                {isAuthenticated && (
                    <NavLink to="/home" className={navLinkStyle}>
                        Tableau de bord
                    </NavLink>
                )}

                {isAuthenticated && roles.includes('ROLE_ADMIN') && (
                    <NavLink to="/create_employee" className={navLinkStyle}>
                        Ajouter un employé
                    </NavLink>
                )}

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

                {isAuthenticated && roles.includes('ROLE_DEV') && (
                    <>
                        <NavLink to="/task" className={navLinkStyle}>
                            Mes Tâches
                        </NavLink>
                        <NavLink to="/my_absence" className={navLinkStyle}>
                            Mes Absences
                        </NavLink>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                
                {/* --- BOUTON DARK MODE --- */}
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-2.5 rounded-full text-(--text) hover:text-(--text-h) hover:bg-(--code-bg) transition-all duration-200"
                    aria-label="Basculer le thème"
                >
                    {isDark ? (
                        /* Icône Soleil (Mode sombre actif) */
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        /* Icône Lune (Mode clair actif) */
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Séparateur vertical */}
                <div className="w-px h-6 bg-(--border)"></div>

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