import { useEffect, useState } from "react";
import api from "../api";
import logo from "../assets/logo.png";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("profile/");
        setUsername(res.data.username);
      } catch {
        setUsername("Guest");
      }
    };
    fetchProfile();
  }, []);

  const axiosInstance = api;

  axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) window.location.href = "/login";
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("files/");
      setFiles(res.data);
    } catch {
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await axiosInstance.post("upload/", formData);
      setSelectedFile(null);
      fetchFiles();
    } catch {
      setError("Upload failed.");
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const res = await axiosInstance.get(`download/${id}/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Download failed.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`delete/${id}/`);
      setFiles(files.filter((f) => f.id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("logout/");
    } catch {}
    finally {
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 px-4 sm:px-6 py-2 flex flex-wrap justify-between items-center shadow-md">
        <img src={logo} alt="Logo" className="w-[200px] h-[71px] cursor-pointer" />
        <div className="relative">
          <img
            src="/avatar.png"
            alt="user"
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 shadow-lg rounded-md z-50">
              <div className="px-4 py-4 text-sm font-semibold text-gray-300 border-b border-gray-700">
                {username}
              </div>
              <button
                onClick={() => window.location.href = "/profile"}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-700 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-800 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Your Files</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-sm text-gray-200 bg-gray-800 border border-gray-600 rounded px-2 py-1"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 disabled:bg-gray-700"
            >
              Upload
            </button>
          </div>
        </div>

        {/* File Table */}
        <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 text-sm sm:text-base">Name</th>
                <th className="text-left px-4 sm:px-6 py-3 text-sm sm:text-base">Size</th>
                <th className="text-left px-4 sm:px-6 py-3 text-sm sm:text-base">Uploaded</th>
                <th className="px-4 sm:px-6 py-3 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file) => (
                  <tr key={file.id} className="border-b border-gray-700">
                    <td className="px-4 sm:px-6 py-3 text-sm">{file.name}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm">{(file.size / 1024).toFixed(2)} KB</td>
                    <td className="px-4 sm:px-6 py-3 text-sm">{file.uploaded_at}</td>
                    <td className="px-4 sm:px-6 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="text-blue-400 hover:underline"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
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
