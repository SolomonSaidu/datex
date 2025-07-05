import { FaBars, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Navbar = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

    const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6", // blue
      cancelButtonColor: "#d33",     // red
      confirmButtonText: "Yes, log me out",
    });

    if (result.isConfirmed) {
      try {
        await logout();
        Swal.fire("Logged out", "You’ve been signed out.", "success");
        navigate("/");
      } catch (err) {
        Swal.fire("Error", "Logout failed. Try again.", "error");
      }
    }
  };
  return (
    <header className="flex lg:justify-end items-center justify-between px-4 py-3 bg-white border-b border-gray-400 shadow sticky top-0 z-10">
      <div className="lg:hidden">
        <button onClick={toggleSidebar}>
          <FaBars size={24} />
        </button>
      </div>
      {/* <h1 className="text-lg font-semibold text-blue-600 hidden lg:block">Good Morning, Admin</h1> */}
      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-green-500 text-white rounded active:scale-95 transition duration-200">
        <FaUserCircle />
        LogOut
      </button>
    </header>
  );
};

export default Navbar;
