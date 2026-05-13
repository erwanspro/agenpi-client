import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const UsersManage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.member || []);
        } catch (error) {
            toast.error("Erreur lors de la récupération des employés.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filtre de recherche par nom, prénom, email ou service
    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const serviceName = u.service?.name?.toLowerCase() || '';
        
        return fullName.includes(search) || u.email.toLowerCase().includes(search) || serviceName.includes(search);
    });

    return (
        <div className="space-y-6 relative z-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Annuaire Collaborateurs</h1>
                    <p className="text-sm text-(--text) mt-1">Liste complète des effectifs de l'agence.</p>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-(--accent)/10 text-(--accent) rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Effectif Total</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : users.length}
                        </h3>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Services actifs</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : new Set(users.map(u => u.service?.id)).size}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-(--border) bg-(--code-bg)/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-(--text-h)">Répertoire Interne</h2>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Chercher un nom, un service..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-(--bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all w-full sm:w-80"
                        />
                    </div>
                </div>

                <div className="p-0 overflow-x-auto min-h-[400px] relative">
                    {isLoading ? (
                        <div className="p-6 space-y-4 animate-pulse">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-(--border)/50 rounded-xl w-full"></div>
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-16 text-center text-(--text)">Aucun collaborateur ne correspond à votre recherche.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-(--bg-secondary) shadow-sm">
                                <tr className="border-b border-(--border) text-xs uppercase tracking-wider text-(--text)">
                                    <th className="px-6 py-4 font-semibold">Identité</th>
                                    <th className="px-6 py-4 font-semibold">Service</th>
                                    <th className="px-6 py-4 font-semibold">Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {filteredUsers.map((user) => {
                                    const initials = `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`.toUpperCase();
                                    return (
                                        <tr key={user.id} className="group hover:bg-(--code-bg) transition-colors duration-200">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-(--accent) to-blue-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-(--text-h)">{user.firstName} {user.lastName}</span>
                                                    <span className="text-xs text-(--text) italic">Utilisateur #{user.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-(--code-bg) text-(--text) border border-(--border)">
                                                    {user.service?.name || 'Non assigné'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-(--text-h)">
                                                    <svg className="w-3.5 h-3.5 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-(--text) mt-1">
                                                        <svg className="w-3.5 h-3.5 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersManage;