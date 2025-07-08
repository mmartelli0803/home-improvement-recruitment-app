import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, AlertCircle, TrendingUp, MessageSquare, UserCheck, ChevronRight, Phone, Mail, Building, CheckCircle, XCircle, Activity, BarChart3, Target, Zap, Upload, Download, Database, Trash2, Plus, FileText, Save } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const RecruitmentApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false);
  const [engagementAlerts, setEngagementAlerts] = useState([]);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize with empty data or sample data
  useEffect(() => {
    const savedData = loadInitialData();
    if (savedData.length === 0) {
      // Load sample data if no data exists
      loadSampleData();
    } else {
      setCandidates(savedData);
      generateEngagementAlerts(savedData);
    }
  }, []);

  const loadInitialData = () => {
    // In a real app, this would load from a database
    // For now, we'll start with empty data
    return [];
  };

  const loadSampleData = () => {
    const sampleData = [
      {
        id: Date.now() + 1,
        name: "Sample Candidate",
        position: "Flooring Installer",
        appliedDate: new Date().toISOString().split('T')[0],
        status: "new",
        phone: "(555) 000-0000",
        email: "sample@email.com",
        ghostingRisk: "low",
        engagementScore: 85,
        lastContact: "Just now",
        responseRate: 95,
        skills: "Hardwood, Laminate, Tile",
        experience: "5 years",
        location: "Orlando, FL"
      }
    ];
    setCandidates(sampleData);
  };

  const generateEngagementAlerts = (candidateList) => {
    const alerts = [];
    candidateList.forEach(candidate => {
      if (candidate.ghostingRisk === 'high' || 
          (candidate.ghostingRisk === 'medium' && candidate.engagementScore < 60)) {
        alerts.push({
          id: Date.now() + Math.random(),
          candidateId: candidate.id,
          message: `${candidate.name} - ${candidate.ghostingRisk === 'high' ? 'High risk of ghosting' : 'Engagement dropping'}`,
          severity: candidate.ghostingRisk
        });
      }
    });
    setEngagementAlerts(alerts);
  };

  // File Upload Handlers
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processUploadedData(results.data);
        },
        error: (error) => {
          alert('Error parsing CSV file: ' + error.message);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(firstSheet);
          processUploadedData(data);
        } catch (error) {
          alert('Error parsing Excel file: ' + error.message);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  };

  const processUploadedData = (data) => {
    const processedCandidates = data.map((row, index) => {
      // Calculate risk scores based on available data
      const daysSinceApplied = row.appliedDate ? 
        Math.floor((new Date() - new Date(row.appliedDate)) / (1000 * 60 * 60 * 24)) : 0;
      
      const ghostingRisk = daysSinceApplied > 5 ? 'high' : 
                          daysSinceApplied > 2 ? 'medium' : 'low';
      
      const engagementScore = Math.max(30, Math.min(100, 100 - (daysSinceApplied * 10)));

      return {
        id: Date.now() + index,
        name: row.name || row.Name || row['Full Name'] || 'Unknown',
        position: row.position || row.Position || row.Role || 'Not Specified',
        appliedDate: row.appliedDate || row['Applied Date'] || new Date().toISOString().split('T')[0],
        status: row.status || row.Status || 'new',
        phone: row.phone || row.Phone || row['Phone Number'] || '',
        email: row.email || row.Email || row['Email Address'] || '',
        ghostingRisk: row.ghostingRisk || ghostingRisk,
        engagementScore: row.engagementScore || engagementScore,
        lastContact: row.lastContact || 'Never',
        responseRate: row.responseRate || Math.floor(Math.random() * 40) + 60,
        skills: row.skills || row.Skills || '',
        experience: row.experience || row.Experience || '',
        location: row.location || row.Location || row.City || ''
      };
    });

    setCandidates(prev => [...prev, ...processedCandidates]);
    generateEngagementAlerts([...candidates, ...processedCandidates]);
    alert(`Successfully imported ${processedCandidates.length} candidates`);
  };

  // Export functionality
  const exportToCSV = () => {
    const csv = Papa.unparse(candidates);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recruitment_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add new candidate
  const handleAddCandidate = (candidateData) => {
    const newCandidate = {
      id: Date.now(),
      ...candidateData,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'new',
      ghostingRisk: 'low',
      engagementScore: 100,
      lastContact: 'Just now',
      responseRate: 100
    };
    setCandidates(prev => [...prev, newCandidate]);
    setShowAddCandidate(false);
  };

  // Delete candidate
  const handleDeleteCandidate = (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      setEngagementAlerts(prev => prev.filter(a => a.candidateId !== candidateId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      interview_scheduled: "bg-purple-100 text-purple-800",
      offer_extended: "bg-green-100 text-green-800",
      onboarding: "bg-indigo-100 text-indigo-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600"
    };
    return colors[risk] || "text-gray-600";
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAutoSchedule = (candidate) => {
    setSelectedCandidate(candidate);
    setSchedulingModalOpen(true);
    
    setTimeout(() => {
      setCandidates(prev => prev.map(c => 
        c.id === candidate.id 
          ? { ...c, status: 'interview_scheduled', scheduledInterview: '2025-01-10 2:00 PM' }
          : c
      ));
      setSchedulingModalOpen(false);
    }, 2000);
  };

  const handleSendEngagement = (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setCandidates(prev => prev.map(c => 
        c.id === candidateId 
          ? { ...c, lastContact: 'Just now', engagementScore: Math.min(100, c.engagementScore + 10) }
          : c
      ));
      setEngagementAlerts(prev => prev.filter(a => a.candidateId !== candidateId));
    }
  };

  // Data Manager Component
  const DataManager = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Database className="h-6 w-6 mr-2 text-blue-500" />
            Database Manager
          </h3>
          <button
            onClick={() => setShowDataManager(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg mb-2">Upload Candidate Data</p>
            <p className="text-sm text-gray-600 mb-4">
              Support for CSV and Excel files. Required fields: Name, Email, Position
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Choose File
            </button>
          </div>

          {/* Sample Template */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">CSV Template Format:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`name,email,phone,position,location,skills,experience
John Smith,john@email.com,(555)123-4567,Electrician,Tampa FL,Commercial wiring,8 years
Jane Doe,jane@email.com,(555)234-5678,Plumber,Orlando FL,Residential plumbing,5 years`}
            </pre>
          </div>

          {/* Current Data Stats */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Current Database:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Candidates:</span>
                <span className="ml-2 font-bold">{candidates.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Active Pipeline:</span>
                <span className="ml-2 font-bold">
                  {candidates.filter(c => !['rejected', 'hired'].includes(c.status)).length}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </button>
            <button
              onClick={() => {
                if (window.confirm('This will clear all candidates. Are you sure?')) {
                  setCandidates([]);
                  setEngagementAlerts([]);
                }
              }}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Candidate Form
  const AddCandidateForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      position: '',
      location: '',
      skills: '',
      experience: ''
    });

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Candidate</h3>
            <button
              onClick={() => setShowAddCandidate(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddCandidate(formData);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Position</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Flooring Installer">Flooring Installer</option>
                  <option value="Kitchen Designer">Kitchen Designer</option>
                  <option value="Sales Associate">Sales Associate</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="e.g., Commercial wiring, Residential plumbing"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="e.g., 5 years"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddCandidate(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Candidate
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      {/* Database Actions */}
      <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Database className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm text-gray-600">
            {candidates.length} candidates in database
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddCandidate(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Candidate
          </button>
          <button
            onClick={() => setShowDataManager(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center text-sm"
          >
            <Database className="h-4 w-4 mr-1" />
            Manage Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Candidates</p>
              <p className="text-2xl font-bold">{candidates.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+12% from last week</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Time to Schedule</p>
              <p className="text-2xl font-bold">1.2 hrs</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">-78% with AI automation</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ghosting Rate</p>
              <p className="text-2xl font-bold">18%</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">-50% improvement</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">90-Day Retention</p>
              <p className="text-2xl font-bold">91%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+30% vs baseline</p>
        </div>
      </div>

      {/* AI Alerts */}
      {engagementAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-900">AI Engagement Alerts</h3>
          </div>
          <div className="space-y-2">
            {engagementAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between bg-white rounded p-3">
                <span className={`text-sm ${getRiskColor(alert.severity)}`}>
                  {alert.message}
                </span>
                <button
                  onClick={() => handleSendEngagement(alert.candidateId)}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Auto Engage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recruitment Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">
                {candidates.filter(c => c.status === 'new').length}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">New</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-600">
                {candidates.filter(c => c.status === 'screening').length}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Screening</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">
                {candidates.filter(c => c.status === 'interview_scheduled').length}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Interview</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                {candidates.filter(c => c.status === 'offer_extended').length}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Offer</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {candidates.filter(c => c.status === 'onboarding').length}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Onboarding</p>
          </div>
        </div>
      </div>
    </div>
  );

  const CandidatePipeline = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Candidate Pipeline</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddCandidate(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Bulk Actions
          </button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Candidates Yet</h3>
          <p className="text-gray-600 mb-6">
            Add candidates manually or upload a CSV/Excel file to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowAddCandidate(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Add First Candidate
            </button>
            <button
              onClick={() => setShowDataManager(true)}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Import Data
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghosting Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      {candidate.location && (
                        <div className="text-xs text-gray-400">{candidate.location}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.position}</div>
                    <div className="text-sm text-gray-500">Applied {candidate.appliedDate}</div>
                    {candidate.experience && (
                      <div className="text-xs text-gray-400">{candidate.experience}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                      {formatStatus(candidate.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{candidate.engagementScore}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{width: `${candidate.engagementScore}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Last: {candidate.lastContact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getRiskColor(candidate.ghostingRisk)}`}>
                      {candidate.ghostingRisk.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-500">{candidate.responseRate}% response</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {candidate.status === 'new' || candidate.status === 'screening' ? (
                        <button
                          onClick={() => handleAutoSchedule(candidate)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </button>
                      ) : null}
                      <button className="text-blue-600 hover:text-blue-900 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </button>
                      <button 
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const OnboardingRetention = () => {
    const onboardingCandidates = candidates.filter(c => c.status === 'onboarding');

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">First 90-Day Tracking</h2>

        {onboardingCandidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees in Onboarding</h3>
            <p className="text-gray-600">
              Employees will appear here once they reach the onboarding stage.
            </p>
          </div>
        ) : (
          <>
            {/* Retention Risk Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-orange-500" />
                AI Retention Risk Analysis
              </h3>
              <div className="space-y-4">
                {onboardingCandidates.map(candidate => (
                  <div key={candidate.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.position} • Hired {candidate.hireDate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        candidate.retentionRisk === 'low' ? 'bg-green-100 text-green-800' :
                        candidate.retentionRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {candidate.retentionRisk?.toUpperCase() || 'LOW'} RISK
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Onboarding Progress</span>
                        <span>{candidate.onboardingProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full" 
                          style={{width: `${candidate.onboardingProgress || 0}%`}}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Training Modules</p>
                        <p className="font-medium">3 of 8 completed</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Manager Check-ins</p>
                        <p className="font-medium">2 completed</p>
                      </div>
                    </div>

                    {candidate.retentionRisk === 'medium' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>AI Alert:</strong> Low training engagement detected. Recommend immediate manager check-in.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Onboarding Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Avg Onboarding Time</h4>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">5.2 days</p>
            <p className="text-xs text-green-600">-33% vs manual process</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Task Completion Rate</h4>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-gray-600">Within first week</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">90-Day Success Rate</h4>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">91%</p>
            <p className="text-xs text-green-600">+30% improvement</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Home Improvement Recruit AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">AI-Powered Recruitment Platform</span>
              <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Candidate Pipeline
            </button>
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'onboarding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Onboarding & Retention
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'pipeline' && <CandidatePipeline />}
        {activeTab === 'onboarding' && <OnboardingRetention />}
      </main>

      {/* Modals */}
      {schedulingModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">AI Auto-Scheduling</h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-center text-gray-600">
              Finding optimal interview slots and coordinating calendars...
            </p>
          </div>
        </div>
      )}

      {showAddCandidate && <AddCandidateForm />}
      {showDataManager && <DataManager />}
    </div>
  );
};

export default RecruitmentApp;
