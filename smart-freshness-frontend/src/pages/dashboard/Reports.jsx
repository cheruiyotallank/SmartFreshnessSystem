import React, { useState } from "react";
import { FaFilePdf, FaBoxes, FaLeaf, FaTag, FaDownload, FaSpinner } from "react-icons/fa";
import API_BASE_URL from "../../config";
import toast from "react-hot-toast";

const API_URL = `${API_BASE_URL}/api/reports`;

export default function Reports() {
    const [loading, setLoading] = useState({});

    const getAuthToken = () => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsed = JSON.parse(user);
            return parsed.token;
        }
        return null;
    };

    const downloadReport = async (type, unitId = null) => {
        const key = unitId ? `${type}-${unitId}` : type;
        setLoading(prev => ({ ...prev, [key]: true }));

        try {
            const token = getAuthToken();
            let url = `${API_URL}/${type}`;
            if (unitId) url += `/${unitId}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to generate report");

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = response.headers.get("content-disposition")?.split("filename=")[1] || `${type}-report.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success(`${type} report downloaded successfully!`);
        } catch (error) {
            console.error("Report download failed:", error);
            toast.error("Failed to download report");
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const ReportCard = ({ title, description, icon: Icon, onClick, type }) => (
        <div className="bg-theme-card p-6 rounded-xl shadow-theme hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Icon className="text-3xl text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-theme-primary">{title}</h3>
                    <p className="text-sm text-theme-muted">{description}</p>
                </div>
            </div>
            <button
                onClick={onClick}
                disabled={loading[type]}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all"
            >
                {loading[type] ? (
                    <>
                        <FaSpinner className="animate-spin" /> Generating...
                    </>
                ) : (
                    <>
                        <FaDownload /> Download PDF
                    </>
                )}
            </button>
        </div>
    );

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <FaFilePdf className="text-2xl text-red-500" />
                <h3 className="text-2xl font-bold text-theme-primary">PDF Reports</h3>
            </div>

            <p className="text-theme-muted">
                Generate and download printable PDF reports for inventory tracking and analysis.
            </p>

            <div className="grid grid-cols-3 gap-6">
                <ReportCard
                    title="Inventory Report"
                    description="Complete overview of all units with current status and pricing"
                    icon={FaBoxes}
                    onClick={() => downloadReport("inventory")}
                    type="inventory"
                />
                <ReportCard
                    title="Products Catalog"
                    description="Full catalog of products with seasonal pricing details"
                    icon={FaTag}
                    onClick={() => downloadReport("products")}
                    type="products"
                />
                <ReportCard
                    title="Freshness Summary"
                    description="Unit-specific freshness data and readings (coming soon)"
                    icon={FaLeaf}
                    onClick={() => toast.error("Please select a unit from Inventory page")}
                    type="freshness"
                />
            </div>

            <div className="bg-theme-card p-6 rounded-xl shadow-theme mt-8">
                <h4 className="text-lg font-semibold text-theme-primary mb-4">Report Features</h4>
                <ul className="space-y-2 text-theme-secondary">
                    <li>✓ Professional PDF formatting with company branding</li>
                    <li>✓ Summary statistics and key metrics</li>
                    <li>✓ Detailed data tables for analysis</li>
                    <li>✓ Date/time stamped for record keeping</li>
                    <li>✓ Print-optimized layouts</li>
                </ul>
            </div>
        </section>
    );
}
