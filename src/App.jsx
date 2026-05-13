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
import ProjectsManage from './pages/admin/ProjectsManage';
import TasksBoard from './pages/admin/TasksBoard';
import Kanban from './pages/dev/Kanban';
import AbsenceManage from './pages/rh/AbsenceManage';
import MyAbsence from './pages/dev/MyAbsences';
import UsersManage from './pages/rh/UsersManage';

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
            
            <Route path="/users_manage" element={<UsersManage />} />
            <Route path="/absence_manage" element={<AbsenceManage />} />
            <Route path="/my_absence" element={<MyAbsence />} />
            <Route path="/kanban" element={<Kanban />} />

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

            <Route path="/project_manage" element={
              <AdminRoute>
                <ProjectsManage />
              </AdminRoute>
            } />

            <Route path="/taskboard" element={
              <AdminRoute>
                <TasksBoard />
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