import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'

const CreateEmployee = () => {
    const navigate = useNavigate();
    
    // état du formulaire
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        service: '' 
    });

    const [servicesList, setServicesList] = useState([]);
    const [error, setError] = useState('');

    // récupération des services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // plus besoin de l'URL complète ni des headers !
                const response = await api.get('/services'); 
                setServicesList(response.data.member || []);
            } catch (err) {
                console.error("Erreur services:", err);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/users',formData);

            alert("Le compte de l'employé a été créé avec succès !");
            navigate('/'); 
            
        } catch (err) {
            console.error("Erreur création:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError("Accès refusé. Vous n'avez pas les droits d'administration.");
            } else {
                setError("Données invalides ou erreur serveur.");
            }
        }
    };
return (
        // 1. Le parent devient "flex-col" (colonne) au lieu de flex tout court
        <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
            
            {/* 2. La Navbar prend naturellement sa place tout en haut */}
            <Navbar />

            {/* 3. On ajoute ce nouveau conteneur "flex-1" (qui prend tout l'espace restant) 
                   C'est LUI qui va centrer la carte au milieu de l'écran */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Conteneur principal style "Carte Admin" */}
                <div className="w-full max-w-3xl bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden">
                    
                    {/* En-tête du formulaire */}
                    <div className="bg-[var(--code-bg)] border-b border-[var(--border)] px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl border border-[var(--accent)]/20">
                                {/* Icône "User Plus" */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-h)]">Nouveau collaborateur</h2>
                                <p className="text-sm text-[var(--text)] mt-1">
                                    Saisissez les informations pour générer les accès à l'intranet.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Corps du formulaire */}
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Section Identité */}
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 border-b border-[var(--border)] pb-2">Identité</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Prénom</label>
                                        <input type="text" name="firstName" required onChange={handleChange} className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Nom</label>
                                        <input type="text" name="lastName" required onChange={handleChange} className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* Section Contact & Accès */}
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 border-b border-[var(--border)] pb-2">Contact & Sécurité</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Email professionnel</label>
                                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Téléphone (Optionnel)</label>
                                        <input type="tel" name="phone" onChange={handleChange} className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Mot de passe provisoire</label>
                                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors" />
                                        <p className="text-[11px] text-[var(--text)] mt-1">L'employé devra modifier ce mot de passe lors de sa première connexion.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Assignation */}
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4 border-b border-[var(--border)] pb-2">Assignation</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Service / Département</label>
                                    <select name="service" required onChange={handleChange} defaultValue="" className="w-full px-4 py-2.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg text-[var(--text-h)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23949ba4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}>
                                        <option value="" disabled className="text-[var(--text)]">-- Sélectionner un service --</option>
                                        {servicesList.map((service) => (
                                            <option key={service['@id']} value={service['@id']}>
                                                {service.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/')} 
                                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-[var(--text)] hover:text-[var(--text-h)] bg-transparent hover:bg-[var(--code-bg)] border border-transparent hover:border-[var(--border)] rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-[var(--accent)] hover:opacity-90 rounded-xl transition-all shadow-md shadow-[var(--accent-bg)] focus:ring-4 focus:ring-[var(--accent-border)]"
                                >
                                    Créer l'employé
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;