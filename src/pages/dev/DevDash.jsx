import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

const DevDash = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ tasks: [], projects: [], absences: [] });
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchPersonalData = async () => {
            try {
                const [usersRes, tasksRes, projectsRes, absencesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/tasks'),
                    api.get('/projects'),
                    api.get('/absences')
                ]);

                const users = usersRes.data.member || [];
                const me = users.find(u => u.email === userEmail);
                setCurrentUser(me);

                setData({
                    tasks: tasksRes.data.member || [],
                    projects: projectsRes.data.member || [],
                    absences: absencesRes.data.member || []
                });
            } catch (error) {
                console.error("Échec de l'acquisition des données", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPersonalData();
    }, [userEmail]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!currentUser) return null;

    const myTasks = data.tasks.filter(t => {
        if (!t.users) return false;
        return t.users.some(u => {
            const uIri = typeof u === 'string' ? u : u['@id'];
            return uIri === currentUser['@id'];
        });
    });

    const myProjects = data.projects.filter(p => {
        if (!p.users) return false;
        return p.users.some(u => {
            const uIri = typeof u === 'string' ? u : u['@id'];
            return uIri === currentUser['@id'];
        });
    });

    const myAbsences = data.absences.filter(a => {
        const userIri = typeof a.user === 'string' ? a.user : a.user?.['@id'];
        return userIri === currentUser['@id'];
    });

    const tasksTodo = myTasks.filter(t => (t.status || 'TODO') === 'TODO').length;
    const tasksInProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const tasksDone = myTasks.filter(t => t.status === 'DONE').length;

    const tasksByProjectRadar = myProjects.map(project => ({
        subject: project.name.substring(0, 15) + (project.name.length > 15 ? '...' : ''),
        A: myTasks.filter(t => t.project?.id === project.id).length,
        fullMark: Math.max(10, myTasks.length)
    })).filter(d => d.A > 0);

    const pendingAbsences = myAbsences.filter(a => a.status === 'PENDING').length;
    const completionRate = myTasks.length > 0 ? Math.round((tasksDone / myTasks.length) * 100) : 0;

    return (
        <div className="space-y-6 relative z-0 animate-in fade-in duration-700 pb-10">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-(--accent) pl-5 py-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight uppercase font-mono">
                        Terminal Opérationnel
                    </h1>
                    <p className="text-sm text-(--text) mt-1">
                        Utilisateur identifié : <span className="font-bold text-(--accent)">{currentUser.firstName} {currentUser.lastName}</span>. Accès aux variables d'environnement autorisé.
                    </p>
                </div>
                <div className="px-4 py-2 bg-(--code-bg) border border-(--border) rounded-md text-(--text-h) font-mono text-sm shadow-sm flex items-center gap-3">
                    <span>EFFICACITÉ_EXECUTION =</span>
                    <span className="text-(--accent) font-bold text-lg">{completionRate}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-(--bg-secondary)/80 backdrop-blur-xl border border-(--border) rounded-xl shadow-lg p-6 flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-(--text) uppercase tracking-widest mb-6 font-mono">Pipeline de Tâches</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div onClick={() => navigate('/kanban')} className="flex flex-col items-center p-4 bg-(--bg) border border-(--border) rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                            <span className="text-4xl font-black text-gray-500 font-mono">{tasksTodo}</span>
                            <span className="text-xs font-bold text-(--text) mt-2 uppercase">À compiler</span>
                        </div>
                        <div onClick={() => navigate('/kanban')} className="flex flex-col items-center p-4 bg-(--bg) border border-blue-500/30 rounded-lg cursor-pointer hover:border-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            <span className="text-4xl font-black text-blue-500 font-mono">{tasksInProgress}</span>
                            <span className="text-xs font-bold text-blue-500 mt-2 uppercase">En exécution</span>
                        </div>
                        <div onClick={() => navigate('/kanban')} className="flex flex-col items-center p-4 bg-(--bg) border border-(--border) rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                            <span className="text-4xl font-black text-green-500 font-mono">{tasksDone}</span>
                            <span className="text-xs font-bold text-(--text) mt-2 uppercase">Build réussi</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 w-full bg-(--code-bg) h-2 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(tasksDone / myTasks.length) * 100}%` }} className="bg-green-500 h-full transition-all duration-1000"></div>
                        <div style={{ width: `${(tasksInProgress / myTasks.length) * 100}%` }} className="bg-blue-500 h-full transition-all duration-1000"></div>
                        <div style={{ width: `${(tasksTodo / myTasks.length) * 100}%` }} className="bg-gray-500 h-full transition-all duration-1000"></div>
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/80 backdrop-blur-xl border border-(--border) rounded-xl shadow-lg p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-(--text) uppercase tracking-widest mb-2 font-mono">Modules Actifs</h3>
                    
                    <div className="flex-1 flex items-center justify-between p-4 bg-(--code-bg) rounded-lg border border-(--border) cursor-pointer hover:border-purple-500 group transition-colors">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-(--text-h) group-hover:text-purple-500 font-mono transition-colors">{myProjects.length}</span>
                            <span className="text-xs text-(--text)">Projets assignés</span>
                        </div>
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                    </div>

                    <div onClick={() => navigate('/my_absence')} className="flex-1 flex items-center justify-between p-4 bg-(--code-bg) rounded-lg border border-(--border) cursor-pointer hover:border-yellow-500 group transition-colors">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-(--text-h) group-hover:text-yellow-500 font-mono transition-colors">{pendingAbsences}</span>
                            <span className="text-xs text-(--text)">Requêtes d'absence</span>
                        </div>
                        <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-lg relative">
                            {pendingAbsences > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>}
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-xl shadow-lg p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-sm font-bold text-(--text) uppercase tracking-widest font-mono">
                            Thread d'Exécution
                        </h3>
                        <button onClick={() => navigate('/kanban')} className="text-xs font-mono text-(--accent) hover:underline border border-(--accent)/30 px-2 py-1 rounded">
                            {'>_'} Ouvrir Kanban
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {myTasks.filter(t => t.status !== 'DONE').map(task => (
                            <div 
                                key={task.id} 
                                onClick={() => navigate('/kanban')}
                                className="p-3 bg-(--code-bg) border-l-2 border-l-(--accent) border-y border-r border-(--border) flex items-center justify-between hover:bg-(--bg) cursor-pointer transition-colors group"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[9px] font-mono text-(--accent) bg-(--accent)/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                            {task.project?.name || 'SYS'}
                                        </span>
                                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                                            [{task.status === 'IN_PROGRESS' ? 'RUNNING' : 'QUEUED'}]
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-(--text-h) text-sm truncate group-hover:text-(--accent) transition-colors">{task.title}</h4>
                                </div>
                            </div>
                        ))}
                        {myTasks.filter(t => t.status !== 'DONE').length === 0 && (
                            <div className="h-full flex items-center justify-center text-(--text) text-sm font-mono italic">
                                &gt; File d'attente vide.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-xl shadow-lg p-6 flex flex-col min-h-[400px]">
                    <h3 className="text-sm font-bold text-(--text) uppercase tracking-widest mb-2 shrink-0 font-mono">
                        Spectre d'Implication
                    </h3>
                    <div className="flex-1 w-full relative">
                        {tasksByProjectRadar.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={tasksByProjectRadar}>
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text)', fontSize: 10, fontFamily: 'monospace' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                                    <Radar name="Tâches" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '0.5rem', fontFamily: 'monospace' }}
                                        itemStyle={{ color: 'var(--text-h)', fontWeight: 'bold' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-(--text) text-sm font-mono italic">
                                &gt; Aucune donnée d'implication.
                            </div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DevDash;