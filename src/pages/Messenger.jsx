import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Messenger = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail');

    const fetchData = async () => {
        try {
            const [usersRes, messagesRes] = await Promise.all([
                api.get('/users'),
                api.get('/messages')
            ]);
            setUsers(usersRes.data.member || []);
            setMessages(messagesRes.data.member || []);
        } catch (error) {
            console.error(error);
        }
    };

    // polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentUser = users.find(u => u.email === userEmail);

    // sélection automatique du chat si on arrive depuis la topbar
    useEffect(() => {
        if (location.state?.activeChatId && users.length > 0) {
            const targetUser = users.find(u => u.id === location.state.activeChatId);
            if (targetUser) {
                setActiveChat(targetUser);
                // on nettoie l'état pour ne pas re-déclencher à l'infini
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, users, navigate, location.pathname]);

    // auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    // suppression INSTANTANÉE de la pastille
    useEffect(() => {
        if (!activeChat || !currentUser) return;

        const unreadMessages = messages.filter(m => {
            const senderIri = typeof m.sender === 'string' ? m.sender : m.sender?.['@id'];
            const recipientIri = typeof m.recipient === 'string' ? m.recipient : m.recipient?.['@id'];
            return senderIri === activeChat['@id'] && recipientIri === currentUser['@id'] && !m.isRead;
        });

        if (unreadMessages.length === 0) return; // rien à faire

        const unreadIds = unreadMessages.map(m => m.id);

        // 1. mise à jour optimiste (visuel direct)
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, isRead: true } : m));

        // 2. validation en base de données en arrière-plan
        unreadMessages.forEach(async (msg) => {
            try {
                await api.patch(`/messages/${msg.id}`, { isRead: true }, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
            } catch (e) {
                console.error(e);
            }
        });
    }, [activeChat, messages, currentUser]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const tempMessage = newMessage;
        setNewMessage('');

        try {
            await api.post('/messages', {
                content: tempMessage,
                sender: currentUser['@id'],
                recipient: activeChat['@id'],
                isRead: false
            });
            fetchData();
        } catch (error) {
            toast.error("erreur d'envoi");
            setNewMessage(tempMessage);
        }
    };

    if (!currentUser) return null;

    const contacts = users.filter(u => u.id !== currentUser.id);

    const activeChatMessages = messages.filter(m => {
        const senderIri = typeof m.sender === 'string' ? m.sender : m.sender?.['@id'];
        const recipientIri = typeof m.recipient === 'string' ? m.recipient : m.recipient?.['@id'];
        
        return (senderIri === currentUser['@id'] && recipientIri === activeChat?.['@id']) ||
               (senderIri === activeChat?.['@id'] && recipientIri === currentUser['@id']);
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const getUnreadCount = (contactIri) => {
        return messages.filter(m => {
            const senderIri = typeof m.sender === 'string' ? m.sender : m.sender?.['@id'];
            const recipientIri = typeof m.recipient === 'string' ? m.recipient : m.recipient?.['@id'];
            return senderIri === contactIri && recipientIri === currentUser['@id'] && !m.isRead;
        }).length;
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            <div className="w-80 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
                <div className="p-4 border-b border-(--border) bg-(--code-bg)/50">
                    <h2 className="font-bold text-(--text-h)">Discussions</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {contacts.map(contact => {
                        const unread = getUnreadCount(contact['@id']);
                        const isActive = activeChat?.id === contact.id;
                        
                        return (
                            <button
                                key={contact.id}
                                onClick={() => setActiveChat(contact)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-(--accent)/10 border-(--accent)/20' : 'hover:bg-(--code-bg) border-transparent'} border text-left`}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                                    </div>
                                    {unread > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-(--bg-secondary) flex items-center justify-center text-[10px] text-white font-bold">
                                            {unread}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-(--text-h)' : 'font-medium text-(--text-h)'}`}>
                                        {contact.firstName} {contact.lastName}
                                    </p>
                                    <p className="text-xs text-(--text) truncate">{contact.service?.name || 'Agence'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl flex flex-col overflow-hidden shadow-sm">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b border-(--border) bg-(--code-bg)/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-(--accent) to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {activeChat.firstName?.charAt(0)}{activeChat.lastName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-(--text-h)">{activeChat.firstName} {activeChat.lastName}</h3>
                                <p className="text-xs text-(--text)">{activeChat.email}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {activeChatMessages.map(msg => {
                                const senderIri = typeof msg.sender === 'string' ? msg.sender : msg.sender?.['@id'];
                                const isMe = senderIri === currentUser['@id'];

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? 'bg-(--accent) text-white rounded-tr-none' : 'bg-(--code-bg) border border-(--border) text-(--text-h) rounded-tl-none'}`}>
                                            <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <span className="text-[10px] text-(--text) mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-(--border) bg-(--bg)">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez un message..."
                                    className="flex-1 px-4 py-3 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-3 bg-(--accent) hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-(--text)">
                        <div className="w-16 h-16 bg-(--code-bg) rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p>Sélectionnez un contact pour démarrer une discussion</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;