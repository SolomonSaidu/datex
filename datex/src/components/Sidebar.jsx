import { Link, useLocation } from "react-router-dom";
import { FaHome, FaPlusCircle, FaBell, FaInfoCircle } from "react-icons/fa";
import { MdDashboard } from 'react-icons/md'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const navLinks = [
    { name: "Dashboard", to: "/dashboard", icon: <MdDashboard /> },
    { name: "Notification", to: "/notify", icon: <FaBell /> },
    { name: "About", to: "/about", icon: <FaInfoCircle /> },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/20 bg-opacity-30 z-20 lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow z-30 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:block`}
      >
        <div className="p-6 text-2xl font-bold text-blue-600">
          Date<span className="text-black">X</span>
        </div>
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleClick}
              className={`flex items-center gap-3 px-4 py-2 rounded font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-100"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
