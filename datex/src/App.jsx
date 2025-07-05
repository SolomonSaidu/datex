// ✅ Correct App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Notification from "./pages/Notification";
import About from "./pages/About";
import MainLayout from "./layout/MainLayout";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";


function App() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="*" element={(
        <div className=" grid justify-center">
          <h1 className="font-bold text-2xl text-center mt-8">Page not found</h1>
          <p>Opps... you are in the wrong url, that is why your seeing this</p>
          <button className=" p-2 px-8 font-semibold rounded-md mx-auto cursor-pointer mt-4 w-fit text-white bg-blue-600">
            Go back
          </button>
        </div>
      )} />


      <Route
        path="/dashboard"
        element={
            <PrivateRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/notify"
        element={
          <PrivateRoute>
            <MainLayout>
            <Notification />
          </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PrivateRoute>
            <MainLayout>
            <About />
          </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
