import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateEmployee = () => {
    const navigate = useNavigate();
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        service: '' 
    });

    const [servicesList, setServicesList] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await api.get('/services'); 
                setServicesList(response.data.member || []);
            } catch (err) {
                toast.error("Erreur serveur : Impossible de récupérer la liste des services.");
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

        if (!emailRegex.test(formData.email)) {
            toast.error("Format d'email invalide. Vérifiez votre saisie.");
            return;
        }

        if (formData.phone && !phoneRegex.test(formData.phone)) {
            toast.error("Le numéro de téléphone n'est pas au bon format.");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);

        try {
            await api.post('/users', formData);
            toast.success("Le collaborateur a été ajouté avec succès !");
            navigate('/home'); 
            
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                toast.error("Accès refusé : Droits d'administration requis.");
            } else {
                toast.error("Erreur serveur : Vérifiez les informations saisies.");
            }
        }
    };

    // --- VARIABLES DÉRIVÉES POUR L'INTERFACE ---
    // Récupérer le nom du service sélectionné pour l'affichage en direct
    const selectedServiceObj = servicesList.find(s => s['@id'] === formData.service);
    const serviceName = selectedServiceObj ? selectedServiceObj.name : 'Aucun service';
    // Générer l'initiale pour l'avatar dynamique
    const initials = (formData.firstName.charAt(0) + formData.lastName.charAt(0)).toUpperCase() || '?';

    return (
        <div className="space-y-6">
            
            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-(--text-h)">Ajouter un collaborateur</h1>
                    <p className="text-sm text-(--text) mt-1">
                        Créez un nouveau profil et assignez-le à un service pour générer ses accès.
                    </p>
                </div>
            </div>

            {/* --- GRILLE : Formulaire (2/3) + Preview/Aide (1/3) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                
                {/* --- COLONNE GAUCHE : FORMULAIRE PRINCIPAL --- */}
                <div className="lg:col-span-2 bg-(--bg-secondary) rounded-2xl shadow-sm border border-(--border) overflow-hidden h-fit">
                    
                    <div className="bg-(--code-bg) border-b border-(--border) px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-(--accent)/10 text-(--accent) rounded-xl border border-(--accent)/20 shadow-inner">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-(--text-h)">Fiche de l'employé</h2>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleFormSubmit} className="space-y-8">
                            
                            {/* Identité */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Identité
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5 relative">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Prénom *</label>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <input type="text" name="firstName" required onChange={handleChange} className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Nom *</label>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                            <input type="text" name="lastName" required onChange={handleChange} className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Sécurité */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Contact & Sécurité
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Email pro *</label>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <input type="email" name="email" required onChange={handleChange} className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Téléphone</label>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            <input type="tel" name="phone" onChange={handleChange} className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Mot de passe provisoire *</label>
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            <input type="password" name="password" required onChange={handleChange} className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all" />
                                        </div>
                                        <p className="text-[11px] text-(--text) mt-1 pl-1">L'employé devra modifier ce mot de passe lors de sa première connexion.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Assignation */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-(--text)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Assignation
                                </h3>
                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Service / Département *</label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text) opacity-60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <select name="service" required onChange={handleChange} defaultValue="" className="pl-9 w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-all cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23949ba4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
                                            <option value="" disabled className="text-(--text)">Sélectionner un service</option>
                                            {servicesList.map((service) => (
                                                <option key={service['@id']} value={service['@id']}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-(--border)">
                                <button type="button" onClick={() => navigate('/home')} className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-(--text) hover:text-(--text-h) bg-transparent hover:bg-(--code-bg) border border-transparent hover:border-(--border) rounded-xl transition-all">
                                    Annuler
                                </button>
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-(--accent) hover:opacity-90 rounded-xl transition-all shadow-md shadow-(--accent-bg) focus:ring-4 focus:ring-(--accent-border) hover:-translate-y-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Créer l'employé
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- COLONNE DROITE : PREVIEW ET AIDE --- */}
                <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                    
                    {/* Carte 1 : L'aperçu en direct (Live Preview) */}
                    <div className="bg-(--bg-secondary) rounded-2xl shadow-sm border border-(--border) overflow-hidden p-6 relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                            <svg className="w-24 h-24 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                        </div>
                        
                        <h3 className="text-xs font-semibold text-(--text) uppercase tracking-wider mb-6">Aperçu du profil</h3>
                        
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-(--accent) to-blue-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-(--accent-bg) mb-4 border-4 border-(--bg-secondary)">
                                {initials !== '?' ? initials : <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            </div>
                            <h4 className="text-lg font-bold text-(--text-h)">
                                {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : 'Nouvel Employé'}
                            </h4>
                            <span className="inline-block mt-2 px-3 py-1 bg-(--code-bg) text-(--text) text-xs font-medium rounded-full border border-(--border)">
                                {serviceName}
                            </span>
                            
                            {formData.email && (
                                <div className="mt-4 text-sm text-(--text) flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    {formData.email}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Carte 2 : Explication du processus */}
                    <div className="bg-(--bg-secondary) rounded-2xl shadow-sm border border-(--border) overflow-hidden">
                        <div className="px-6 py-4 border-b border-(--border) bg-(--code-bg)">
                            <h2 className="text-sm font-semibold text-(--text-h) flex items-center gap-2">
                                <svg className="w-4 h-4 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Que se passe-t-il ensuite ?
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-(--accent)/10 text-(--accent) flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
                                <div>
                                    <h4 className="text-sm font-medium text-(--text-h)">Création du compte</h4>
                                    <p className="text-xs text-(--text) mt-1">Le compte est créé immédiatement dans la base de données AGENPI.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-(--accent)/10 text-(--accent) flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                                <div>
                                    <h4 className="text-sm font-medium text-(--text-h)">Envoi des accès</h4>
                                    <p className="text-xs text-(--text) mt-1">Vous devez communiquer le mot de passe provisoire au nouveau collaborateur.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-(--accent)/10 text-(--accent) flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                                <div>
                                    <h4 className="text-sm font-medium text-(--text-h)">Première connexion</h4>
                                    <p className="text-xs text-(--text) mt-1">À sa première connexion, l'employé sera invité à personnaliser son mot de passe pour des raisons de sécurité.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- MODALE DE CONFIRMATION --- */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border) transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-(--text-h)">Confirmation</h3>
                        </div>
                        <p className="text-sm text-(--text) mb-6">
                            Êtes-vous sûr de vouloir créer le profil pour <strong>{formData.firstName} {formData.lastName}</strong> ? Cette action lui générera immédiatement des accès au service <strong>{serviceName}</strong>.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-sm font-medium text-(--text) bg-(--code-bg) hover:bg-(--border) border border-(--border) rounded-xl transition-colors">
                                Non, annuler
                            </button>
                            <button type="button" onClick={confirmSubmit} className="px-4 py-2 text-sm font-medium text-white bg-(--accent) hover:opacity-90 rounded-xl transition-colors shadow-sm">
                                Oui, créer l'employé
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateEmployee;