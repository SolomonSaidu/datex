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
} from "firebase/firestore";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { where } from "firebase/firestore";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const { currentUser } = useAuth(); // this gives you the logged-in user

  console.log("User:", currentUser); ////

  // Fetch products from Firestore
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



  // Add or Update Product
  // Add or Update Product
const handleSubmit = async ({ product, expiry, id, category, quantity, comment, remindBefore }) => {
  // Check if offline
  if (!navigator.onLine) {
    Swal.fire("Offline", "You're offline. Please connect to the internet.", "warning");
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
      Swal.fire("Added!", "Product added successfully.", "success");
    }

    fetchProducts(); // refresh list
    setIsEditing(false);
    setEditingData(null);
  } catch (error) {
    console.error("Error submitting product:", error);
    Swal.fire("Error", "Something went wrong!", "error");
  }
};



  // Handle Delete
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
        setProducts(products.filter((item) => item.id !== id));
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (error) {
        console.error("Delete failed:", error);
        Swal.fire("Error", "Something went wrong while deleting.", "error");
      }
    }
  };

  // Handle Edit
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

  return (
    <div className="p-4 pt-2">
      {/* offline alert */}
      {!navigator.onLine && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-2">
          You are currently offline. Changes won’t be saved.
        </div>
      )}
      <div className="mb-2">
        <h1 className="font-bold text-2xl">Good Morning, Admin</h1>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-600 text-white rounded">
          Total Products
          <br />
          <span className="text-2xl font-bold mt-8">
            {products.length != 0 ? products.length : "0.00"}
          </span>
        </div>
        <div className="p-3 bg-blue-600 text-white rounded">
          Near Expiry
          <br />
          <span className="text-2xl font-bold mt-8">5.000</span>
        </div>
        <div className="p-3 bg-green-500 text-white rounded">
          Expired
          <br />
          <span className="text-2xl font-bold mt-8">5.000</span>
        </div>
      </div>
      {/* Add Button */}
      <div className="flex justify-between mb-4 mt-14">
        <h2 className="font-bold text-xl">Product Added</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditingData(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700  active:scale-95 text-white px-4 py-2 rounded shadow-md hover:shadow-lg transition duration-200"
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
      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600 border-solid"></div>
          </div>
        ) : (
         <table className="w-full border text-left text-sm">
            <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
  <tr>
    <th className="p-3">#</th>
    <th className="p-3">Product Name</th>
    <th className="p-3">Expiry Date</th>
    <th className="p-3">Status</th>
    <th className="p-3">Category</th>
    <th className="p-3">Quantity</th>
    <th className="p-3">Reminder</th>
    <th className="p-3">Comment</th>
    <th className="p-3 text-center">Actions</th>
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
      const diffInDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      let status = "Good";
      if (diffInDays <= 0) status = "Expired";
      else if (diffInDays <= 7) status = "Expiring Soon";

      return (
        <tr
          key={item.id}
          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-all`}
        >
          <td className="p-3">{index + 1}</td>
          <td className="p-3">{item.product}</td>
          <td className="p-3">{item.expiry}</td>
          <td className={`p-3 font-semibold ${
            status === "Expired"
              ? "text-red-600"
              : status === "Expiring Soon"
              ? "text-yellow-600"
              : "text-green-600"
          }`}>
            {status}
          </td>
          <td className="p-3">{item.category || "-"}</td>
          <td className="p-3">{item.quantity || "-"}</td>
          <td className="p-3">{item.remindBefore || "-"}</td>
          <td className="p-3">{item.comment || "-"}</td>
          <td className="p-3 flex gap-2 justify-center">
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
