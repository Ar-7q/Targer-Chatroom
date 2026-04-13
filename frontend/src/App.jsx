import Navigation from './components/shared/Navigation/Navigation';
import './App.css';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import { useSelector } from 'react-redux';

import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';

// ✅ ADDED (missing from your code)
import Room from './pages/Room/Room';
import Loader from './components/shared/Loader/Loader';
import { useLoadingWithRefresh } from './hooks/useLoadingWithRefresh';
import { Toaster } from 'sonner';
import Profile from './pages/Profile/Profile';

function App() {

    // ✅ ADDED (auth persistence)
    const { loading } = useLoadingWithRefresh();

    // ✅ ADDED (loader before app loads)
    if (loading) {
        return <Loader message="Loading, please wait..." />;
    }

    return (
        <BrowserRouter>
            <Navigation />
            <Toaster position='top-right' richColors />
            <Routes>
                <Route path="/" element={
                    <GuestRoute><Home /></GuestRoute>} />
                <Route path="/authenticate" element={
                    <GuestRoute><Authenticate /></GuestRoute>} />
                <Route path="/activate" element={
                    <SemiProtectedRoute><Activate /></SemiProtectedRoute>} />
                <Route path="/rooms" element={
                    <ProtectedRoute>
                        <Rooms />
                    </ProtectedRoute>} />

                {/* (single room page) */}
                <Route path="/room/:id" element={
                    <ProtectedRoute><Room /></ProtectedRoute>
                } />

                {/* added the profile page */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
                />
            </Routes>
        </BrowserRouter>
    );
}


// ================= ROUTES =================

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

export default App;