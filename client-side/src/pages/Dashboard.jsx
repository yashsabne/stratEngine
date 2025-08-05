import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PriceTrendGraph from "../components/PriceTrend";
import DataVisualization from "../components/sections/Visualization";
import Papa from 'papaparse';
import EditProfilePage from "./EditProfilePage";
import { backendUrl } from '../constants';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [pricingResults, setPricingResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentAnalyzedFile, setCurrentAnalyzedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, filesResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/auth/me`, { withCredentials: true }),
          axios.get(`${backendUrl}/api/files-section/`, { withCredentials: true })
        ]);

        setUserData(userResponse.data.user);
        setSessionData(userResponse.data.session);
        setFiles(filesResponse.data.files);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      setError("Failed to logout. Please try again.");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userData._id);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post(
        `${backendUrl}/api/files-section/upload`,
        formData,
        {
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setFiles([...files, response.data.file]);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const analyzeFile = async (fileId) => {
    try {
      setAnalyzing(true);
      const fileToAnalyze = files.find(f => f._id === fileId);
      setCurrentAnalyzedFile(fileToAnalyze);

      // Fetch file content for preview
      const contentResponse = await axios.get(
        `${backendUrl}/api/files-section/content/${fileId}`,
        { withCredentials: true }
      );

      // Parse CSV content
      const parsedData = Papa.parse(contentResponse.data.content, {
        header: true,
        skipEmptyLines: true
      });

      // Store first 5 rows for preview
      setFilePreview(parsedData.data.slice(0, 5));

      const analysisResponse = await axios.post(
        `${backendUrl}/api/files-section/analyze/${fileId}`,
        {},
        { withCredentials: true }
      );

      setAnalysisResults({ forecast: analysisResponse.data.forecast });
      setPricingResults({ pricing: analysisResponse.data.pricing });

    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(
        `${backendUrl}/api/files-section/${fileId}`,
        { withCredentials: true }
      );
      setFiles(files.filter(file => file._id !== fileId));
      if (currentAnalyzedFile?._id === fileId) {
        setAnalysisResults(null);
        setPricingResults(null);
        setCurrentAnalyzedFile(null);
        setFilePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete file");
    }
  };

  if (loading && !isUploading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const AnalyzingDataLoading = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Analyzing {currentAnalyzedFile?.originalName}</p>

            {filePreview && (
              <div className="mt-4 text-left">
                <h4 className="text-sm font-medium text-gray-200 mb-2">File Preview:</h4>
                <div className="max-h-40 overflow-y-auto bg-gray-900 p-2 rounded">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {Object.keys(filePreview[0]).map((header, idx) => (
                          <th key={idx} className="text-left py-1 px-2 text-gray-400">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filePreview.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-800">
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-1 px-2 text-gray-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    // Clone the results element to avoid modifying the original
    const resultsElement = document.getElementById('analysisResults');
    const printContents = resultsElement.cloneNode(true);

    // Remove interactive elements that shouldn't print
    const noPrintElements = printContents.querySelectorAll('button, input, .no-print');
    noPrintElements.forEach(el => el.remove());

    // Ensure charts maintain their aspect ratio
    const charts = printContents.querySelectorAll('.chart-container, canvas, svg');
    charts.forEach(chart => {
      chart.style.width = '100%';
      chart.style.height = 'auto';
      chart.style.maxWidth = '800px';
      chart.style.margin = '20px auto';
      chart.style.display = 'block';
    });

    // Create print window
    const printWindow = window.open('', '', 'height=700,width=900');

    // Basic print styles focused on graph placement
    printWindow.document.write(`
    <html>
      <head>
        <title>Analysis Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .chart-container {
            page-break-inside: avoid;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px;
            border: 1px solid #ddd;
          }
          @page {
            size: auto;
            margin: 15mm;
          }
        </style>
      </head>
      <body>
        ${printContents.innerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    // Wait briefly before printing to ensure content loads
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };


  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="max-w-md bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"
          >
            Get back
          </button>
        </div>
      </div>
    );
  }



  console.log(userData)


  // Sample user data (replace with your actual user data)
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    avatar: "",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA"
    }
  }

  const handleProfileUpdate = (success) => {
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-100">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {userData?.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              User Information
            </h2>
            <div className="space-y-3">
              {userData &&
                Object.entries(userData)
                  .filter(([key]) => !['avatar', 'firstName', 'lastName', 'address'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <span className="text-gray-200">
                        {typeof value === "Object"
                          ? JSON.stringify(value)
                          : value?.toString()}
                      </span>
                    </div>
                  ))}

            </div>
          </div>

          {/* Session Info Card */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Session Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Session Status:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-gray-200">
                  {new Date(sessionData.last_login.timestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">IP Address:</span>
                <span className="text-gray-200">127.0.0.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Device:</span>
                <span className="text-gray-200" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '250px' }}>
                  {sessionData.last_login.userAgent}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-left cursor-pointer">
                Edit Profile
              </button>

              <Link to="/settings">
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-left cursor-pointer">
                  ⚙️ Settings
                </button>
              </Link>
            </div>
          </div>
        </div>

        {showEditModal && (
          <EditProfilePage
            user={userData}
            onClose={handleProfileUpdate}
          />
        )}

        <div className="mt-8 bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Sales Data Analysis
          </h2>

          {/* File Upload Form */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-300 mb-2">Upload CSV File</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="block">
                  <span className="sr-only">Choose CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-600 file:text-white
                      hover:file:bg-indigo-500
                      cursor-pointer"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              {isUploading && (
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <div className="text-sm text-gray-400">
                <p>Upload your sales data in CSV format for analysis.</p>
                <p>Supported columns: date, product, quantity, price, etc.</p>
              </div>
            </form>
          </div>

          {/* File List */}
          <div className="mb-8">
            <h3 className="text-md font-medium text-gray-300 mb-4">Your Data Files</h3>
            {files.length === 0 ? (
              <p className="text-gray-400">No files uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Filename</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {files.map((file) => (
                      <tr key={file._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {file.originalName}
                          {currentAnalyzedFile?._id === file._id && (
                            <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                              Analyzing...
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {(file.size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => analyzeFile(file._id)}
                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                            disabled={analyzing}
                          >
                            Analyze
                          </button>
                          <button
                            onClick={() => deleteFile(file._id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={analyzing}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {analyzing && <AnalyzingDataLoading />}

          {/* Analysis Results */}
          {analysisResults && (
            <div id="analysisResults" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-gray-300">Analysis Results</h3>
                {currentAnalyzedFile && (
                  <div className="text-sm text-gray-400">
                    Analyzed file: <span className="text-gray-200">{currentAnalyzedFile.originalName}</span>
                  </div>
                )}
              </div>

              {/* File Preview Box */}
              {filePreview && (
                <div className="mb-6 bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">File Preview (First 5 Rows)</h4>
                  <div className="overflow-x-auto max-h-60">
                    <table className="min-w-full text-xs border border-gray-600">
                      <thead className="bg-gray-800">
                        <tr>
                          {Object.keys(filePreview[0]).map((header, idx) => (
                            <th key={idx} className="px-3 py-2 text-left text-gray-300 border-b border-gray-600">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filePreview.map((row, rowIdx) => (
                          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}>
                            {Object.values(row).map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-gray-300 border-b border-gray-600">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="chart-container">
                <DataVisualization data={pricingResults.pricing.modern} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Forecast Summary */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Sales Forecast</h4>
                  <div className="space-y-2">
                    {Array.isArray(analysisResults.forecast) && analysisResults.forecast.map((item, index) => (
                      <div key={index} className="mb-4 p-2 border border-gray-600 rounded">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-gray-200">{new Date(item.ds).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Forecast Sale:</span>
                          <span className="text-gray-200">{item.yhat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lower Bound:</span>
                          <span className="text-gray-200">{item.yhat_lower.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Upper Bound:</span>
                          <span className="text-gray-200">{item.yhat_upper.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Suggestions */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Price Suggestions</h4>
                  <div className="space-y-2">
                    {pricingResults?.pricing && (
                      <>
                        <div className="chart-container">
                          <PriceTrendGraph data={pricingResults.pricing.legacy.Price_Trend} />
                        </div>

                        <div className="bg-zinc-800 p-4 rounded-lg">
                          {Object.entries(pricingResults.pricing.legacy).map(([key, value]) => {
                            if (key === 'Price_Trend') return null;
                            return (
                              <div key={key} className="flex justify-between py-1">
                                <span className="text-gray-400 capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-gray-200">
                                  {key === 'Suggested_Price' ? `$${value}` : value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="print-btn flex justify-end">
                <button
                  onClick={handlePrint}
                  className=" mt-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-950 cursor-pointer"
                >
                  Print Analysis Results
                </button>
              </div>
            </div>

          )}


        </div>

        {/* Debug Section */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Debug Information
          </h2>
          <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-gray-300 text-sm">
            {JSON.stringify(
              {
                userData,
                cookies: document.cookie,
                sessionStorage: sessionStorage.getItem("user"),
              },
              null,
              2
            )}
          </pre>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;