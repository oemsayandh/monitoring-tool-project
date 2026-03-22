import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HostDashboard from "./pages/HostDashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Host only */}
                <Route path="/host" element={
                    <PrivateRoute requiredRole="host">
                        <HostDashboard />
                    </PrivateRoute>
                } />
                <Route path="/create-room" element={
                    <PrivateRoute requiredRole="host">
                        <CreateRoom />
                    </PrivateRoute>
                } />

                {/* User only */}
                <Route path="/user" element={
                    <PrivateRoute requiredRole="user">
                        <UserDashboard />
                    </PrivateRoute>
                } />
                <Route path="/join-room" element={
                    <PrivateRoute requiredRole="user">
                        <JoinRoom />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;