import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
    const navigate = useNavigate();
    
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    return (
        <header className="h-16 shrink-0 px-6 bg-(--bg-secondary) border-b border-(--border) flex items-center justify-between transition-colors duration-200 z-50 sticky top-0">            
            {/* Zone gauche (ex: un champ de recherche plus tard) */}
            <div>
                <span className="text-(--text) text-sm font-medium">Bienvenue sur votre espace.</span>
            </div>

            {/* Zone droite (Thème et Logout) */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-full text-(--text) hover:text-(--text-h) hover:bg-(--code-bg) transition-all duration-200"
                    aria-label="Basculer le thème"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                <div className="w-px h-6 bg-(--border)"></div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Déconnexion
                </button>
            </div>
        </header>
    );
};

export default Topbar;