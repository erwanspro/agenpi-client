import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import MultiSelect from '../../components/MultiSelect';

const TasksBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // états de la modale
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'TODO',
        project: '',
        users: []
    });

    const fetchData = async () => {
        try {
            // on charge tout d'un coup
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/projects'),
                api.get('/users')
            ]);
            setTasks(tasksRes.data.member || []);
            setProjects(projectsRes.data.member || []);
            setUsers(usersRes.data.member || []);
        } catch (error) {
            toast.error("erreur lors du chargement des données.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUsersChange = (selectedUsers) => {
        setFormData({ ...formData, users: selectedUsers });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentTaskId(null);
        setFormData({ title: '', description: '', status: 'TODO', project: '', users: [] });
    };

    const openCreateModal = (defaultStatus = 'TODO') => {
        resetForm();
        setFormData(prev => ({ ...prev, status: defaultStatus }));
        setShowModal(true);
    };

    const handleEditTask = (task) => {
        setIsEditing(true);
        // sécurisation de l'id
        const uniqueId = task.id || (task['@id'] ? task['@id'].split('/').pop() : null);
        setCurrentTaskId(uniqueId);
        
        setFormData({
            title: task.title || task.name || '',
            description: task.description || '',
            status: task.status || 'TODO',
            // on récupère juste l'ID du projet pour le menu déroulant
            project: task.project ? (task.project.id || task.project['@id'].split('/').pop()) : '',
            // on extrait les IRIs des utilisateurs
            users: task.users ? task.users.map(u => typeof u === 'string' ? u : (u['@id'] || `/api/users/${u.id}`)) : []
        });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const dataToSend = {
            title: formData.title,
            description: formData.description || null,
            status: formData.status,
            project: `/api/projects/${formData.project}`,
            users: formData.users
        };

        try {
            if (isEditing) {
                await api.patch(`/tasks/${currentTaskId}`, dataToSend, {
                    headers: { 'Content-Type': 'application/merge-patch+json' }
                });
                toast.success("Tâche mise à jour !");
            } else {
                await api.post('/tasks', dataToSend);
                toast.success("Tâche créée !");
            }
            setShowModal(false);
            fetchData(); // on recharge pour avoir les relations propres
        } catch (error) {
            toast.error(`Erreur lors de la ${isEditing ? 'modification' : 'création'}.`);
        }
    };

    const updateTaskStatus = async (e, taskId, newStatus) => {
        e.stopPropagation(); // empêche d'ouvrir la modale d'édition si on clique juste sur la flèche
        
        const previousTasks = [...tasks];
        setTasks(tasks.map(t => (t.id === taskId || t['@id'] === taskId) ? { ...t, status: newStatus } : t));

        try {
            const idToUpdate = taskId.toString().startsWith('/') ? taskId.split('/').pop() : taskId;
            await api.patch(`/tasks/${idToUpdate}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
        } catch (error) {
            setTasks(previousTasks);
            toast.error("erreur lors du déplacement.");
        }
    };

    const columns = [
        { id: 'TODO', title: 'À faire', headerBg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
        { id: 'IN_PROGRESS', title: 'En cours', headerBg: 'bg-blue-500/10', text: 'text-blue-500' },
        { id: 'DONE', title: 'Terminé', headerBg: 'bg-green-500/10', text: 'text-green-500' }
    ];

    const getColumnTasks = (statusId) => {
        return tasks.filter(t => (t.status || 'TODO') === statusId);
    };

    const userOptions = users.map(user => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user['@id'] || `/api/users/${user.id}`
    }));

    return (
        <div className="space-y-6 relative z-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Tableau Kanban</h1>
                    <p className="text-sm text-(--text) mt-1">Gérez et assignez les tâches de l'équipe.</p>
                </div>
                <button 
                    onClick={() => openCreateModal('TODO')}
                    className="px-5 py-2.5 bg-gradient-to-r from-(--accent) to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-(--accent-bg) hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Nouvelle tâche
                </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[600px]">
                {columns.map(col => (
                    <div key={col.id} className="min-w-[320px] w-full max-w-[400px] bg-(--bg-secondary)/80 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden border border-(--border)">
                        
                        <div className={`px-4 py-3 border-b border-(--border) flex items-center justify-between ${col.headerBg}`}>
                            <h3 className={`font-bold text-sm uppercase tracking-wider ${col.text}`}>{col.title}</h3>
                            <button 
                                onClick={() => openCreateModal(col.id)}
                                className="p-1 hover:bg-(--bg) rounded-md transition-colors" title="Ajouter ici"
                            >
                                <svg className={`w-4 h-4 ${col.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-(--code-bg)/30 min-h-[150px]">
                            {isLoading ? (
                                <div className="animate-pulse flex flex-col gap-3">
                                    <div className="h-28 bg-(--border)/50 rounded-xl"></div>
                                </div>
                            ) : getColumnTasks(col.id).length === 0 ? (
                                <div className="text-center py-8 text-sm text-(--text) opacity-60 font-medium border-2 border-dashed border-(--border) rounded-xl">
                                    Aucune tâche
                                </div>
                            ) : (
                                getColumnTasks(col.id).map((task, index) => {
                                    const uniqueId = task.id || task['@id'] || `task-${index}`;

                                    return (
                                        <div 
                                            key={uniqueId} 
                                            onClick={() => handleEditTask(task)}
                                            className="bg-(--bg-secondary) p-4 rounded-xl border border-(--border) shadow-sm hover:shadow-md hover:border-(--accent)/50 transition-all group cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--accent) bg-(--accent)/10 px-2 py-1 rounded-md">
                                                    {task.project?.name || 'Projet inconnu'}
                                                </span>
                                            </div>
                                            
                                            <h4 className="text-(--text-h) font-bold text-sm mb-2">{task.title || task.name}</h4>
                                            
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--border)">
                                                <div className="flex -space-x-2">
                                                    {task.users && task.users.length > 0 ? task.users.map((user, idx) => {
                                                        if (typeof user === 'string') return null; 
                                                        const userKey = user.id || user['@id'] || idx;
                                                        return (
                                                            <div key={userKey} className="w-7 h-7 rounded-full bg-gradient-to-tr from-(--accent) to-blue-400 text-white flex items-center justify-center text-[10px] font-bold border-2 border-(--bg-secondary) shadow-sm" title={`${user.firstName} ${user.lastName}`}>
                                                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                            </div>
                                                        )
                                                    }) : (
                                                        <span className="text-[10px] text-(--text) opacity-60">Non assignée</span>
                                                    )}
                                                </div>

                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {col.id !== 'TODO' && (
                                                        <button onClick={(e) => updateTaskStatus(e, uniqueId, col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="p-1.5 text-(--text) hover:text-(--accent) bg-(--code-bg) rounded-lg hover:bg-(--accent)/10 transition-colors border border-(--border)" title="Déplacer à gauche">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                                        </button>
                                                    )}
                                                    {col.id !== 'DONE' && (
                                                        <button onClick={(e) => updateTaskStatus(e, uniqueId, col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="p-1.5 text-(--text) hover:text-(--accent) bg-(--code-bg) rounded-lg hover:bg-(--accent)/10 transition-colors border border-(--border)" title="Déplacer à droite">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE CRÉATION / ÉDITION TÂCHE */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 p-4">
                    <div className="bg-(--bg-secondary) rounded-2xl w-full max-w-lg shadow-2xl border border-(--border) overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-(--border) bg-(--code-bg)/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-(--text-h) flex items-center gap-2">
                                <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                {isEditing ? 'Éditer la tâche' : 'Nouvelle tâche'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-(--text) hover:text-red-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Titre *</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Projet *</label>
                                    <select name="project" required value={formData.project} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all cursor-pointer">
                                        <option value="" disabled>Choisir...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Statut *</label>
                                    <select name="status" required value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all cursor-pointer">
                                        <option value="TODO">À faire</option>
                                        <option value="IN_PROGRESS">En cours</option>
                                        <option value="DONE">Terminé</option>
                                    </select>
                                </div>
                            </div>

                            <MultiSelect 
                                label="Assigner des développeurs"
                                placeholder="Sélectionner..."
                                options={userOptions}
                                selected={formData.users}
                                onChange={handleUsersChange}
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text) uppercase tracking-wide">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 bg-(--bg) border border-(--border) rounded-xl text-(--text-h) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all resize-none"></textarea>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-(--text) bg-(--code-bg) hover:bg-(--border) border border-(--border) rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-(--accent) to-blue-500 hover:opacity-90 rounded-xl transition-all shadow-md">
                                    {isEditing ? 'Enregistrer' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksBoard;