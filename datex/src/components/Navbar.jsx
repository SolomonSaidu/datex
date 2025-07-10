import { FaBars, FaUserCircle, FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

const Navbar = ({ toggleSidebar }) => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      if (!currentUser?.uid) return;

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const unseen = data.filter((notif) => !notif.seen);
      setUnreadCount(unseen.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  fetchNotifications();

  // 🔁 Re-check if notification state changes via localStorage
  const interval = setInterval(() => {
    if (localStorage.getItem("noti-update")) {
      fetchNotifications();
      localStorage.removeItem("noti-update"); // clear it after use
    }
  }, 1000); // runs every second

  return () => clearInterval(interval); // clean up
}, [currentUser]);


  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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

      <div className="flex items-center gap-4">
        <Link to="/notify" className="relative text-xl">
          <FaBell className="text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-green-500 text-white rounded active:scale-95 transition duration-200"
        >
          <FaUserCircle />
          Log out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
