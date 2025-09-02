import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Use correct access token key
  const token = localStorage.getItem("access");

  // Redirect to login if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p>Please log in to access your files.</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ✅ Axios instance with Authorization header
  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // ✅ Interceptor to handle token expiry / 401
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/files/");
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
      // ✅ Let Axios handle Content-Type automatically
      await api.post("/api/upload/", formData);
      setSelectedFile(null);
      fetchFiles(); // refresh file list
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status !== 401) {
        setError("Upload failed. Please try again.");
      }
    }
  };

  const handleDownload = (id) => {
    // ✅ Download via Authorization header is better than token query param
    const downloadWindow = window.open("", "_blank");
    api
      .get(`/api/download/${id}/`, { responseType: "blob" })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        downloadWindow.location.href = url;
      })
      .catch((err) => {
        console.error("Download error:", err);
        downloadWindow.close();
      });
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await api.delete(`/api/delete/${id}/`);
      setFiles(files.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status !== 401) {
        setError("Delete failed. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
            onClick={() => {
              localStorage.removeItem("access");
              window.location.href = "/login";
            }}
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
                  <td className="px-6 py-3">
                    {(file.size / 1024).toFixed(2)} KB
                  </td>
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
