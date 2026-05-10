import { Routes, Route } from 'react-router-dom';
import CreateEmployee from './pages/CreateEmployee';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminRoute from './components/AdminRoute';
import NotFound from './components/NotFound';
import GuestRoute from './components/GuestRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      {/* conteneur invisible qui gérera les apparitions notif */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Routes>
        <Route 
          path="/" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />       
        
        <Route path="/home" element={<Home />} />

        {/* Route RH*/}
        <Route path="/users_manage" element={<Home />} />
        <Route path="/absence_manage" element={<Home />} />

        {/* Route DEV*/}
        <Route path="/my_absence" element={<Home />} />
        <Route path="/task" element={<Home />} />

        {/* Route PROTÉGÉE pour ADMIN*/}
        <Route path="/create_employee" element={
          <AdminRoute>
            <CreateEmployee />
          </AdminRoute>
          } 
        />

        {/* ROUTE 404 DOIT TOUJOURS ÊTRE DERNIER */}
        <Route path="*" element={<NotFound />} /> 

      </Routes>
    </>
  );
}

export default App;