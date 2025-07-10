import { useEffect, useState } from "react";
import AddProductModal from "../components/AddProductModal";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const { currentUser } = useAuth();

  const username = currentUser?.email?.split("@")[0] || "User";

  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true);
    try {
      const q = query(
        collection(db, "products"),
        where("userId", "==", currentUser?.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(data);
      localStorage.setItem("cachedProducts", JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async ({
    product,
    expiry,
    id,
    category,
    quantity,
    comment,
    remindBefore,
  }) => {
    if (!navigator.onLine) {
      Swal.fire(
        "Offline",
        "You're offline. Please connect to the internet.",
        "warning"
      );
      return;
    }

    try {
      if (!currentUser) {
        Swal.fire("Error", "You must be logged in to add a product.", "error");
        return;
      }

      const data = {
        product,
        expiry,
        category,
        quantity,
        comment: comment || "",
        remindBefore,
        userId: currentUser.uid,
        owner: currentUser.email || "",
        createdAt: new Date(),
      };

      if (isEditing && id) {
        const ref = doc(db, "products", id);
        await updateDoc(ref, data);
        Swal.fire("Updated!", "Product updated successfully.", "success");
      } else {
        await addDoc(collection(db, "products"), data);
        // Check for near expiry and create notification
        const expiryDate = new Date(expiry);
        const today = new Date();
        const diffInDays = Math.ceil(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays <= 7 && diffInDays >= 0) {
          const notifRef = collection(db, "notifications");
          const title = `${product} is expiring on ${expiryDate.toDateString()}`;

          const q = query(
            notifRef,
            where("userId", "==", currentUser.uid),
            where("title", "==", title)
          );

          const existing = await getDocs(q);

          if (existing.empty) {
            await addDoc(notifRef, {
              userId: currentUser.uid,
              productId: data.product, // optional
              title,
              seen: false,
              timestamp: new Date(),
            });
          }
        }

        Swal.fire("Added!", "Product added successfully.", "success");
      }

      fetchProducts();
      setIsEditing(false);
      setEditingData(null);
      localStorage.setItem("noti-update", Date.now());
    } catch (error) {
      console.error("Error submitting product:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmResult.isConfirmed) {
      try {
        await deleteDoc(doc(db, "products", id));
        const updatedProducts = products.filter((item) => item.id !== id);
        setProducts(updatedProducts);
        localStorage.setItem("cachedProducts", JSON.stringify(updatedProducts));
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error", "Something went wrong while deleting.", "error");
      }
    }
  };

  const handleEdit = (productData) => {
    setIsEditing(true);
    setEditingData(productData);
    setShowModal(true);
  };

  useEffect(() => {
    if (currentUser) {
      const cached = localStorage.getItem("cachedProducts");
      if (cached) {
        setProducts(JSON.parse(cached));
        setLoading(false);
      } else {
        fetchProducts();
      }
    }
  }, [currentUser]);

  const now = new Date();
  const nearExpiryCount = products.filter((item) => {
    const expiry = new Date(item.expiry);
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff > 0 && diff <= 7;
  }).length;

  const expiredCount = products.filter((item) => {
    const expiry = new Date(item.expiry);
    return expiry < now;
  }).length;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
  })();

  return (
    <div className="p- pt-">
      {!navigator.onLine && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-2">
          You are currently offline. Changes won’t be saved.
        </div>
      )}

      {/* Greeting */}
      <div className="mb-2">
        <h1 className="font-bold text-mg md:text-2xl">
          {greeting} {username.charAt(0).toUpperCase() + username.slice(1)}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-600 text-white rounded">
          Total Products
          <br />
          <span className="text-2xl font-bold mt-2">
            {products.length !== 0 ? products.length : "0.00"}
          </span>
        </div>
        <div className="p-3 bg-yellow-500 text-white rounded">
          Near Expiry
          <br />
          <span className="text-2xl font-bold mt-2">{nearExpiryCount}</span>
        </div>
        <div className="p-3 bg-red-600 text-white rounded">
          Expired
          <br />
          <span className="text-2xl font-bold mt-2">{expiredCount}</span>
        </div>
      </div>

      {/* Add Product Button */}
      <div className="flex justify-between mb-4 mt-14">
        <h2 className="font-bold text-xl">Product Added</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditingData(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded shadow-md hover:shadow-lg transition duration-200"
        >
          Add Product
        </button>
      </div>

      {/* Modal */}
      <AddProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        editingData={editingData}
      />

      {/* Responsive Table */}
      <div className="overflow-x-auto w-80 md:w-full">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600 border-solid"></div>
          </div>
        ) : (
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="p-2 whitespace-nowrap">#</th>
                <th className="p-2 whitespace-nowrap">Product Name</th>
                <th className="p-2 whitespace-nowrap">Expiry Date</th>
                <th className="p-2 whitespace-nowrap">Status</th>
                <th className="p-2 whitespace-nowrap">Category</th>
                <th className="p-2 whitespace-nowrap">Quantity</th>
                <th className="p-2 whitespace-nowrap">Reminder</th>
                <th className="p-2 whitespace-nowrap">Comment</th>
                <th className="p-2 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-4 text-gray-500">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((item, index) => {
                  const today = new Date();
                  const expiryDate = new Date(item.expiry);
                  const diffInDays = Math.ceil(
                    (expiryDate - today) / (1000 * 60 * 60 * 24)
                  );

                  let status = "Good";
                  if (diffInDays <= 0) status = "Expired";
                  else if (diffInDays <= 7) status = "Expiring Soon";

                  return (
                    <tr
                      key={item.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-all`}
                    >
                      <td className="p-2 whitespace-nowrap">{index + 1}</td>
                      <td className="p-2 whitespace-nowrap">{item.product}</td>
                      <td className="p-2 whitespace-nowrap">{item.expiry}</td>
                      <td
                        className={`p-2 font-semibold whitespace-nowrap ${
                          status === "Expired"
                            ? "text-red-600"
                            : status === "Expiring Soon"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {status}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {item.category || "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {item.quantity || "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {item.remindBefore || "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {item.comment || "-"}
                      </td>
                      <td className="p-2 whitespace-nowrap flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
