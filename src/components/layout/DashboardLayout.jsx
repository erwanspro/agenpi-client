import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    return (
        // flex row : La Sidebar à gauche, le reste de l'écran à droite. h-screen pour bloquer le scroll global.
        <div className="flex h-screen overflow-hidden bg-(--bg) text-(--text) transition-colors duration-200">
            
            {/* 1. LA BARRE LATÉRALE */}
            <Sidebar />

            {/* 2. LE RESTE DE L'ÉCRAN */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                
                {/* 2A. LA BARRE DU HAUT */}
                <Topbar />

                {/* 2B. LE CONTENU DE LA PAGE */}
                <main className="p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
                    <Outlet />
                </main>
                
            </div>
        </div>
    );
};

export default DashboardLayout;