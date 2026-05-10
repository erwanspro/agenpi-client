import { jwtDecode } from "jwt-decode";
import AdminDash from "./admin/AdminDash";
import RHDash from "./rh/RHDash";
import DevDash from "./dev/DevDash";

const Home = () => {
    const token = localStorage.getItem('token');
    let roles = [];

    if (token) {
        try {
            const decoded = jwtDecode(token);
            roles = decoded.roles || [];
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
        }
    }

    return (

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
    );
};

export default Home;