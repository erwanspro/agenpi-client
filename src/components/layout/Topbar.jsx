import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Topbar = () => {
    const navigate = useNavigate();
    
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [unreadMessages, setUnreadMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userEmail = localStorage.getItem('userEmail');

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

    // Fermer le dropdown si on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Polling des messages
    useEffect(() => {
        const fetchUnreadMessages = async () => {
            if (!userEmail) return;
            try {
                const [usersRes, messagesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/messages')
                ]);
                
                const fetchedUsers = usersRes.data.member || [];
                const messages = messagesRes.data.member || [];
                setUsers(fetchedUsers);

                const currentUser = fetchedUsers.find(u => u.email === userEmail);
                if (currentUser) {
                    const unread = messages.filter(m => {
                        const recipientIri = typeof m.recipient === 'string' ? m.recipient : m.recipient?.['@id'];
                        return recipientIri === currentUser['@id'] && !m.isRead;
                    });
                    setUnreadMessages(unread);
                }
            } catch (error) {
                console.error("Erreur de notifications", error);
            }
        };

        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 5000);
        return () => clearInterval(interval);
    }, [userEmail]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    // Grouper les messages par expéditeur pour n'afficher que le dernier message de chaque contact
    const getGroupedUnread = () => {
        const groups = {};
        unreadMessages.forEach(msg => {
            const senderIri = typeof msg.sender === 'string' ? msg.sender : msg.sender?.['@id'];
            if (!groups[senderIri] || new Date(msg.createdAt) > new Date(groups[senderIri].createdAt)) {
                groups[senderIri] = msg;
            }
        });
        return Object.values(groups).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const handleNotificationClick = () => {
        if (unreadMessages.length === 0) {
            navigate('/messages');
        } else {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const goToChat = (senderIri) => {
        setIsDropdownOpen(false);
        const sender = users.find(u => u['@id'] === senderIri);
        if (sender) {
            // on passe l'ID de l'utilisateur dans l'état de la route
            navigate('/messages', { state: { activeChatId: sender.id } });
        }
    };

    const groupedUnread = getGroupedUnread();

    return (
        <header className="h-16 shrink-0 px-6 bg-(--bg-secondary) border-b border-(--border) flex items-center justify-between transition-colors duration-200 z-50 sticky top-0">            
            <div>
                <span className="text-(--text) text-sm font-medium">Bienvenue sur votre espace.</span>
            </div>

            <div className="flex items-center gap-4">
                
                {/* Conteneur de l'icône de notification */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={handleNotificationClick}
                        className="relative p-2 rounded-full text-(--text) hover:text-(--text-h) hover:bg-(--code-bg) transition-all duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        
                        {unreadMessages.length > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 text-[10px] font-bold leading-none text-white bg-red-500 border-2 border-(--bg-secondary) rounded-full -translate-y-1/4 translate-x-1/4">
                                {unreadMessages.length > 99 ? '99+' : unreadMessages.length}
                            </span>
                        )}
                    </button>

                    {/* Menu déroulant des messages */}
                    {isDropdownOpen && groupedUnread.length > 0 && (
                        <div className="absolute right-0 mt-2 w-80 bg-(--bg-secondary) border border-(--border) rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-(--border) bg-(--code-bg)/50 flex justify-between items-center">
                                <span className="font-bold text-(--text-h) text-sm">Nouveaux messages</span>
                                <span className="text-xs text-(--accent) cursor-pointer font-semibold hover:underline" onClick={() => { setIsDropdownOpen(false); navigate('/messages'); }}>Tout voir</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {groupedUnread.map(msg => {
                                    const senderIri = typeof msg.sender === 'string' ? msg.sender : msg.sender?.['@id'];
                                    const sender = users.find(u => u['@id'] === senderIri);
                                    if (!sender) return null;

                                    return (
                                        <div 
                                            key={msg.id} 
                                            onClick={() => goToChat(senderIri)}
                                            className="p-3 border-b border-(--border) hover:bg-(--code-bg) cursor-pointer transition-colors flex items-start gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-(--accent) to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                                                {sender.firstName?.charAt(0)}{sender.lastName?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className="font-semibold text-(--text-h) text-sm truncate">{sender.firstName} {sender.lastName}</span>
                                                    <span className="text-[10px] text-(--text) shrink-0 ml-2">
                                                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-(--text) truncate">{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-full text-(--text) hover:text-(--text-h) hover:bg-(--code-bg) transition-all duration-200"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                <div className="w-px h-6 bg-(--border)"></div>

                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Déconnexion
                </button>
            </div>
        </header>
    );
};

export default Topbar;