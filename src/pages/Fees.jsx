import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, DocumentTextIcon, CurrencyDollarIcon, ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline';
import { feeService } from '../services/feeService';
import { API_BASE_URL } from '../utils/constants';

const Fees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feeRecords, setFeeRecords] = useState([]);
  const [structureForm, setStructureForm] = useState({ academicYear: '2025-2026', className: '', components: [{ componentName: '', amount: '', frequency: 'ANNUALLY', dueDate: 15, isOptional: false, description: '' }] });
  const [assignForm, setAssignForm] = useState({ academicYear: '2025-2026', className: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fee records on component mount
  useEffect(() => {
    fetchFeeRecords();
  }, []);

  const fetchFeeRecords = async () => {
    try {
      setLoading(true);
      // TODO: Implement getAllFees method in feeService
      // const data = await feeService.getAllFees();
      // setFeeRecords(data.fees || data || []);
      setFeeRecords([]); // Placeholder until API is implemented
      setError(null);
    } catch (err) {
      setError('Failed to fetch fee records');
      console.error('Error fetching fee records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCSV = async (formData) => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/fees/structure/bulk-upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      await res.json();
      alert('Fee structure CSV uploaded successfully');
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveStructure = async () => {
    try {
      const payload = {
        academicYear: structureForm.academicYear,
        className: structureForm.className,
        feeComponents: structureForm.components.map(c => ({
          componentName: c.componentName,
          amount: Number(c.amount || 0),
          frequency: c.frequency,
          dueDate: Number(c.dueDate || 15),
          isOptional: Boolean(c.isOptional),
          description: c.description || ''
        })),
        isActive: true
      };
      await fetch(`${API_BASE_URL}/api/fees/structure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      alert('Fee structure saved');
    } catch (e) {
      console.error(e);
      alert('Failed to save structure');
    }
  };

  const handleAssignFees = async () => {
    try {
      const payload = { academicYear: assignForm.academicYear, className: assignForm.className };
      await fetch(`${API_BASE_URL}/api/fees/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      alert('Fees assigned to class');
    } catch (e) {
      console.error(e);
      alert('Failed to assign fees');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading fee records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  const feeStatuses = ['all', 'Paid', 'Pending', 'Overdue'];

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Admin: Fee Structure & Class Assignment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Fee Structure (Admin)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" value={structureForm.academicYear} onChange={(e)=>setStructureForm({...structureForm, academicYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input type="text" value={structureForm.className} onChange={(e)=>setStructureForm({...structureForm, className: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {structureForm.components.map((c, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input placeholder="Component" value={c.componentName} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].componentName = e.target.value; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2" />
              <input type="number" placeholder="Amount" value={c.amount} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].amount = e.target.value; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2" />
              <select value={c.frequency} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].frequency = e.target.value; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2">
                <option value="ANNUALLY">ANNUALLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
              </select>
              <input type="number" placeholder="Due Day" value={c.dueDate} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].dueDate = e.target.value; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2" />
              <select value={c.isOptional ? '1':'0'} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].isOptional = e.target.value === '1'; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2">
                <option value="0">Mandatory</option>
                <option value="1">Optional</option>
              </select>
              <input placeholder="Description" value={c.description} onChange={(e)=>{
                const components = [...structureForm.components]; components[idx].description = e.target.value; setStructureForm({...structureForm, components});
              }} className="border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          ))}
          <button onClick={()=> setStructureForm({...structureForm, components: [...structureForm.components, { componentName: '', amount: '', frequency: 'ANNUALLY', dueDate: 15, isOptional: false, description: '' }] })} className="text-blue-600 text-sm mt-1">+ Add Component</button>
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={handleSaveStructure} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <CheckIcon className="h-5 w-5" /> Save Structure
          </button>
          <label className="px-4 py-2 bg-gray-100 rounded-lg border cursor-pointer flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={async (e)=>{
              if (!e.target.files?.length) return; const file = e.target.files[0]; const fd = new FormData(); fd.append('csvFile', file); await handleUploadCSV(fd); e.target.value='';
            }} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Fees to Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input type="text" value={assignForm.academicYear} onChange={(e)=>setAssignForm({...assignForm, academicYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input type="text" value={assignForm.className} onChange={(e)=>setAssignForm({...assignForm, className: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleAssignFees} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Assign to Class</button>
        </div>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Generate Fee</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {feeStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <CurrencyDollarIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No fee records found
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all'
                ? "Try adjusting your search criteria or filters"
                : "Get started by generating your first fee record"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id || record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">{record.rollNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.feeType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <DocumentTextIcon className="h-5 w-5" />
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

      {/* Generate Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Fee Collection</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select Student</option>
                      {/* TODO: Populate with actual students from API */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Select Fee Type</option>
                      <option>Monthly Fee</option>
                      <option>Annual Fee</option>
                      <option>Transport Fee</option>
                      <option>Library Fee</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Generate Fee
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;