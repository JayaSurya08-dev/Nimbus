import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch files on load
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get("/files/");
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post("/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      fetchFiles(); // refresh file list
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleDownload = (id) => {
    window.open(`http://localhost:8000/download/${id}/`, "_blank");
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/delete/${id}/`);
      setFiles(files.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MyCloud</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-700">Dashboard</button>
          <img
            src="/avatar.png"
            alt="user"
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
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
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
