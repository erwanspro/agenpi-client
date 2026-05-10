import { useNavigate } from 'react-router-dom';
const NotFound = () =>{
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-center px-4">
            <div className="text-[var(--accent)] font-extrabold text-9xl mb-4">
                404
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-h)] mb-2">
                Oups ! Page introuvable.
            </h1>
            <p className="text-[var(--text)] mb-8 max-w-md">
                La page que vous recherchez semble avoir été déplacée, supprimée, ou n'a jamais existé.
            </p>
            <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-[var(--bg-secondary)] hover:bg-[var(--code-bg)] text-[var(--text-h)] border border-[var(--border)] rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Retour au tableau de bord
            </button>
        </div>
    );
}

export default NotFound;