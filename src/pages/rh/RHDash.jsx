import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import api from '../../api/axios';

const RHDash = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: [],
        tasks: [],
        absences: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHRData = async () => {
            try {
                const [usersRes, tasksRes, absencesRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/tasks'),
                    api.get('/absences')
                ]);

                setStats({
                    users: usersRes.data.member || [],
                    tasks: tasksRes.data.member || [],
                    absences: absencesRes.data.member || []
                });
            } catch (error) {
                console.error("Anomalie lors de l'extraction des données RH", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHRData();
    }, []);

    // 🧪 Analyse de la répartition des talents (Anneau)
    const serviceColors = ['#10b981', '#3b82f6', '#f43f5e', '#8b5cf6', '#f59e0b'];
    const serviceCounts = stats.users.reduce((acc, user) => {
        const srv = user.service?.name || 'Indépendant';
        acc[srv] = (acc[srv] || 0) + 1;
        return acc;
    }, {});
    
    const serviceData = Object.keys(serviceCounts).map((key, index) => ({
        name: key,
        value: serviceCounts[key],
        color: serviceColors[index % serviceColors.length]
    }));

    // 🧪 Analyse temporelle des absences (Courbe)
    const absencesByMonth = stats.absences.reduce((acc, abs) => {
        if (!abs.startDate) return acc;
        const date = new Date(abs.startDate);
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        if (!acc[monthLabel]) acc[monthLabel] = { name: monthLabel, validées: 0, attente: 0 };
        
        if (abs.status === 'APPROVED') acc[monthLabel].validées += 1;
        if (abs.status === 'PENDING') acc[monthLabel].attente += 1;
        
        return acc;
    }, {});
    
    // Tri chronologique basique des clés
    const absenceTrendData = Object.values(absencesByMonth);

    // 🧪 Algorithme de détection de surcharge (Prévention Burnout)
    const workloadAlerts = stats.users.map(user => {
        const activeTasks = stats.tasks.filter(t => {
            if (t.status === 'DONE' || !t.users) return false;
            return t.users.some(u => {
                const uIri = typeof u === 'string' ? u : u['@id'];
                return uIri === (user['@id'] || `/api/users/${user.id}`);
            });
        }).length;
        return { ...user, activeTasks };
    }).filter(u => u.activeTasks > 0).sort((a, b) => b.activeTasks - a.activeTasks).slice(0, 5);

    const pendingAbsencesList = stats.absences.filter(a => a.status === 'PENDING');

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative z-0 animate-in fade-in zoom-in-95 duration-700 pb-10">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-(--bg-secondary) to-emerald-900/10 p-8 rounded-[2rem] border border-(--border) shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-(--text-h) tracking-tight">
                        Pôle Ressources Humaines
                    </h1>
                    <p className="text-sm text-(--text) mt-2 max-w-2xl leading-relaxed">
                        Surveillance de l'écosystème social de l'agence. Analyse des flux de congés, équilibrage des départements et prévention de la surcharge mentale.
                    </p>
                </div>
                <div className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 font-bold text-sm shadow-inner flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Climat social stable
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div 
                    onClick={() => navigate('/users_manage')}
                    className="bg-(--bg-secondary)/90 backdrop-blur-xl p-6 rounded-3xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-(--text-h) group-hover:text-emerald-500 transition-colors">{stats.users.length}</h3>
                    <p className="text-sm font-medium text-(--text) mt-1">Effectif total</p>
                </div>

                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl p-6 rounded-3xl border border-(--border) shadow-lg hover:-translate-y-2 transition-all duration-300 group delay-75">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-(--text-h)">{serviceData.length}</h3>
                    <p className="text-sm font-medium text-(--text) mt-1">Départements actifs</p>
                </div>

                <div 
                    onClick={() => navigate('/absence_manage')}
                    className="bg-(--bg-secondary)/90 backdrop-blur-xl p-6 rounded-3xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group delay-150 relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:rotate-12 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        {pendingAbsencesList.length > 0 && (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-(--text-h) group-hover:text-amber-500 transition-colors">{pendingAbsencesList.length}</h3>
                    <p className="text-sm font-medium text-(--text) mt-1">Congés à traiter</p>
                </div>

                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl p-6 rounded-3xl border border-(--border) shadow-lg hover:-translate-y-2 hover:shadow-rose-500/10 transition-all duration-300 group delay-200">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-(--text-h)">{workloadAlerts.filter(u => u.activeTasks > 5).length}</h3>
                    <p className="text-sm font-medium text-(--text) mt-1">Alertes Surcharge (Tâches &gt; 5)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-3xl p-8 shadow-lg flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold text-(--text-h) mb-6 flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-(--code-bg) rounded-xl text-(--text)">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        </div>
                        Tendance des Absences
                    </h3>
                    <div className="flex-1 w-full relative">
                        {absenceTrendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={absenceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValidees" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAttente" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '1rem' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="validées" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValidees)" />
                                    <Area type="monotone" dataKey="attente" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorAttente)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-(--text) text-sm italic">Analyse temporelle impossible (manque de données)</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-3xl p-8 shadow-lg flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold text-(--text-h) mb-6 flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-(--code-bg) rounded-xl text-(--text)">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        </div>
                        Répartition des Talents
                    </h3>
                    <div className="flex-1 w-full relative">
                        {serviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={serviceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" cornerRadius={10}>
                                        {serviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--text-h)' }}
                                        itemStyle={{ color: 'var(--text-h)', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-(--text) text-sm italic">Écosystème vide</div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 text-xs font-medium shrink-0">
                        {serviceData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                <span className="text-(--text)">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* File d'attente des congés (Action immédiate) */}
                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-3xl p-8 shadow-lg flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-lg font-bold text-(--text-h)">Demandes en attente</h3>
                        <button onClick={() => navigate('/absence_manage')} className="text-sm font-bold text-amber-500 hover:underline">Voir tout</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {pendingAbsencesList.slice(0, 5).map(abs => {
                            const initials = abs.user ? `${abs.user.firstName?.charAt(0)}${abs.user.lastName?.charAt(0)}` : '?';
                            return (
                                <div key={abs.id} className="p-4 bg-(--bg) border border-(--border) rounded-2xl flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-(--text-h) text-sm">{abs.user?.firstName} {abs.user?.lastName}</h4>
                                            <p className="text-xs text-(--text) mt-0.5">{abs.reason?.name || 'Motif non spécifié'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-(--text-h)">
                                            {new Date(abs.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - {new Date(abs.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <button onClick={() => navigate('/absence_manage')} className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            Traiter la requête
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        {pendingAbsencesList.length === 0 && (
                            <div className="h-full flex items-center justify-center text-(--text) text-sm italic py-8">
                                Toutes les variables sont traitées.
                            </div>
                        )}
                    </div>
                </div>

                {/* Algorithme Surcharge / Burnout */}
                <div className="bg-(--bg-secondary)/90 backdrop-blur-xl border border-(--border) rounded-3xl p-8 shadow-lg flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold text-(--text-h) mb-6 flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        Surveillance de Charge (Burnout Radar)
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {workloadAlerts.map((user) => {
                            const isCritical = user.activeTasks > 7;
                            const isWarning = user.activeTasks > 4;
                            const barColor = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

                            return (
                                <div 
                                    key={user.id} 
                                    onClick={() => navigate('/messages', { state: { activeChatId: user.id } })}
                                    className="p-4 bg-(--bg) border border-(--border) rounded-2xl cursor-pointer hover:border-rose-500/50 transition-colors group"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h4 className="font-bold text-(--text-h) text-sm group-hover:text-rose-500 transition-colors">{user.firstName} {user.lastName}</h4>
                                            <p className="text-[10px] text-(--text) uppercase tracking-wider">{user.service?.name}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${isCritical ? 'bg-rose-500/10 text-rose-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {user.activeTasks} tâches actives
                                        </span>
                                    </div>
                                    <div className="w-full bg-(--code-bg) h-1.5 rounded-full overflow-hidden">
                                        <div className={`${barColor} h-full transition-all duration-1000`} style={{ width: `${Math.min((user.activeTasks / 10) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                        {workloadAlerts.length === 0 && (
                            <div className="h-full flex items-center justify-center text-(--text) text-sm italic py-8">
                                La charge de l'écosystème est parfaitement équilibrée.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RHDash;