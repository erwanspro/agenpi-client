import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const MyAbsence = () => {
    const [absences, setAbsences] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        reason: '',
        startDate: '',
        endDate: ''
    });

    const userEmail = localStorage.getItem('userEmail');

    const fetchData = async () => {
        try {
            // On récupère tout pour pouvoir filtrer et afficher proprement
            const [absencesRes, reasonsRes, usersRes] = await Promise.all([
                api.get('/absences'),
                api.get('/reasons'),
                api.get('/users')
            ]);
            
            setAbsences(absencesRes.data.member || []);
            setReasons(reasonsRes.data.member || []);
            setUsers(usersRes.data.member || []);
        } catch (error) {
            toast.error("impossible de charger vos données.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Identification de l'utilisateur actuel pour filtrer les absences
    const currentUser = users.find(u => u.email === userEmail);

    const myAbsences = absences.filter(abs => {
        if (!currentUser) return false;
        // Vérification par IRI ou par objet
        const absUserIri = typeof abs.user === 'string' ? abs.user : abs.user?.['@id'];
        return absUserIri === currentUser['@id'];
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error("Utilisateur non identifié.");
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            toast.error("La date de fin ne peut pas être avant le début.");
            return;
        }

        try {
            const payload = {
                reason: `/api/reasons/${formData.reason}`,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                user: currentUser['@id'],
                status: 'PENDING' // Par défaut en attente
            };

            await api.post('/absences', payload);
            toast.success("Demande envoyée avec succès !");
            
            setShowModal(false);
            setFormData({ reason: '', startDate: '', endDate: '' });
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande.");
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

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const diffTime = Math.abs(new Date(end) - new Date(start));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 relative z-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Mes Absences</h1>
                    <p className="text-sm text-(--text) mt-1">Consultez vos demandes et leur statut de validation.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-(--accent) text-white text-sm font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Nouvelle demande
                </button>
            </div>

            <div className="bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden flex flex-col h-fit">
                <div className="px-6 py-5 border-b border-(--border) bg-(--code-bg)/50">
                    <h2 className="text-lg font-semibold text-(--text-h)">Historique personnel</h2>
                </div>
                
                <div className="p-0 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4 animate-pulse">
                            <div className="h-10 bg-(--border)/50 rounded w-full"></div>
                            <div className="h-10 bg-(--border)/50 rounded w-full"></div>
                        </div>
                    ) : myAbsences.length === 0 ? (
                        <div className="p-12 text-center text-(--text)">Aucune demande enregistrée.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-(--border) text-xs uppercase text-(--text)">
                                    <th className="px-6 py-4 font-semibold">Motif</th>
                                    <th className="px-6 py-4 font-semibold">Dates</th>
                                    <th className="px-6 py-4 font-semibold">Durée</th>
                                    <th className="px-6 py-4 font-semibold">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border)">
                                {myAbsences.map((abs) => (
                                    <tr key={abs.id} className="hover:bg-(--code-bg) transition-colors">
                                        <td className="px-6 py-4 font-medium text-(--text-h)">{abs.reason?.name || 'Non spécifié'}</td>
                                        <td className="px-6 py-4 text-sm">{formatDate(abs.startDate)} au {formatDate(abs.endDate)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-(--accent)">{calculateDays(abs.startDate, abs.endDate)} j.</td>
                                        <td className="px-6 py-4">{getStatusBadge(abs.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODALE DE DEMANDE */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-md shadow-2xl border border-(--border) animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-(--text-h)">Nouvelle demande</h3>
                            <button onClick={() => setShowModal(false)} className="text-(--text) hover:text-red-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase">Motif</label>
                                <select name="reason" required value={formData.reason} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) transition-all">
                                    <option value="" disabled>-- Choisir --</option>
                                    {reasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase">Début</label>
                                    <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent)" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase">Fin</label>
                                    <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent)" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-(--text) bg-(--code-bg) border border-(--border) rounded-xl">Annuler</button>
                                <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-(--accent) hover:opacity-90 rounded-xl shadow-md">Confirmer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAbsence;