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
        } catch (error) {
            // Token invalide ou corrompu
        }
    }

    // Le style dynamique pour les liens de navigation
    const navLinkStyle = ({ isActive }) => 
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden ${
            isActive 
                ? "text-(--accent) bg-(--accent)/10 font-bold"
                : "text-(--text) font-medium hover:text-(--text-h) hover:bg-(--code-bg) hover:translate-x-1"
        }`;

    // Le marqueur visuel pour le lien actif
    const ActiveIndicator = ({ isActive }) => isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-(--accent) rounded-r-md"></span>
    );

    return (
        <aside className="w-64 h-screen bg-(--bg-secondary)/95 backdrop-blur-xl border-r border-(--border) flex flex-col transition-colors duration-200 shrink-0 shadow-lg relative z-20">
            
            {/* Logo et Identité */}
            <div className="h-16 flex items-center px-6 border-b border-(--border) shrink-0">
                <div className="font-extrabold text-(--text-h) tracking-tight flex items-center gap-2 group cursor-default">
                    <span className="text-(--accent) text-xl font-mono group-hover:rotate-12 transition-transform duration-300">/</span>
                    <span className="text-lg tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-(--text-h) to-(--text)">AGENPI</span>
                </div>
            </div>

            {/* Menu de navigation principal */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                
                {/* ---------- SECTION GÉNÉRAL ---------- */}
                {isAuthenticated && (
                    <div className="space-y-2">
                        <p className="px-2 text-[10px] font-black text-(--text) uppercase tracking-[0.2em] mb-3 opacity-60">Général</p>
                        
                        <NavLink to="/home" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Tableau de bord
                                </>
                            )}
                        </NavLink>
                    </div>
                )}

                {/* ---------- SECTION ADMINISTRATION ---------- */}
                {(isAuthenticated && (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_RH'))) && (
                    <div className="space-y-2">
                        <p className="px-2 text-[10px] font-black text-(--text) uppercase tracking-[0.2em] mb-3 opacity-60">Administration</p>
                        
                        {roles.includes('ROLE_ADMIN') && (
                            <>
                                <NavLink to="/create_employee" className={navLinkStyle}>
                                    {({ isActive }) => (
                                        <>
                                            <ActiveIndicator isActive={isActive} />
                                            <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                            Création Employé
                                        </>
                                    )}
                                </NavLink>
                                <NavLink to="/clients_manage" className={navLinkStyle}>
                                    {({ isActive }) => (
                                        <>
                                            <ActiveIndicator isActive={isActive} />
                                            <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Gestion Clients
                                        </>
                                    )}
                                </NavLink>
                                <NavLink to="/project_manage" className={navLinkStyle}>
                                    {({ isActive }) => (
                                        <>
                                            <ActiveIndicator isActive={isActive} />
                                            <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            Gestion Projet
                                        </>
                                    )}
                                </NavLink>
                                <NavLink to="/taskboard" className={navLinkStyle}>
                                    {({ isActive }) => (
                                        <>
                                            <ActiveIndicator isActive={isActive} />
                                            <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            Taskboard
                                        </>
                                    )}
                                </NavLink>
                            </>
                        )}

                        {/* Admin + RH */}
                        <NavLink to="/users_manage" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Annuaire Employés
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/absence_manage" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Gestion Absences
                                </>
                            )}
                        </NavLink>
                    </div>
                )}

                {/* ---------- SECTION MON ESPACE ---------- */}
                {isAuthenticated && roles.includes('ROLE_DEV') && (
                    <div className="space-y-2">
                        <p className="px-2 text-[10px] font-black text-(--text) uppercase tracking-[0.2em] mb-3 opacity-60">Mon Espace</p>
                        
                        <NavLink to="/kanban" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Mes Tâches
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/my_absence" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Mes Absences
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/messages" className={navLinkStyle}>
                            {({ isActive }) => (
                                <>
                                    <ActiveIndicator isActive={isActive} />
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-(--accent)' : 'text-(--text) group-hover:text-(--accent)'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    Messagerie interne
                                </>
                            )}
                        </NavLink>
                    </div>
                )}
            </div>

            {/* Zone basse optionnelle (ex: version de l'app, profil rapide) */}
            <div className="p-4 border-t border-(--border) shrink-0 bg-(--bg-secondary)">
                <div className="flex items-center justify-center text-[10px] text-(--text) font-mono opacity-50">
                    AGENPI OS v1.0.4
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;