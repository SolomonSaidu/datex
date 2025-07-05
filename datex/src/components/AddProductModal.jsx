import { useEffect, useState } from "react";

const AddProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  isEditing = false,
  editingData = {},
}) => {
  const [product, setProduct] = useState("");
  const [expiry, setExpiry] = useState("");
  const [category, setCategory] = useState("General");
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [remindBefore, setRemindBefore] = useState("3days");

  // Set values if editing
  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingData) {
        setProduct(editingData.product || "");
        setExpiry(editingData.expiry || "");
        setCategory(editingData.category || "General");
        setQuantity(editingData.quantity || 1);
        setComment(editingData.comment || "");
        setRemindBefore(editingData.remindBefore || "3days");
      } else {
        setProduct("");
        setExpiry("");
        setCategory("General");
        setQuantity(1);
        setComment("");
        setRemindBefore("3days");
      }
    }
  }, [isOpen, isEditing, editingData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product || !expiry || !category || !quantity || !remindBefore) {
      return alert("Please fill all required fields.");
    }

    onSubmit({
      product,
      expiry,
      category,
      quantity,
      comment,
      remindBefore,
      id: editingData?.id,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/15">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold">Product Name</label>
            <input
              type="text"
              placeholder="Eg: Apple"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none"
            >
              <option>General</option>
              <option>Food</option>
              <option>Medicine</option>
              <option>Cosmetics</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Reminder Before Expiry</label>
            <select
              value={remindBefore}
              onChange={(e) => setRemindBefore(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none"
            >
              <option value="1day">1 Day</option>
              <option value="3days">3 Days</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional note..."
              className="w-full px-4 py-2 border rounded focus:outline-none"
              rows={3}
            ></textarea>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditing ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>

        {/* Close icon top right */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default AddProductModal;
