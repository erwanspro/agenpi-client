import { Routes, Route } from 'react-router-dom';
import CreateEmployee from './pages/admin/CreateEmployee';
import Login from './pages/auth/Login';
import Home from './pages/Home';
import AdminRoute from './components/routes/AdminRoute';
import NotFound from './components/NotFound';
import GuestRoute from './components/routes/GuestRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientsManage from './pages/admin/ClientsManage';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Routes>
        {/* ROUTES HORS LAYOUT (Pas de Navbar) */}
        <Route 
          path="/" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />       
        
        {/* ROUTES DANS LE LAYOUT (Avec Navbar) */}
        <Route element={<DashboardLayout />}>
            
            <Route path="/home" element={<Home />} />
            
            <Route path="/users_manage" element={<Home />} />
            <Route path="/absence_manage" element={<Home />} />
            <Route path="/my_absence" element={<Home />} />
            <Route path="/task" element={<Home />} />

            {/*ROUTES ADMIN SECURISER */}

            <Route path="/clients_manage" element={
              <AdminRoute>
                <ClientsManage />
              </AdminRoute>
            } />

            <Route path="/create_employee" element={
              <AdminRoute>
                <CreateEmployee />
              </AdminRoute>
            } />

        </Route>

        {/* ROUTE 404 */}
        <Route path="*" element={<NotFound />} /> 

      </Routes>
    </>
  );
}

export default App;