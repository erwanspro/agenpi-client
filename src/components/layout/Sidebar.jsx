import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
    const token = localStorage.getItem('token');
    let isAuthenticated = false;
    let roles = [];

    if (token) {
        try {
            const decoded = jwtDecode(token);
            isAuthenticated = true;
            roles = decoded.roles || [];
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            // Token invalide
        }
    }

    const navLinkStyle = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive 
                ? "bg-(--accent) text-white shadow-md shadow-(--accent-bg)"
                : "text-(--text) hover:text-(--text-h) hover:bg-(--code-bg)"
        }`;

    return (
        <aside className="w-64 h-screen bg-(--bg-secondary) border-r border-(--border) flex flex-col transition-colors duration-200 shrink-0">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-(--border)">
                <div className="font-extrabold text-(--text-h) tracking-tight flex items-center gap-2">
                    <span className="text-(--accent) text-xl">/</span>
                    <span className="text-lg">AGENPI</span>
                </div>
            </div>

            {/* Menu de navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                
                {/* Section Générale */}
                <div className="mb-4">
                    <p className="px-4 text-xs font-semibold text-(--text) uppercase tracking-wider mb-2 opacity-70">Général</p>
                    {isAuthenticated && (
                        <NavLink to="/home" className={navLinkStyle}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Tableau de bord
                        </NavLink>
                    )}
                </div>

                {/* Section Administration */}
                {(isAuthenticated && (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_RH'))) && (
                    <div className="mb-4 pt-4 border-t border-(--border)">
                        <p className="px-4 text-xs font-semibold text-(--text) uppercase tracking-wider mb-2 opacity-70">Administration</p>
                        {/* QUE POUR L'ADMIN */}
                        {roles.includes('ROLE_ADMIN') && (
                            <NavLink to="/create_employee" className={navLinkStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Création Employé
                            </NavLink>
                        )}
                        {roles.includes('ROLE_ADMIN') && (
                            <NavLink to="/clients_manage" className={navLinkStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Gestion Clients
                            </NavLink>
                        )}
                        {roles.includes('ROLE_ADMIN') && (
                            <NavLink to="/project_manage" className={navLinkStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Gestion Projet
                            </NavLink>
                        )}
                        {roles.includes('ROLE_ADMIN') && (
                            <NavLink to="/taskboard" className={navLinkStyle}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Taskboard
                            </NavLink>
                        )}
                        {/* POUR ADMIN + RH */}
                        <NavLink to="/users_manage" className={navLinkStyle}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            Liste Employés
                        </NavLink>
                        <NavLink to="/absence_manage" className={navLinkStyle}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Gestion Absences
                        </NavLink>
                    </div>
                )}

                {/* Section Espace Personnel */}
                {isAuthenticated && roles.includes('ROLE_DEV') && (
                    <div className="mb-4 pt-4 border-t border-(--border)">
                        <p className="px-4 text-xs font-semibold text-(--text) uppercase tracking-wider mb-2 opacity-70">Mon Espace</p>
                        <NavLink to="/kanban" className={navLinkStyle}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            Mes Tâches
                        </NavLink>
                        <NavLink to="/my_absence" className={navLinkStyle}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Mes Absences
                        </NavLink>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;