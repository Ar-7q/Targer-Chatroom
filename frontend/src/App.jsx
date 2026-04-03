
import Navigation from './components/shared/Navigation/Navigation';
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home';
// import Register from './pages/Register/Register';
// import Login from './pages/Login/Login';
import { useSelector } from 'react-redux';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';

function App() {


  return (
    <>

      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
          <Route path="/authenticate" element={<GuestRoute><Authenticate /></GuestRoute>} />
          <Route path="/activate" element={<SemiProtectedRoute><Activate /></SemiProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

const GuestRoute = ({ children }) => {
    const { isAuth } = useSelector((state) => state.auth);

    if (isAuth) {
        return <Navigate to="/rooms" replace />;
    }

    return children;
};

const SemiProtectedRoute = ({ children }) => {
    const { user, isAuth } = useSelector((state) => state.auth);

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    if (isAuth && !user?.activated) {
        return children;
    }

    return <Navigate to="/rooms" replace />;
};

const ProtectedRoute = ({ children }) => {
    const { user, isAuth } = useSelector((state) => state.auth);

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    if (isAuth && !user?.activated) {
        return <Navigate to="/activate" replace />;
    }

    return children;
};

export default App
