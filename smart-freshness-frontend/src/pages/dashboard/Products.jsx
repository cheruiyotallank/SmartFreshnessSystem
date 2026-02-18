import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/products`;
const CATEGORIES = ["Fruits", "Vegetables", "Dairy", "Meat", "Fish", "Bakery", "Other"];
const SEASONS = ["low", "mid", "high"];

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        category: "Fruits",
        description: "",
        imageUrl: "",
        basePrice: "",
        lowSeasonPrice: "",
        midSeasonPrice: "",
        highSeasonPrice: "",
        currentSeason: "mid"
    });

    const token = localStorage.getItem("token");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL, {
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
            setError("");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const resetForm = () => {
        setForm({
            name: "",
            category: "Fruits",
            description: "",
            imageUrl: "",
            basePrice: "",
            lowSeasonPrice: "",
            midSeasonPrice: "",
            highSeasonPrice: "",
            currentSeason: "mid"
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.basePrice) {
            toast.error("Name and Base Price are required");
            return;
        }

        const payload = {
            ...form,
            basePrice: parseFloat(form.basePrice),
            lowSeasonPrice: form.lowSeasonPrice ? parseFloat(form.lowSeasonPrice) : null,
            midSeasonPrice: form.midSeasonPrice ? parseFloat(form.midSeasonPrice) : null,
            highSeasonPrice: form.highSeasonPrice ? parseFloat(form.highSeasonPrice) : null,
        };

        try {
            const url = editingId ? `${API_URL}/${editingId}` : API_URL;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.status === "success") {
                toast.success(data.message);
                resetForm();
                fetchProducts();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name || "",
            category: product.category || "Other",
            description: product.description || "",
            imageUrl: product.imageUrl || "",
            basePrice: product.basePrice?.toString() || "",
            lowSeasonPrice: product.lowSeasonPrice?.toString() || "",
            midSeasonPrice: product.midSeasonPrice?.toString() || "",
            highSeasonPrice: product.highSeasonPrice?.toString() || "",
            currentSeason: product.currentSeason || "mid"
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.status === "success") {
                toast.success(data.message);
                fetchProducts();
            } else {
                toast.error(data.message || "Delete failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSeasonChange = async (id, season) => {
        try {
            const res = await fetch(`${API_URL}/${id}/season?season=${season}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.status === "success") {
                toast.success(data.message);
                fetchProducts();
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Product Management</h3>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h4>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h5 className="font-semibold mb-3">Pricing</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (KES) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.basePrice}
                                            onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Season</label>
                                        <select
                                            value={form.currentSeason}
                                            onChange={(e) => setForm({ ...form, currentSeason: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                        >
                                            {SEASONS.map(s => (
                                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} Season</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h5 className="font-semibold mb-3">Seasonal Prices (Optional)</h5>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Low Season</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.lowSeasonPrice}
                                            onChange={(e) => setForm({ ...form, lowSeasonPrice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                            placeholder="KES"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mid Season</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.midSeasonPrice}
                                            onChange={(e) => setForm({ ...form, midSeasonPrice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                            placeholder="KES"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">High Season</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.highSeasonPrice}
                                            onChange={(e) => setForm({ ...form, highSeasonPrice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none focus:ring-green-400"
                                            placeholder="KES"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <FaSave /> {editingId ? "Update" : "Create"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Base Price</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Current Season</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Effective Price</th>
                            <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No products yet. Click "Add Product" to create one.
                                </td>
                            </tr>
                        )}
                        {products.map((p) => (
                            <tr key={p.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {p.imageUrl && (
                                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-800">{p.name}</p>
                                            {p.description && <p className="text-xs text-gray-500 truncate max-w-xs">{p.description}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{p.category || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">KES {p.basePrice?.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={p.currentSeason}
                                        onChange={(e) => handleSeasonChange(p.id, e.target.value)}
                                        className="text-sm px-2 py-1 border rounded"
                                    >
                                        {SEASONS.map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                    KES {p.effectiveBasePrice?.toFixed(2) || p.basePrice?.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
