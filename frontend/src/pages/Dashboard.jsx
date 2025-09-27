// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../api"; // Axios instance with withCredentials: true

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Axios instance with cookies
  const axiosInstance = api;

  // Handle 401 globally
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  // Fetch files on mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("files/");
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      if (err.response?.status !== 401) {
        setError("Failed to load files. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setError(null);
      await axiosInstance.post("upload/", formData);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status !== 401) {
        setError("Upload failed. Please try again.");
      }
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await axiosInstance.get(`download/${id}/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download file.");
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await axiosInstance.delete(`delete/${id}/`);
      setFiles(files.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status !== 401) {
        setError("Delete failed. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("logout/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MyCloud</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-700">Dashboard</button>
          <button
            onClick={handleLogout}
            className="text-gray-700 hover:text-red-600"
          >
            Logout
          </button>
          <img
            src="/avatar.png"
            alt="user"
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Files</h2>
          <div className="flex space-x-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-sm"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Upload
            </button>
          </div>
        </div>

        {/* File Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Size</th>
                <th className="text-left px-6 py-3">Uploaded</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b">
                  <td className="px-6 py-3">{file.name}</td>
                  <td className="px-6 py-3">{(file.size / 1024).toFixed(2)} KB</td>
                  <td className="px-6 py-3">{file.uploaded_at}</td>
                  <td className="px-6 py-3 flex space-x-3">
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No files uploaded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
