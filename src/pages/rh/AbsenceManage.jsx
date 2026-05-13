import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const AbsenceManage = () => {
    const [absences, setAbsences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('PENDING');
    
    // Nouvel état pour gérer le tri (par défaut : trié par date la plus récente)
    const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

    const fetchAbsences = async () => {
        try {
            const response = await api.get('/absences');
            setAbsences(response.data.member || []);
        } catch (error) {
            toast.error("erreur lors de la récupération des absences.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAbsences();
    }, []);

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const diffTime = Math.abs(new Date(end) - new Date(start));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const updateStatus = async (id, newStatus) => {
        const previousAbsences = [...absences];
        setAbsences(absences.map(abs => abs.id === id ? { ...abs, status: newStatus } : abs));

        try {
            await api.patch(`/absences/${id}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
            toast.success(newStatus === 'APPROVED' ? "demande validée" : "demande refusée");
        } catch (error) {
            setAbsences(previousAbsences);
            toast.error("erreur lors du traitement de la demande.");
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'APPROVED': 
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">Validée</span>;
            case 'REJECTED': 
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">Refusée</span>;
            default: 
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">En attente</span>;
        }
    };

    // Gestion du clic sur les en-têtes de colonnes
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // 1. On filtre par recherche
    const searchFiltered = absences.filter(abs => {
        const search = searchTerm.toLowerCase();
        const userName = `${abs.user?.firstName} ${abs.user?.lastName}`.toLowerCase();
        const serviceName = abs.user?.service?.name?.toLowerCase() || '';
        const reasonName = abs.reason?.name?.toLowerCase() || '';
        return userName.includes(search) || serviceName.includes(search) || reasonName.includes(search);
    });

    // 2. On filtre par onglet (En attente / Historique)
    const displayedAbsences = searchFiltered.filter(abs => {
        const currentStatus = abs.status || 'PENDING';
        if (activeTab === 'PENDING') return currentStatus === 'PENDING';
        return currentStatus === 'APPROVED' || currentStatus === 'REJECTED';
    });

    // 3. On applique le tri
    const sortedAbsences = [...displayedAbsences].sort((a, b) => {
        if (sortConfig.key === 'startDate') {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortConfig.key === 'status') {
            const statusA = a.status || 'PENDING';
            const statusB = b.status || 'PENDING';
            if (statusA < statusB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (statusA > statusB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const pendingCount = absences.filter(a => (a.status || 'PENDING') === 'PENDING').length;

    // Composant utilitaire pour afficher la flèche de tri
    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="opacity-0 group-hover:opacity-30 w-4 h-4 inline-block">↕</span>;
        return <span className="text-(--accent) font-bold ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="space-y-6 relative z-0">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Gestion des Absences</h1>
                    <p className="text-sm text-(--text) mt-1">Supervisez et traitez les demandes de congés de l'équipe.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">À traiter</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : pendingCount}
                        </h3>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-(--accent)/10 text-(--accent) rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Total demandes</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : absences.length}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden flex flex-col">
                
                <div className="px-6 py-4 border-b border-(--border) bg-(--code-bg)/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('PENDING')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'PENDING' ? 'bg-(--accent) text-white shadow-md' : 'text-(--text) hover:bg-(--border)'}`}
                        >
                            En attente ({pendingCount})
                        </button>
                        <button 
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'HISTORY' ? 'bg-(--accent) text-white shadow-md' : 'text-(--text) hover:bg-(--border)'}`}
                        >
                            Historique
                        </button>
                    </div>

                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm bg-(--bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all w-full sm:w-64"
                        />
                    </div>
                </div>
                
                <div className="p-0 overflow-x-auto min-h-[400px] relative">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-(--border)/50"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-(--border)/50 rounded w-1/4"></div>
                                        <div className="h-3 bg-(--border)/50 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : sortedAbsences.length === 0 ? (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-(--code-bg) rounded-full flex items-center justify-center mb-4 text-(--text)">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-medium text-(--text-h)">Aucune demande à afficher</h3>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-(--bg-secondary) shadow-sm">
                                <tr className="border-b border-(--border) text-xs uppercase tracking-wider text-(--text)">
                                    <th className="px-6 py-4 font-semibold">Employé</th>
                                    <th className="px-6 py-4 font-semibold">Motif</th>
                                    <th 
                                        className="px-6 py-4 font-semibold cursor-pointer hover:text-(--text-h) transition-colors group select-none"
                                        onClick={() => handleSort('startDate')}
                                        title="Trier par date"
                                    >
                                        Période <SortIcon columnKey="startDate" />
                                    </th>
                                    <th 
                                        className="px-6 py-4 font-semibold cursor-pointer hover:text-(--text-h) transition-colors group select-none"
                                        onClick={() => handleSort('status')}
                                        title="Trier par statut"
                                    >
                                        Statut <SortIcon columnKey="status" />
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {sortedAbsences.map((absence) => {
                                    const days = calculateDays(absence.startDate, absence.endDate);
                                    const initials = absence.user ? `${absence.user.firstName?.charAt(0)}${absence.user.lastName?.charAt(0)}` : '?';
                                    
                                    return (
                                        <tr key={absence.id} className="group hover:bg-(--code-bg) transition-colors duration-200">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-(--accent) to-blue-400 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                                                    {initials.toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-(--text-h)">
                                                        {absence.user ? `${absence.user.firstName} ${absence.user.lastName}` : 'Inconnu'}
                                                    </span>
                                                    <span className="text-xs text-(--text)">{absence.user?.service?.name || 'Sans service'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-(--text-h)">
                                                {absence.reason?.name || 'Non spécifié'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-(--text-h)">{formatDateDisplay(absence.startDate)} au {formatDateDisplay(absence.endDate)}</div>
                                                <div className="text-xs font-bold text-(--accent) mt-0.5">{days} jour(s)</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(absence.status || 'PENDING')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {activeTab === 'PENDING' ? (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => updateStatus(absence.id, 'APPROVED')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all" title="Valider">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                        <button onClick={() => updateStatus(absence.id, 'REJECTED')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Refuser">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-(--text) italic">Traitée</span>
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

export default AbsenceManage;