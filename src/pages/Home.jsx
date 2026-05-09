import { jwtDecode } from "jwt-decode";
import AdminDash from "../components/dashboards/AdminDash";
import RHDash from "../components/dashboards/RHDash";
import DevDash from "../components/dashboards/DevDash";
import Navbar from "../components/Navbar";

const Home = () => {
    const token = localStorage.getItem('token');
    let roles = [];

    if (token) {
        try {
            const decoded = jwtDecode(token);
            roles = decoded.roles || [];
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.error("Erreur token");
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg)]">
            <Navbar />
            <main className="p-8">
                {/* On affiche le bon contenu selon le rôle */}
                {roles.includes('ROLE_ADMIN') ? (
                    <AdminDash />
                ) : roles.includes('ROLE_RH') ? (
                    <RHDash />
                ) : (
                    <DevDash />
                )}
            </main>
        </div>
    );
};

export default Home;