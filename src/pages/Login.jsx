import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const Login = () => {
    const navigate = useNavigate();

    // État du formulaire
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login_check', {
                username: formData.email,
                password: formData.password
            });

            // Extraction directe du token depuis response.data
            const jwt = response.data.token;

            if (jwt) {
                // On stocke le badge dans le localStorage
                localStorage.setItem('token', jwt);
                
                // Optionnel : stocker aussi l'email pour l'afficher plus tard
                localStorage.setItem('userEmail', formData.email);

                toast.success("Bienvenue !")
                navigate('/home'); 
            }

        } catch (err) {
            toast.error("Email ou mot de passe incorrect.");
        }
    };
    

    return (
        /* Le fond principal utilise la variable --bg */
        <div className="min-h-screen flex bg-(--code-bg) transition-colors duration-200">
            
            {/* --- COLONNE GAUCHE : Formulaire --- */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
                <div className="w-full max-w-md mx-auto">
                    
                    {/* Les titres utilisent --text-h */}
                    <h2 className="text-3xl font-bold text-(--text-h) mb-8 tracking-tight">
                        Votre travail commence ici
                    </h2>

                    <div className="relative flex items-center py-4 mb-6">
                        <div className="grow border-t border-(--border)"></div>
                        <span className="shrink-0 px-4 text-xs font-medium text-(--text) uppercase tracking-wider">
                            Connexion
                        </span>
                        <div className="grow border-t border-(--border)"></div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">
                                Email :
                            </label>
                            {/* Les inputs utilisent --code-bg et --border */}
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="nom@entreprise.com"
                                required 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) placeholder-(--text) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">
                                Mot de passe :
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="••••••••"
                                required 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 bg-(--code-bg) border border-(--border) rounded-lg text-(--text-h) placeholder-(--text) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                            />
                        </div>

                        {/* Cases à cocher */}
                        <div className="space-y-3 pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-(--border) bg-(--code-bg) text-(--accent) focus:ring-(--accent) focus:ring-offset-(--bg)" />
                                <span className="text-sm text-(--text) group-hover:text-(--text-h) transition-colors">
                                    En vous inscrivant, vous créez un compte et acceptez les <a href="#" className="text-(--accent) hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-(--accent) hover:underline">Politique de confidentialité</a>.
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-(--border) bg-(--code-bg) text-(--accent) focus:ring-(--accent) focus:ring-offset-(--bg)" />
                                <span className="text-sm text-(--text) group-hover:text-(--text-h) transition-colors">
                                    M'envoyer des mises à jour.
                                </span>
                            </label>
                        </div>

                        <button 
                            type="submit"
                            className="w-full mt-4 bg-(--accent) hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-all focus:ring-4 focus:ring-(--accent-border)"
                        >
                            Se connecter
                        </button>
                    </form>
                </div>
            </div>

            {/* --- COLONNE DROITE --- */}
            {/* fond de la colonne droite fixé sur la variable --accent */}
            <div className="hidden lg:flex flex-col justify-between px-16 xl:px-24 pt-20 w-1/2 bg-(--accent) text-white relative overflow-hidden">
                
                {/* Effet d'éclat lumineux en arrière-plan pour dynamiser */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl flex flex-col h-full">
                    
                    {/* SECTION HAUTE : Textes et Réassurance */}
                    <div>
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10 text-2xl font-extrabold text-white tracking-tight">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 600 328"
                                    className="w-10 h-auto"
                                >
                                    <g transform="translate(0.000000,328.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
                                        <path d="M2945 2681 c-11 -5 -28 -18 -38 -28 -10 -11 -146 -245 -303 -519 -157 -275 -289 -503 -294 -508 -5 -5 -51 -10 -102 -10 -152 -2 -129 25 -367 -446 -174 -346 -204 -411 -203 -448 0 -50 21 -85 65 -112 30 -19 53 -20 440 -20 372 0 412 2 439 18 27 16 124 176 422 699 l41 73 368 -3 369 -2 138 -270 c77 -148 139 -273 140 -278 0 -4 -113 -6 -252 -5 l-252 3 -44 75 c-25 41 -83 142 -130 223 l-84 148 -96 -3 -95 -3 -23 -36 -23 -37 153 -263 c187 -323 174 -303 207 -323 24 -14 77 -16 436 -16 387 0 410 1 440 20 44 27 65 62 65 113 1 38 -23 92 -162 368 -227 452 -246 486 -283 506 -37 20 -3 19 -729 16 l-496 -3 -66 -113 c-36 -63 -66 -115 -66 -118 0 -2 45 -3 100 -1 55 2 100 0 100 -5 0 -4 -71 -129 -158 -278 l-157 -270 -253 -3 c-138 -1 -252 1 -252 5 1 5 63 130 140 278 l139 270 93 3 c79 2 98 6 121 25 27 22 56 71 389 654 95 167 175 303 178 303 3 0 83 -137 178 -303 95 -167 178 -311 185 -321 11 -14 29 -16 140 -14 l127 3 -146 255 c-80 140 -198 346 -262 458 -63 112 -128 214 -144 228 -31 25 -91 32 -133 15z"/>
                                    </g>
                                </svg>
                            </div>
                            AGENPI
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 text-white drop-shadow-sm">
                            L'agilité au service de<br/>votre gestion d'équipe.
                        </h1>
                        
                        <p className="text-xl text-white/90 mb-10 max-w-2xl font-light leading-relaxed">
                            De la validation des congés au suivi d'avancement des tickets, centralisez les flux de travail de vos développeurs sans friction.
                        </p>

                        {/* Section Avatars */}
                        <div className="flex items-center gap-5 mb-16">
                            <div className="flex -space-x-4">
                                <img className="w-12 h-12 rounded-full border-[3px] border-(--accent) shadow-sm" src="https://i.pravatar.cc/100?img=33" alt="Dev" />
                                <img className="w-12 h-12 rounded-full border-[3px] border-(--accent) shadow-sm" src="https://i.pravatar.cc/100?img=47" alt="RH" />
                                <img className="w-12 h-12 rounded-full border-[3px] border-(--accent) shadow-sm" src="https://i.pravatar.cc/100?img=12" alt="Lead" />
                                <div className="w-12 h-12 rounded-full border-[3px] border-(--accent) bg-white flex items-center justify-center text-(--accent) font-bold text-xs shadow-sm">
                                    +2k
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-white">
                                    Recommandé par les CTOs
                                </span>
                                <span className="text-sm text-white/80">
                                    Simplifiez vos process RH & Dev
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION BASSE : L'illustration qui "déborde" (Style App Showcase) */}
                    <div className="flex-1 relative w-full h-full mt-auto">
                        <div className="absolute top-0 left-0 w-[120%] h-[150%] bg-white/10 backdrop-blur-md border border-white/20 rounded-tl-2xl rounded-tr-xl shadow-2xl p-6 overflow-hidden transform -rotate-2 origin-bottom-right transition-transform hover:rotate-0 duration-700">
                            
                            {/* En-tête fausse app */}
                            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 h-4 w-32 bg-white/20 rounded-full"></div>
                            </div>

                            {/* Le SVG Animé agrandi et intégré comme le contenu de l'app */}
                            <svg viewBox="0 0 400 220" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                                {/* ... contenu du dashboard ... */}
                                {/* Sidebar */}
                                <rect x="0" y="0" width="70" height="210" rx="6" fill="rgba(255,255,255,0.05)" />
                                <rect x="10" y="20" width="50" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
                                <rect x="10" y="40" width="35" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
                                <rect x="10" y="60" width="45" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
                                <rect x="10" y="150" width="50" height="40" rx="4" fill="rgba(255,255,255,0.1)" /> {/* Graphique RH */}

                                {/* Colonnes Kanban */}
                                <rect x="90" y="0" width="90" height="210" rx="6" fill="rgba(255,255,255,0.08)" />
                                <rect x="100" y="15" width="40" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
                                <rect x="100" y="35" width="70" height="50" rx="4" fill="rgba(255,255,255,0.9)" />
                                <rect x="100" y="95" width="70" height="40" rx="4" fill="rgba(255,255,255,0.3)" />

                                <rect x="195" y="0" width="90" height="210" rx="6" fill="rgba(255,255,255,0.08)" />
                                <rect x="205" y="15" width="40" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
                                <rect x="205" y="35" width="70" height="40" rx="4" fill="rgba(255,255,255,0.3)" />

                                <rect x="300" y="0" width="90" height="210" rx="6" fill="rgba(255,255,255,0.08)" />
                                <rect x="310" y="15" width="40" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
                                <rect x="310" y="35" width="70" height="40" rx="4" fill="rgba(255,255,255,0.2)" />
                                <rect x="310" y="85" width="70" height="60" rx="4" fill="rgba(255,255,255,0.2)" />

                                {/* CARTE ANIMÉE */}
                                <g>
                                    <animateTransform 
                                        attributeName="transform" 
                                        type="translate" 
                                        values="0,0; 0,0; 105,0; 105,0; 0,0" 
                                        keyTimes="0; 0.2; 0.4; 0.8; 1" 
                                        dur="6s" 
                                        repeatCount="indefinite" 
                                    />
                                    <rect x="205" y="85" width="70" height="45" rx="4" fill="#ffffff" className="shadow-xl" />
                                    <rect x="215" y="95" width="35" height="4" rx="2" fill="var(--accent)" opacity="0.9" />
                                    <rect x="215" y="105" width="25" height="3" rx="1.5" fill="var(--accent)" opacity="0.5" />
                                    <circle cx="260" cy="115" r="7" fill="var(--accent)" opacity="0.3" />
                                </g>

                                {/* BULLE DE VALIDATION FLOTTANTE */}
                                <g>
                                    <animateTransform 
                                        attributeName="transform" 
                                        type="translate" 
                                        values="350,-10; 350,-15; 350,-10" 
                                        dur="3s" 
                                        repeatCount="indefinite" 
                                    />
                                    <circle cx="0" cy="0" r="14" fill="#10B981" />
                                    <path d="M-5 0 L-1 4 L6 -3" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </g>
                            </svg>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Login;