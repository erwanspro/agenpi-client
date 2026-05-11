import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const ClientsManage = () => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentClientId, setCurrentClientId] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null);

    const [formData, setFormData] = useState({
        companyName: '',
        contactEmail: '',
        phone: ''
    });

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data.member || []);
        } catch (error) {
            toast.error("Erreur lors de la récupération des clients.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(client => 
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentClientId(null);
        setFormData({ companyName: '', contactEmail: '', phone: '' });
    };

    const handleEditClick = (client) => {
        setIsEditing(true);
        setCurrentClientId(client.id);
        setFormData({
            companyName: client.companyName,
            contactEmail: client.contactEmail,
            phone: client.phone || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

        if (!emailRegex.test(formData.contactEmail)) {
            toast.error("Format d'email invalide.");
            return;
        }

        const cleanPhone = formData.phone ? formData.phone.trim() : "";

        if (cleanPhone !== "" && !phoneRegex.test(cleanPhone)) {
            toast.error("Le numéro de téléphone n'est pas au format français valide.");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);

        const dataToSend = {
            companyName: formData.companyName,
            contactEmail: formData.contactEmail
        };
        
        // envoi null si téléphone vide
        if (!formData.phone || formData.phone.trim() === "") {
            dataToSend.phone = null;
        } else {
            dataToSend.phone = formData.phone.trim();
        }

        try {
            if (isEditing) {
                await api.patch(`/clients/${currentClientId}`, dataToSend, {
                    headers: {
                        'Content-Type': 'application/merge-patch+json'
                    }
                });
                toast.success("Client mis à jour avec succès !");
            } else {
                await api.post('/clients', dataToSend);
                toast.success("Client ajouté avec succès !");
            }
            resetForm();
            fetchClients();
        } catch (error) {
            toast.error(`Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} du client.`);
        }
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        try {
            await api.delete(`/clients/${clientToDelete.id}`);
            toast.success("Client supprimé définitivement.");
            if (isEditing && currentClientId === clientToDelete.id) resetForm();
            fetchClients();
        } catch (error) {
            toast.error("Erreur lors de la suppression du client.");
        }
    };

    const totalClients = clients.length;
    const clientsWithPhone = clients.filter(c => c.phone && String(c.phone).trim() !== '').length;
    const qualityPercentage = totalClients === 0 ? 0 : Math.round((clientsWithPhone / totalClients) * 100);
    const lastClientName = totalClients > 0 ? clients[clients.length - 1].companyName : '-';
    const initials = formData.companyName ? formData.companyName.substring(0, 2).toUpperCase() : '?';

    return (
        <div className="space-y-6 relative z-0">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Annuaire Clients</h1>
                    <p className="text-sm text-(--text) mt-1">Gérez la base de données de vos entreprises partenaires.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Total Clients</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : totalClients}
                        </h3>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Téléphone renseigné</p>
                            <h3 className="text-2xl font-bold text-(--text-h)">
                                {isLoading ? <span className="animate-pulse">...</span> : `${qualityPercentage}%`}
                            </h3>
                        </div>
                    </div>
                    <div className="w-full bg-(--bg) rounded-full h-1.5 mt-2 overflow-hidden border border-(--border)">
                        <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${qualityPercentage}%` }}></div>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Dernier ajout</p>
                        <h3 className="text-lg font-bold text-(--text-h) mt-1 truncate">
                            {isLoading ? <span className="animate-pulse">...</span> : lastClientName}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                
                <div className="lg:col-span-2 bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden flex flex-col h-fit">
                    
                    <div className="px-6 py-4 border-b border-(--border) bg-(--code-bg)/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-lg font-semibold text-(--text-h)">Répertoire</h2>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                placeholder="Rechercher une entreprise..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm bg-(--bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all w-full sm:w-64"
                            />
                        </div>
                    </div>
                    
                    <div className="p-0 overflow-x-auto max-h-[450px] overflow-y-auto custom-scrollbar relative">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-(--border)/50"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-(--border)/50 rounded w-1/4"></div>
                                            <div className="h-3 bg-(--border)/50 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-(--code-bg) rounded-full flex items-center justify-center mb-4 text-(--text)">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-(--text-h)">Aucun client trouvé</h3>
                                <p className="text-sm text-(--text) mt-1">Essayez une autre recherche ou ajoutez un nouveau client.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10 bg-(--bg-secondary) shadow-sm backdrop-blur-md">
                                    <tr className="border-b border-(--border) text-xs uppercase tracking-wider text-(--text)">
                                        <th className="px-6 py-4 font-semibold">Entreprise</th>
                                        <th className="px-6 py-4 font-semibold">Contact</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border)">
                                    {filteredClients.map((client) => {
                                        const isRowEditing = isEditing && currentClientId === client.id;
                                        return (
                                        <tr key={client.id} className={`group transition-all duration-200 ${isRowEditing ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : 'hover:bg-(--code-bg) border-l-4 border-l-transparent'}`}>
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isRowEditing ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gradient-to-tr from-(--accent) to-blue-400 text-white shadow-md'}`}>
                                                    {client.companyName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`font-semibold transition-colors ${isRowEditing ? 'text-blue-500' : 'text-(--text-h)'}`}>
                                                    {client.companyName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-(--text-h)">
                                                    <svg className="w-3.5 h-3.5 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    {client.contactEmail}
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-(--text) mt-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {client.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`flex items-center justify-end gap-2 transition-opacity duration-200 ${isRowEditing ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100 opacity-100'}`}>
                                                    <button onClick={() => handleEditClick(client)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110" title="Modifier">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(client)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110" title="Supprimer">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                    
                    <div className="bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden p-6 relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-20 h-20 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        
                        <h3 className="text-xs font-semibold text-(--text) uppercase tracking-wider mb-5">Aperçu de la fiche</h3>
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-(--accent) to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-(--accent-bg) transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shrink-0">
                                {initials !== '?' ? initials : <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-(--text-h) truncate">
                                    {formData.companyName || 'Nom de l\'entreprise'}
                                </h4>
                                
                                <div className="mt-1 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-(--text) truncate">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <span className="truncate">{formData.contactEmail || 'email@contact.com'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-(--text) truncate">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span>{formData.phone || 'Aucun téléphone'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-lg border ${isEditing ? 'border-blue-500/50 shadow-blue-500/20' : 'border-(--border)'} transition-all duration-300 relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                        <div className={`relative z-10 px-6 py-5 border-b ${isEditing ? 'bg-blue-500/5 border-blue-500/20' : 'bg-(--code-bg)/50 border-(--border)'} transition-colors duration-300 flex items-center justify-between`}>
                            <h2 className="text-lg font-bold text-(--text-h) flex items-center gap-2">
                                {isEditing ? (
                                    <svg className="w-5 h-5 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                )}
                                {isEditing ? 'Édition en cours' : 'Nouveau client'}
                            </h2>
                            {isEditing && (
                                <button onClick={resetForm} className="p-1.5 bg-(--bg) text-(--text) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-(--border)" title="Annuler l'édition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                        
                        <div className="p-6 relative z-10">
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Nom de l'entreprise *</label>
                                    <div className="relative group">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text) opacity-50 group-focus-within:text-(--accent) group-focus-within:opacity-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <input type="text" name="companyName" value={formData.companyName} required onChange={handleChange} className="pl-10 w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Email de contact *</label>
                                    <div className="relative group">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text) opacity-50 group-focus-within:text-(--accent) group-focus-within:opacity-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <input type="email" name="contactEmail" value={formData.contactEmail} required onChange={handleChange} className="pl-10 w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Téléphone</label>
                                    <div className="relative group">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text) opacity-50 group-focus-within:text-(--accent) group-focus-within:opacity-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+33 6 12 34 56 78" className="pl-10 w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                                    </div>
                                </div>

                                <button type="submit" className={`w-full flex items-center justify-center gap-2 mt-4 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-1 ${isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-r from-(--accent) to-blue-500 hover:opacity-90 shadow-lg shadow-(--accent-bg)'}`}>
                                    {isEditing ? 'Enregistrer' : 'Ajouter au répertoire'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border) transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-full ${isEditing ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-(--text-h)">{isEditing ? 'Mise à jour' : 'Nouveau Client'}</h3>
                        </div>
                        <p className="text-sm text-(--text) mb-6">
                            Voulez-vous {isEditing ? 'mettre à jour les informations de' : "ajouter l'entreprise"} <strong>{formData.companyName}</strong> ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-sm font-medium text-(--text) bg-(--code-bg) hover:bg-(--border) border border-(--border) rounded-xl transition-colors">Annuler</button>
                            <button type="button" onClick={confirmSubmit} className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors shadow-sm ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-(--accent) hover:opacity-90'}`}>
                                Oui, {isEditing ? 'mettre à jour' : 'créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && clientToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-red-500/20 transform scale-100 transition-transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-red-500/10 text-red-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-red-600">Suppression dangereuse</h3>
                        </div>
                        <p className="text-sm text-(--text) mb-6">
                            Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete.companyName}</strong> ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-(--text) bg-(--code-bg) hover:bg-(--border) border border-(--border) rounded-xl transition-colors">Annuler</button>
                            <button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-500/20">
                                Oui, supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsManage;