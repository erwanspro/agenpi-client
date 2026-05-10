import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import { toast } from 'react-toastify';


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

    // récupération des services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // plus besoin de l'URL complète ni des headers !
                const response = await api.get('/services'); 
                setServicesList(response.data.member || []);
            } catch (err) {
                toast.error("Erreur serveur : Impossible de récupérer la liste des services. Contactez le support technique.");
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

        try {
            await api.post('/users',formData);
            toast.success("Le collaborateur a été ajouté avec succès !");
            navigate('/'); 
            
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                toast.error("Accès refusé : Droits d'administration requis.");
            } else {
                toast.error("Erreur serveur : Vérifiez les informations saisies.");
            }
        }
    };
return (
        // 1. Le parent devient "flex-col" (colonne) au lieu de flex tout court
        <div className="min-h-screen flex flex-col bg-(--bg) transition-colors duration-200">
            
            {/* 2. La Navbar prend naturellement sa place tout en haut */}
            <Navbar />

            {/* 3. On ajoute ce nouveau conteneur "flex-1" (qui prend tout l'espace restant) 
                   C'est LUI qui va centrer la carte au milieu de l'écran */}
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Conteneur principal style "Carte Admin" */}
                <div className="w-full max-w-3xl bg-(--bg-secondary) rounded-2xl shadow-xl border border-(--border) overflow-hidden">
                    
                    {/* En-tête du formulaire */}
                    <div className="bg-(--code-bg) border-b border-(--border) px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-(--accent)/10 text-(--accent) rounded-xl border border-(--accent)/20">
                                {/* Icône "User Plus" */}
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-(--text-h)">Nouveau collaborateur</h2>
                                <p className="text-sm text-(--text) mt-1">
                                    Saisissez les informations pour générer les accès à l'intranet.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Corps du formulaire */}
                    <div className="p-8">

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Section Identité */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2">Identité</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Prénom</label>
                                        <input type="text" name="firstName" required onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Nom</label>
                                        <input type="text" name="lastName" required onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* Section Contact & Accès */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2">Contact & Sécurité</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Email professionnel</label>
                                        <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Téléphone (Optionnel)</label>
                                        <input type="tel" name="phone" onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Mot de passe provisoire</label>
                                        <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors" />
                                        <p className="text-[11px] text-(--text) mt-1">L'employé devra modifier ce mot de passe lors de sa première connexion.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Assignation */}
                            <div>
                                <h3 className="text-sm font-semibold text-(--text-h) mb-4 border-b border-(--border) pb-2">Assignation</h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Service / Département</label>
                                    <select name="service" required onChange={handleChange} defaultValue="" className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23949ba4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}>
                                        <option value="" disabled className="text-(--text)">-- Sélectionner un service --</option>
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
                                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-(--text) hover:text-(--text-h) bg-transparent hover:bg-(--code-bg) border border-transparent hover:border-(--border) rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-(--accent) hover:opacity-90 rounded-xl transition-all shadow-md shadow-(--accent-bg) focus:ring-4 focus:ring-(--accent-border)"
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