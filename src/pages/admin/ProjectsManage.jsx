import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import MultiSelect from '../../components/MultiSelect';

const ProjectsManage = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        client: '',
        status: 'En attente',
        description: '',
        startDate: '',
        endDate: '',
        users: [] // ajout du tableau des utilisateurs
    });

    const fetchData = async () => {
        try {
            // on charge tout en parallèle
            const [projectsRes, clientsRes, usersRes] = await Promise.all([
                api.get('/projects'),
                api.get('/clients'),
                api.get('/users')
            ]);
            setProjects(projectsRes.data.member || []);
            setClients(clientsRes.data.member || []);
            setUsers(usersRes.data.member || []);
        } catch (error) {
            toast.error("Erreur lors de la récupération des données.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client?.companyName && project.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // fonction spécifique pour notre multiselect
    const handleUsersChange = (selectedUsers) => {
        setFormData({ ...formData, users: selectedUsers });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentProjectId(null);
        setFormData({ 
            name: '', client: '', status: 'En attente', description: '', startDate: '', endDate: '', users: [] 
        });
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const handleEditClick = (project) => {
        setIsEditing(true);
        setCurrentProjectId(project.id);
        setFormData({
            name: project.name,
            client: project.client ? project.client.id : '',
            status: project.status,
            description: project.description || '',
            startDate: formatDateForInput(project.startDate),
            endDate: formatDateForInput(project.endDate),
            // on récupère les iris des utilisateurs déjà assignés
            users: project.users ? project.users.map(u => typeof u === 'string' ? u : u['@id']) : []
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            toast.error("La date de fin ne peut pas être avant la date de début.");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);

        const dataToSend = {
            name: formData.name,
            status: formData.status,
            client: `/api/clients/${formData.client}`,
            startDate: new Date(formData.startDate).toISOString(),
            users: formData.users // le backend api platform accepte directement ce tableau d'iris
        };
        
        if (!formData.description || formData.description.trim() === "") {
            dataToSend.description = null;
        } else {
            dataToSend.description = formData.description.trim();
        }

        if (!formData.endDate || formData.endDate === "") {
            dataToSend.endDate = null;
        } else {
            dataToSend.endDate = new Date(formData.endDate).toISOString();
        }

        try {
            if (isEditing) {
                await api.patch(`/projects/${currentProjectId}`, dataToSend, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                toast.success("Projet mis à jour avec succès !");
            } else {
                await api.post('/projects', dataToSend);
                toast.success("Projet créé avec succès !");
            }
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(`Erreur lors de la ${isEditing ? 'mise à jour' : 'création'} du projet.`);
        }
    };

    const confirmDelete = async () => {
        setShowDeleteModal(false);
        try {
            await api.delete(`/projects/${projectToDelete.id}`);
            toast.success("Projet supprimé définitivement.");
            if (isEditing && currentProjectId === projectToDelete.id) resetForm();
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de la suppression du projet.");
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'En cours':
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">En cours</span>;
            case 'Terminé':
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">Terminé</span>;
            default:
                return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-(--code-bg) text-(--text) border border-(--border)">En attente</span>;
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'En cours').length;
    const completedProjects = projects.filter(p => p.status === 'Terminé').length;

    // préparation des options pour le composant multiselect
    const userOptions = users.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user['@id'] || `/api/users/${user.id}`
    }));

    return (
        <div className="space-y-6 relative z-0">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Gestion des Projets</h1>
                    <p className="text-sm text-(--text) mt-1">Supervisez l'avancement des projets clients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-(--accent)/10 text-(--accent) rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Total Projets</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : totalProjects}
                        </h3>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">En cours</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : activeProjects}
                        </h3>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-md p-5 rounded-2xl border border-(--border) shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-(--text) uppercase tracking-wider">Terminés</p>
                        <h3 className="text-2xl font-bold text-(--text-h) mt-1">
                            {isLoading ? <span className="animate-pulse">...</span> : completedProjects}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                
                <div className="lg:col-span-2 bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-sm border border-(--border) overflow-hidden flex flex-col h-fit">
                    
                    <div className="px-6 py-4 border-b border-(--border) bg-(--code-bg)/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h2 className="text-lg font-semibold text-(--text-h)">Liste des projets</h2>
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
                    
                    <div className="p-0 overflow-x-auto max-h-[550px] overflow-y-auto custom-scrollbar relative">
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
                        ) : filteredProjects.length === 0 ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-(--code-bg) rounded-full flex items-center justify-center mb-4 text-(--text)">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-(--text-h)">Aucun projet trouvé</h3>
                                <p className="text-sm text-(--text) mt-1">Créez votre premier projet via le formulaire.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10 bg-(--bg-secondary) shadow-sm backdrop-blur-md">
                                    <tr className="border-b border-(--border) text-xs uppercase tracking-wider text-(--text)">
                                        <th className="px-6 py-4 font-semibold">Projet & Client</th>
                                        <th className="px-6 py-4 font-semibold">Équipe</th>
                                        <th className="px-6 py-4 font-semibold">Statut</th>
                                        <th className="px-6 py-4 font-semibold">Échéance</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--border)">
                                    {filteredProjects.map((project) => {
                                        const isRowEditing = isEditing && currentProjectId === project.id;
                                        // si le backend envoie les utilisateurs, on affiche le nombre
                                        const teamCount = project.users ? project.users.length : 0;
                                        return (
                                        <tr key={project.id} className={`group transition-all duration-200 ${isRowEditing ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : 'hover:bg-(--code-bg) border-l-4 border-l-transparent'}`}>
                                            <td className="px-6 py-4">
                                                <span className={`block font-semibold transition-colors ${isRowEditing ? 'text-blue-500' : 'text-(--text-h)'}`}>
                                                    {project.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs text-(--text) mt-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    {project.client?.companyName || 'Client inconnu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-(--code-bg) text-(--text) border border-(--border)">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                    {teamCount} membre{teamCount !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(project.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-(--text-h)">{formatDateDisplay(project.startDate)}</div>
                                                <div className="text-xs text-(--text) mt-0.5">au {formatDateDisplay(project.endDate)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`flex items-center justify-end gap-2 transition-opacity duration-200 ${isRowEditing ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100 opacity-100'}`}>
                                                    <button onClick={() => handleEditClick(project)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all hover:scale-110" title="Modifier">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(project)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all hover:scale-110" title="Supprimer">
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

                <div className={`bg-(--bg-secondary)/90 backdrop-blur-xl rounded-2xl shadow-lg border ${isEditing ? 'border-blue-500/50 shadow-blue-500/20' : 'border-(--border)'} transition-all duration-300 h-fit sticky top-24 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                    <div className={`relative z-10 px-6 py-5 border-b ${isEditing ? 'bg-blue-500/5 border-blue-500/20' : 'bg-(--code-bg)/50 border-(--border)'} transition-colors duration-300 flex items-center justify-between`}>
                        <h2 className="text-lg font-bold text-(--text-h) flex items-center gap-2">
                            {isEditing ? (
                                <svg className="w-5 h-5 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            ) : (
                                <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            )}
                            {isEditing ? 'Édition du projet' : 'Nouveau projet'}
                        </h2>
                        {isEditing && (
                            <button onClick={resetForm} className="p-1.5 bg-(--bg) text-(--text) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-(--border)" title="Annuler l'édition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    
                    <div className="p-6 relative z-10">
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Nom du projet *</label>
                                <input type="text" name="name" value={formData.name} required onChange={handleChange} placeholder="Ex: Refonte Site Web" className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Client associé *</label>
                                <select 
                                    name="client" 
                                    required 
                                    value={formData.client}
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all cursor-pointer appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23949ba4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                                >
                                    <option value="" disabled>-- Sélectionner un client --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                                </select>
                            </div>

                            {/* LE NOUVEAU MULTISELECT */}
                            <MultiSelect 
                                label="Équipe assignée"
                                placeholder="Ajouter des membres..."
                                options={userOptions}
                                selected={formData.users}
                                onChange={handleUsersChange}
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Statut</label>
                                <select 
                                    name="status" 
                                    value={formData.status}
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all cursor-pointer appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23949ba4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                                >
                                    <option value="En attente">En attente</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminé">Terminé</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Début *</label>
                                    <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Fin (Optionnel)</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Détails du projet..." className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all custom-scrollbar resize-none"></textarea>
                            </div>

                            <button type="submit" className={`w-full flex items-center justify-center gap-2 mt-2 px-6 py-3 text-sm font-bold text-white rounded-xl transition-all hover:-translate-y-1 ${isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-r from-(--accent) to-blue-500 hover:opacity-90 shadow-lg shadow-(--accent-bg)'}`}>
                                {isEditing ? 'Enregistrer les modifications' : 'Créer le projet'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modales identiques... */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-(--border) transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-full ${isEditing ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-(--text-h)">{isEditing ? 'Mise à jour' : 'Nouveau Projet'}</h3>
                        </div>
                        <p className="text-sm text-(--text) mb-6">
                            Voulez-vous {isEditing ? 'mettre à jour le projet' : "créer le projet"} <strong>{formData.name}</strong> ?
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

            {showDeleteModal && projectToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                    <div className="bg-(--bg-secondary) rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-red-500/20 transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-red-500/10 text-red-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-red-600">Suppression dangereuse</h3>
                        </div>
                        <p className="text-sm text-(--text) mb-6">
                            Êtes-vous sûr de vouloir supprimer le projet <strong>{projectToDelete.name}</strong> ? Les tâches associées pourraient être impactées.
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

export default ProjectsManage;