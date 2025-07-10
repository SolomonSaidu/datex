import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { FaTrashAlt } from "react-icons/fa";

const Notification = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.uid) return;

      try {
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

        setNotifications(data);

        // Mark unseen notifications as seen
        for (const notif of data) {
          if (!notif.seen) {
            await updateDoc(doc(db, "notifications", notif.id), {
              seen: true,
            });
          }
        }
   
localStorage.setItem("noti-update", Date.now()); // triggers Navbar update

      } catch (err) {
        console.error("Notification fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600 border-solid"></div>
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications at this time.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded shadow p-3 mb-3 border-l-4 border-blue-600 flex justify-between items-start"
          >
            <div>
              <p className="text-sm">{n.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {n.timestamp instanceof Date
                  ? n.timestamp.toLocaleString()
                  : new Date(
                      n.timestamp?.seconds
                        ? n.timestamp.seconds * 1000
                        : n.timestamp
                    ).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(n.id)}
              className="text-red-600 hover:text-red-800 text-sm ml-4"
              title="Delete"
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Notification;
