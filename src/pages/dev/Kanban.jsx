import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const Kanban = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMyTasks, setShowMyTasks] = useState(false);

    const userEmail = localStorage.getItem('userEmail');

    const fetchData = async () => {
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users')
            ]);
            setTasks(tasksRes.data.member || []);
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

    const currentUser = users.find(u => u.email === userEmail);

    const isMyTask = (task) => {
        if (!task.users || !currentUser) return false;
        
        return task.users.some(user => {
            if (typeof user === 'string') return user === currentUser['@id'];
            return user.id === currentUser.id || user['@id'] === currentUser['@id'];
        });
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        const previousTasks = [...tasks];
        setTasks(tasks.map(t => (t.id === taskId || t['@id'] === taskId) ? { ...t, status: newStatus } : t));

        try {
            const idToUpdate = taskId.toString().startsWith('/') ? taskId.split('/').pop() : taskId;
            await api.patch(`/tasks/${idToUpdate}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/merge-patch+json' }
            });
        } catch (error) {
            setTasks(previousTasks);
            toast.error("erreur lors du déplacement de la tâche.");
        }
    };

    const columns = [
        { id: 'TODO', title: 'À faire', headerBg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
        { id: 'IN_PROGRESS', title: 'En cours', headerBg: 'bg-blue-500/10', text: 'text-blue-500' },
        { id: 'DONE', title: 'Terminé', headerBg: 'bg-green-500/10', text: 'text-green-500' }
    ];

    const displayedTasks = showMyTasks ? tasks.filter(isMyTask) : tasks;

    const getColumnTasks = (statusId) => {
        return displayedTasks.filter(t => (t.status || 'TODO') === statusId);
    };

    const renderAvatars = (taskUsers) => {
        if (!taskUsers || taskUsers.length === 0) return <span className="text-[10px] text-(--text) opacity-60">Non assignée</span>;

        return taskUsers.map((u, idx) => {
            const realUser = typeof u === 'string' ? users.find(user => user['@id'] === u) : u;
            
            if (!realUser) return null;

            const userKey = realUser.id || realUser['@id'] || idx;
            const isMe = currentUser && realUser.id === currentUser.id;
            
            return (
                <div key={userKey} className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold border-2 border-(--bg-secondary) shadow-sm ${isMe ? 'bg-(--accent) ring-2 ring-(--accent)/30 z-10' : 'bg-gradient-to-tr from-gray-400 to-gray-500'}`} title={`${realUser.firstName} ${realUser.lastName}`}>
                    {realUser.firstName?.charAt(0)}{realUser.lastName?.charAt(0)}
                </div>
            );
        });
    };

    return (
        <div className="space-y-6 relative z-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">Tableau Kanban</h1>
                    <p className="text-sm text-(--text) mt-1">Consultez et avancez sur les tâches du projet.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-(--bg-secondary)/80 p-1.5 rounded-xl border border-(--border) shadow-sm w-fit">
                    <button 
                        onClick={() => setShowMyTasks(false)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${!showMyTasks ? 'bg-(--code-bg) text-(--text-h) shadow-sm' : 'text-(--text) hover:text-(--text-h)'}`}
                    >
                        Toutes les tâches
                    </button>
                    <button 
                        onClick={() => setShowMyTasks(true)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${showMyTasks ? 'bg-(--accent) text-white shadow-md' : 'text-(--text) hover:text-(--text-h)'}`}
                    >
                        Mes tâches uniquement
                    </button>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[600px]">
                {columns.map(col => (
                    <div key={col.id} className="min-w-[320px] w-full max-w-[400px] bg-(--bg-secondary)/80 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden border border-(--border)">
                        
                        <div className={`px-4 py-3 border-b border-(--border) flex items-center justify-between ${col.headerBg}`}>
                            <h3 className={`font-bold text-sm uppercase tracking-wider ${col.text}`}>{col.title}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-(--bg) text-xs font-bold text-(--text) border border-(--border)">
                                {getColumnTasks(col.id).length}
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-(--code-bg)/30 min-h-[150px]">
                            {isLoading ? (
                                <div className="animate-pulse flex flex-col gap-3">
                                    <div className="h-28 bg-(--border)/50 rounded-xl"></div>
                                    <div className="h-28 bg-(--border)/50 rounded-xl"></div>
                                </div>
                            ) : getColumnTasks(col.id).length === 0 ? (
                                <div className="text-center py-8 text-sm text-(--text) opacity-60 font-medium border-2 border-dashed border-(--border) rounded-xl">
                                    Aucune tâche
                                </div>
                            ) : (
                                getColumnTasks(col.id).map((task, index) => {
                                    const uniqueId = task.id || task['@id'] || `task-${index}`;
                                    const canMove = isMyTask(task);

                                    return (
                                        <div key={uniqueId} className="bg-(--bg-secondary) p-4 rounded-xl border border-(--border) shadow-sm transition-all group">
                                            
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-(--accent) bg-(--accent)/10 px-2 py-1 rounded-md">
                                                    {task.project?.name || 'Projet inconnu'}
                                                </span>
                                            </div>
                                            
                                            <h4 className="text-(--text-h) font-bold text-sm mb-2">{task.title || task.name}</h4>
                                            
                                            {task.description && (
                                                <p className="text-xs text-(--text) line-clamp-2 mb-4">{task.description}</p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-(--border)">
                                                
                                                <div className="flex -space-x-2">
                                                    {renderAvatars(task.users)}
                                                </div>

                                                {canMove && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {col.id !== 'TODO' && (
                                                            <button onClick={() => updateTaskStatus(uniqueId, col.id === 'DONE' ? 'IN_PROGRESS' : 'TODO')} className="p-1.5 text-(--text) hover:text-(--accent) bg-(--code-bg) rounded-lg hover:bg-(--accent)/10 transition-colors border border-(--border)" title="Déplacer à gauche">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                                            </button>
                                                        )}
                                                        {col.id !== 'DONE' && (
                                                            <button onClick={() => updateTaskStatus(uniqueId, col.id === 'TODO' ? 'IN_PROGRESS' : 'DONE')} className="p-1.5 text-(--text) hover:text-(--accent) bg-(--code-bg) rounded-lg hover:bg-(--accent)/10 transition-colors border border-(--border)" title="Déplacer à droite">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Kanban;