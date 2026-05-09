import { Routes, Route } from 'react-router-dom';
import CreateEmployee from './pages/CreateEmployee';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
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
        
      </Routes>
    </>
  );
}

export default App;