import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { FaTrash, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", roles: "" });
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Delete failed");
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch (err) {
      setError("Delete failed: " + err.message);
      toast.error("Delete failed: " + err.message);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u.id);
    setEditForm({ name: u.name, email: u.email, password: "", roles: u.roles });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (err) {
      setError("Update failed: " + err.message);
      toast.error("Update failed: " + err.message);
    }
  };

  if (!user || user.roles !== "ROLE_ADMIN") {
    return <p className="text-red-600">Admin access required.</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section>
      <h3 className="text-2xl font-bold mb-4">User Management</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Roles</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 text-sm text-gray-700">{u.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {editingUser === u.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {editingUser === u.id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {editingUser === u.id ? (
                    <input
                      type="text"
                      value={editForm.roles}
                      onChange={(e) => setEditForm({ ...editForm, roles: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="e.g., ROLE_ADMIN"
                    />
                  ) : (
                    u.roles
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingUser === u.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(u.id)}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}