import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUserShield, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({ type: null, id: null });
  const [formData, setFormData] = useState({});
  const [promotingUserId, setPromotingUserId] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.token;
    }
    return null;
  };

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const [usersRes, productsRes, devicesRes, unitsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`, { headers }),
        fetch(`${API_BASE_URL}/api/products`, { headers }),
        fetch(`${API_BASE_URL}/api/devices`, { headers }),
        fetch(`${API_BASE_URL}/api/units`, { headers }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (devicesRes.ok) setDevices(await devicesRes.json());
      if (unitsRes.ok) setUnits(await unitsRes.json());
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type) => {
    setEditing({ type, id: null });
    setFormData(getDefaultFormData(type));
  };

  const handleEdit = (type, item) => {
    setEditing({ type, id: item.id });
    setFormData({ ...item });
  };

  const handleSave = async () => {
    const token = getAuthToken();
    try {
      const url = editing.id
        ? `${API_BASE_URL}/api/${editing.type}s/${editing.id}`
        : `${API_BASE_URL}/api/${editing.type}s`;
      const method = editing.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Save failed");

      const savedItem = await res.json();
      updateState(editing.type, savedItem);
      setEditing({ type: null, id: null });
      toast.success(`${editing.type} ${editing.id ? "updated" : "added"} successfully`);
    } catch (error) {
      toast.error("Save failed: " + error.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete ${type}?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE_URL}/api/${type}s/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Delete failed");

      removeFromState(type, id);
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      toast.error("Delete failed: " + error.message);
    }
  };

  /**
   * Promote a user to admin role
   */
  const handlePromote = async (userId) => {
    const token = getAuthToken();
    setPromotingUserId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/promote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Promote failed");
      }

      // Update user in state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: "ROLE_ADMIN" } : u))
      );
      toast.success("User promoted to admin successfully");
    } catch (error) {
      toast.error(error.message || "Failed to promote user");
    } finally {
      setPromotingUserId(null);
    }
  };

  /**
   * Demote an admin to regular user role
   */
  const handleDemote = async (userId) => {
    const token = getAuthToken();
    setPromotingUserId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/demote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Demote failed");
      }

      // Update user in state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: "ROLE_USER" } : u))
      );
      toast.success("User demoted to regular user successfully");
    } catch (error) {
      toast.error(error.message || "Failed to demote user");
    } finally {
      setPromotingUserId(null);
    }
  };

  const updateState = (type, item) => {
    const setters = { users: setUsers, products: setProducts, devices: setDevices, units: setUnits };
    const setter = setters[type];
    setter(prev => editing.id ? prev.map(i => i.id === item.id ? item : i) : [...prev, item]);
  };

  const removeFromState = (type, id) => {
    const setters = { users: setUsers, products: setProducts, devices: setDevices, units: setUnits };
    setters[type](prev => prev.filter(i => i.id !== id));
  };

  const getDefaultFormData = (type) => {
    const defaults = {
      users: { name: "", email: "", password: "", roles: "ROLE_USER" },
      products: { name: "", basePrice: 0 },
      devices: { deviceId: "", name: "", location: "" },
      units: { name: "", inventoryCount: 0, currentPrice: 0, product: { id: null } },
    };
    return defaults[type];
  };

  const renderTable = (type, data, columns) => (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <div className="p-4 flex justify-between">
        <h3 className="text-lg font-semibold capitalize">{type}</h3>
        <button onClick={() => handleAdd(type)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
          <FaPlus /> Add {type.slice(0, -1)}
        </button>
      </div>
      <table className="min-w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => <th key={col.key} className="px-4 py-3 text-sm font-medium text-gray-600">{col.label}</th>)}
            <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} className="border-t">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                  {editing.type === type && editing.id === item.id ? (
                    <input
                      type={col.type || "text"}
                      value={formData[col.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [col.key]: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    col.render ? col.render(item) : item[col.key]
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-sm">
                {editing.type === type && editing.id === item.id ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="text-green-600 hover:underline"><FaSave /></button>
                    <button onClick={() => setEditing({ type: null, id: null })} className="text-gray-600 hover:underline"><FaTimes /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(type, item)} className="text-blue-600 hover:underline"><FaEdit /></button>
                    <button onClick={() => handleDelete(type, item.id)} className="text-red-600 hover:underline"><FaTrash /></button>
                    {/* Show promote/demote buttons only for users table */}
                    {type === "users" && (
                      item.roles === "ROLE_USER" ? (
                        <button
                          onClick={() => handlePromote(item.id)}
                          disabled={promotingUserId === item.id}
                          className="text-purple-600 hover:text-purple-800 disabled:opacity-50 flex items-center gap-1"
                          title="Promote to Admin"
                        >
                          {promotingUserId === item.id ? (
                            <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <FaUserShield />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemote(item.id)}
                          disabled={promotingUserId === item.id}
                          className="text-orange-600 hover:text-orange-800 disabled:opacity-50 flex items-center gap-1"
                          title="Demote to User"
                        >
                          {promotingUserId === item.id ? (
                            <span className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <FaUser />
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Admin Dashboard</h3>

      <div className="flex space-x-4 border-b">
        {["users", "products", "devices", "units"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-green-600 text-green-600" : "text-gray-600"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "users" && renderTable("users", users, [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
          key: "roles", label: "Roles", render: (item) => (
            <span className={`px-2 py-1 rounded text-xs font-medium ${item.roles === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
              }`}>
              {item.roles === "ROLE_ADMIN" ? "Admin" : "User"}
            </span>
          )
        },
      ])}

      {activeTab === "products" && renderTable("products", products, [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "basePrice", label: "Base Price", type: "number" },
      ])}

      {activeTab === "devices" && renderTable("devices", devices, [
        { key: "id", label: "ID" },
        { key: "deviceId", label: "Device ID" },
        { key: "name", label: "Name" },
        { key: "location", label: "Location" },
      ])}

      {activeTab === "units" && renderTable("units", units, [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "inventoryCount", label: "Inventory Count", type: "number" },
        { key: "currentPrice", label: "Current Price", type: "number" },
        { key: "product", label: "Product", render: (item) => item.product?.name || "N/A" },
      ])}
    </div>
  );
}

