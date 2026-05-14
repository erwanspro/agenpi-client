import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const AdminDash = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: [],
        projects: [],
        tasks: [],
        absences: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [usersRes, projectsRes, tasksRes, absencesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/projects'),
                    api.get('/tasks'),
                    api.get('/absences')
                ]);

                setStats({
                    users: usersRes.data.member || [],
                    projects: projectsRes.data.member || [],
                    tasks: tasksRes.data.member || [],
                    absences: absencesRes.data.member || []
                });
            } catch (error) {
                console.error("Erreur de synchronisation des données", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const statusColors = {
        'En attente': '#64748b',
        'En cours': '#3b82f6',
        'Terminé': '#22c55e',
        'default': '#f59e0b'
    };

    const projectStatusCounts = stats.projects.reduce((acc, project) => {
        const status = project.status || 'Inconnu';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const projectStatusData = Object.keys(projectStatusCounts).map(status => ({
        name: status,
        value: projectStatusCounts[status],
        color: statusColors[status] || statusColors['default']
    }));

    const taskDistributionData = stats.projects.map(project => ({
        name: project.name.substring(0, 10) + (project.name.length > 10 ? '...' : ''),
        taches: stats.tasks.filter(t => t.project?.id === project.id).length
    })).filter(d => d.taches > 0).slice(0, 5); 

    const serviceCounts = stats.users.reduce((acc, user) => {
        const srv = user.service?.name || 'Non assigné';
        acc[srv] = (acc[srv] || 0) + 1;
        return acc;
    }, {});
    
    const serviceData = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);

    const workloadData = stats.users.map(user => {
        const taskCount = stats.tasks.filter(t => {
            if (!t.users) return false;
            return t.users.some(u => {
                const uIri = typeof u === 'string' ? u : u['@id'];
                const userIri = user['@id'] || `/api/users/${user.id}`;
                return uIri === userIri;
            });
        }).length;
        return { ...user, taskCount };
    }).sort((a, b) => b.taskCount - a.taskCount).slice(0, 4);

    const pendingAbsences = stats.absences.filter(a => a.status === 'PENDING').length;

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative z-0 animate-in fade-in duration-700 pb-10">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-(--bg-secondary) to-(--code-bg) p-6 rounded-2xl border border-(--border) shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-(--text-h) to-(--accent)">
                        Centre de Commandement
                    </h1>
                    <p className="text-sm text-(--text) mt-2 max-w-xl">
                        Analyse télémétrique en temps réel de l'infrastructure de l'agence. Les métriques sont synchronisées et opérationnelles.
                    </p>
                </div>
                <div className="px-4 py-2 bg-(--accent)/10 border border-(--accent)/20 rounded-xl text-(--accent) font-bold text-sm shadow-inner flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-(--accent) animate-pulse"></span>
                    Système en ligne
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div 
                    onClick={() => navigate('/users_manage')}
                    className="bg-(--bg-secondary)/80 backdrop-blur-xl p-6 rounded-2xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-(--accent)/10 transition-all duration-300 group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-(--text-h) group-hover:text-blue-500 transition-colors">{stats.users.length}</h3>
                        <p className="text-sm font-medium text-(--text) uppercase tracking-wider mt-1">Collaborateurs</p>
                    </div>
                    <div className="w-full bg-(--code-bg) h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[100%]"></div>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/project_manage')}
                    className="bg-(--bg-secondary)/80 backdrop-blur-xl p-6 rounded-2xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-(--accent)/10 transition-all duration-300 group delay-75 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-(--text-h) group-hover:text-purple-500 transition-colors">{stats.projects.length}</h3>
                        <p className="text-sm font-medium text-(--text) uppercase tracking-wider mt-1">Projets Globaux</p>
                    </div>
                    <div className="w-full bg-(--code-bg) h-1.5 rounded-full mt-4 overflow-hidden flex">
                        <div className="bg-purple-500 h-full w-full"></div>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/taskboard')}
                    className="bg-(--bg-secondary)/80 backdrop-blur-xl p-6 rounded-2xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-(--accent)/10 transition-all duration-300 group delay-150 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4" /></svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-(--text-h) group-hover:text-green-500 transition-colors">{stats.tasks.length}</h3>
                        <p className="text-sm font-medium text-(--text) uppercase tracking-wider mt-1">Tâches Réparties</p>
                    </div>
                    <div className="w-full bg-(--code-bg) h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full w-[85%] rounded-full"></div>
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/absence_manage')}
                    className="bg-(--bg-secondary)/80 backdrop-blur-xl p-6 rounded-2xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-(--accent)/10 transition-all duration-300 group delay-200 relative overflow-hidden cursor-pointer"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-xl group-hover:rotate-12 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        {pendingAbsences > 0 && (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-(--text-h) group-hover:text-yellow-500 transition-colors">{pendingAbsences}</h3>
                        <p className="text-sm font-medium text-(--text) uppercase tracking-wider mt-1">Congés en attente</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl p-6 shadow-lg flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-(--text-h) mb-6 flex items-center gap-2 shrink-0">
                        <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        Répartition Projets
                    </h3>
                    <div className="flex-1 w-full min-h-[250px] relative">
                        {projectStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '0.75rem', color: 'var(--text-h)' }}
                                        itemStyle={{ color: 'var(--text-h)', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-(--text) text-sm italic">Données insuffisantes</div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs font-medium shrink-0">
                        {projectStatusData.map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }}></span>
                                <span className="text-(--text)">{d.name} ({d.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl p-6 shadow-lg flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-(--text-h) mb-6 flex items-center gap-2 shrink-0">
                        <svg className="w-5 h-5 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Densité des Tâches par Projet
                    </h3>
                    <div className="flex-1 w-full min-h-[250px] relative">
                        {taskDistributionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={taskDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{ fill: 'var(--code-bg)' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '0.75rem' }}
                                    />
                                    <Bar dataKey="taches" fill="var(--accent)" radius={[6, 6, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-(--text) text-sm italic">Aucune donnée de tâche analysable</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-lg font-bold text-(--text-h) mb-4">Derniers Projets</h3>
                    <div className="flex-1 space-y-3">
                        {stats.projects.slice(-3).reverse().map((project) => (
                            <div 
                                key={project.id} 
                                onClick={() => navigate('/project_manage')}
                                className="p-4 bg-(--bg) border border-(--border) rounded-xl hover:border-(--accent)/50 hover:bg-(--code-bg) transition-all group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-(--text-h) truncate pr-2 group-hover:text-(--accent) transition-colors">{project.name}</h4>
                                </div>
                                <div className="text-[10px] text-(--text) font-medium flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(project.startDate).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md font-bold bg-(--code-bg) text-(--text) border border-(--border)">
                                        {project.status || 'Sans statut'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {stats.projects.length === 0 && (
                            <div className="h-full flex items-center justify-center py-6 text-(--text) text-sm italic border-2 border-dashed border-(--border) rounded-xl">
                                Aucune donnée structurelle.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-lg font-bold text-(--text-h) mb-4">Effectifs par Service</h3>
                    <div className="flex-1 space-y-4 justify-center flex flex-col">
                        {serviceData.length > 0 ? serviceData.map(([srvName, count], idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold text-(--text-h)">
                                    <span>{srvName}</span>
                                    <span>{count} collaborateur{count > 1 ? 's' : ''}</span>
                                </div>
                                <div className="w-full bg-(--code-bg) h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" 
                                        style={{ width: `${(count / stats.users.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-(--text) text-sm italic">Aucun utilisateur assigné.</div>
                        )}
                    </div>
                </div>

                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-lg font-bold text-(--text-h) mb-4">Charge de Travail (Top 4)</h3>
                    <div className="flex-1 space-y-3">
                        {workloadData.length > 0 && workloadData[0].taskCount > 0 ? workloadData.map((user, idx) => {
                            if (user.taskCount === 0) return null;
                            const initials = `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`;
                            const isOverloaded = user.taskCount > 5;
                            
                            return (
                                <div 
                                    key={user.id} 
                                    onClick={() => navigate('/messages', { state: { activeChatId: user.id } })}
                                    className="flex items-center justify-between p-3 bg-(--code-bg)/50 rounded-xl border border-(--border) hover:border-(--accent)/50 hover:bg-(--code-bg) transition-all cursor-pointer group"
                                    title={`Envoyer un message à ${user.firstName}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:from-(--accent) group-hover:to-blue-500 transition-all">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-(--text-h) group-hover:text-(--accent) transition-colors">{user.firstName} {user.lastName}</span>
                                            <span className="text-[10px] text-(--text)">{user.service?.name || 'Agence'}</span>
                                        </div>
                                    </div>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${isOverloaded ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-(--bg) text-(--text-h) border border-(--border)'}`}>
                                        {user.taskCount}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="h-full flex items-center justify-center text-(--text) text-sm italic">Aucune tâche assignée.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDash;