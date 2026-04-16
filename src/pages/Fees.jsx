import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, DocumentTextIcon, CurrencyDollarIcon, ArrowUpTrayIcon, CheckIcon, UserIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { feeService } from '../services/feeService';
import { paymentService } from '../services/paymentService';
import { studentService } from '../services/studentService';
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
  const [students, setStudents] = useState([]);
  const [extraFee, setExtraFee] = useState({ studentId: '', feeType: '', amount: '', dueDate: '' });
  const [markPaid, setMarkPaid] = useState({ 
    studentId: '', 
    feeCollectionId: '', 
    amount: '', 
    paymentMethod: 'CASH',
    receiptNumber: ''
  });
  const [markPaidCollections, setMarkPaidCollections] = useState([]);
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('mark-payment'); // 'mark-payment', 'fee-structure', 'bulk-upload'

  // Fee status options for filtering
  const feeStatuses = ['all', 'Paid', 'Pending', 'Overdue', 'Partial'];

  // Fetch fee records on component mount
  useEffect(() => {
    fetchFeeRecords();
    // Preload students for the Generate Fee modal
    (async () => {
      try {
        const allStudents = await studentService.getAllStudents();
        setStudents(allStudents || []);
      } catch (e) {
        console.error('Failed to load students', e);
      }
    })();
  }, []);

  // Load fee collections for selected student for manual mark-paid
  useEffect(() => {
    (async () => {
      try {
        if (!markPaid.studentId) { setMarkPaidCollections([]); return; }
        const res = await feeService.getFeeDetails(markPaid.studentId);
        const cols = (res.feeCollections || []).filter(c => c.paymentStatus !== 'PAID');
        setMarkPaidCollections(cols);
        if (markPaid.feeCollectionId && !cols.find(c => (c._id === markPaid.feeCollectionId))) {
          setMarkPaid(prev => ({ ...prev, feeCollectionId: '' }));
        }
      } catch (e) {
        console.error('Failed to load fee collections for student', e);
        setMarkPaidCollections([]);
      }
    })();
  }, [markPaid.studentId]);

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

  // Search student by scholar number
  const handleSearchByScholarNumber = async (scholarNumber) => {
    try {
      if (!scholarNumber.trim()) {
        alert('Please enter a scholar number');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/fees/search/scholar/${scholarNumber.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Student not found');
      }

      const data = await res.json();
      setSearchedStudent(data);
      
      // Auto-select the student in the mark paid form
      setMarkPaid(prev => ({ ...prev, studentId: data.student._id }));
      
      // Load fee collections for this student
      const cols = (data.feeCollections || []).filter(c => c.paymentStatus !== 'PAID');
      setMarkPaidCollections(cols);
      
      alert(`Found student: ${data.student.firstName} ${data.student.lastName} - Class ${data.student.className}${data.student.section ? `-${data.student.section}` : ''}`);
      
    } catch (error) {
      console.error('Error searching student:', error);
      alert(error.message || 'Failed to search student');
      setSearchedStudent(null);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    try {
      if (!markPaid.studentId || !markPaid.feeCollectionId) { 
        alert('Please select student and fee collection'); 
        return; 
      }

      const payload = { 
        studentId: markPaid.studentId, 
        feeCollectionId: markPaid.feeCollectionId,
        paymentMethod: markPaid.paymentMethod || 'CASH'
      };
      
      if (markPaid.amount) payload.amount = Number(markPaid.amount);
      if (markPaid.receiptNumber) payload.receiptNumber = markPaid.receiptNumber;

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/fees/mark-paid`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        }, 
        body: JSON.stringify(payload) 
      });

      let data = {};
      try { data = await res.json(); } catch(_) {}
      
      if (!res.ok) {
        const text = data?.message || `${res.status} ${res.statusText}`;
        throw new Error(text);
      }

      alert(`Payment marked successfully! Amount: ₹${data.summary?.paymentAmount || 'Full'}`);
      
      // Reset form
      setMarkPaid({ 
        studentId: '', 
        feeCollectionId: '', 
        amount: '', 
        paymentMethod: 'CASH',
        receiptNumber: ''
      });
      setMarkPaidCollections([]);
      setSearchedStudent(null);
      
      // Refresh fee collections if student is still selected
      if (markPaid.studentId) {
        const res = await feeService.getFeeDetails(markPaid.studentId);
        const cols = (res.feeCollections || []).filter(c => c.paymentStatus !== 'PAID');
        setMarkPaidCollections(cols);
      }
      
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert(error.message || 'Failed to mark as paid');
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
          dueDate: Number(c.dueday || 15),
          isOptional: c.isOptional,
          description: c.description || ''
        }))
      };
      const res = await feeService.upsertFeeStructure(payload);
      alert('Fee structure saved successfully');
      setStructureForm({ academicYear: '2025-2026', className: '', components: [{ componentName: '', amount: '', frequency: 'ANNUALLY', dueDate: 15, isOptional: false, description: '' }] });
    } catch (e) {
      console.error(e);
      alert('Failed to save fee structure');
    }
  };

  const handleAssignFees = async () => {
    try {
      const res = await feeService.assignFeesToClass(assignForm);
      alert(`Fees assigned to ${assignForm.className} successfully`);
      setAssignForm({ academicYear: '2025-2026', className: '' });
    } catch (e) {
      console.error(e);
      alert('Failed to assign fees');
    }
  };

  const handleGenerateExtraFee = async () => {
    try {
      if (!extraFee.studentId || !extraFee.feeType || !extraFee.amount) {
        alert('Please fill all required fields');
        return;
      }
      const payload = {
        studentId: extraFee.studentId,
        term: 'EXTRA',
        feeComponents: [{
          componentName: extraFee.feeType,
          amount: Number(extraFee.amount),
          dueDate: extraFee.dueDate || new Date()
        }],
        dueDate: extraFee.dueDate || new Date()
      };
      const res = await feeService.generateFeeCollection(payload);
      alert('Extra fee generated successfully');
      setExtraFee({ studentId: '', feeType: '', amount: '', dueDate: '' });
      setShowAddModal(false);
    } catch (e) {
      console.error(e);
      alert('Failed to generate extra fee');
    }
  };

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600 mt-2">Manage student fees, structures, and payments</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Generate Fee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('mark-payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mark-payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5" />
                <span>Mark Payment</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('fee-structure')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fee-structure'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5" />
                <span>Fee Structure</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bulk-upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk-upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ArrowUpTrayIcon className="h-5 w-5" />
                <span>Bulk Upload</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab 1: Mark Payment */}
          {activeTab === 'mark-payment' && (
            <div className="space-y-6">
              {/* Search by Scholar Number */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Quick Student Search</h3>
                </div>
                <p className="text-blue-700 mb-4">Search for a student by their scholar number to quickly access their fee information</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Enter Scholar Number (e.g., SN001)" 
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchByScholarNumber(e.target.value);
                        }
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const scholarNumber = document.querySelector('input[placeholder*="Scholar Number"]').value;
                      if (scholarNumber) handleSearchByScholarNumber(scholarNumber);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Search Student
                  </button>
                </div>
                
                {/* Display searched student information */}
                {searchedStudent && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-blue-900 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Student Found
                      </h4>
                      <button 
                        onClick={() => setSearchedStudent(null)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <div className="font-medium">{searchedStudent.student.firstName} {searchedStudent.student.lastName}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Scholar No:</span>
                        <div className="font-medium">{searchedStudent.student.scholarNumber}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <div className="font-medium">{searchedStudent.student.className}-{searchedStudent.student.section}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Academic Year:</span>
                        <div className="font-medium">{searchedStudent.student.academicYear}</div>
                      </div>
                    </div>
                    
                    {/* Fee Summary */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-3">Fee Summary</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-600 block text-xs">Total Fee</span>
                          <div className="font-semibold text-lg">₹{searchedStudent.summary.totalFee}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <span className="text-gray-600 block text-xs">Paid</span>
                          <div className="font-semibold text-lg text-green-600">₹{searchedStudent.summary.totalPaid}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="text-gray-600 block text-xs">Pending</span>
                          <div className="font-semibold text-lg text-red-600">₹{searchedStudent.summary.totalPending}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <span className="text-gray-600 block text-xs">Late Fee</span>
                          <div className="font-semibold text-lg text-orange-600">₹{searchedStudent.summary.totalLateFee}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <span className="text-gray-600 block text-xs">Total Due</span>
                          <div className="font-semibold text-lg text-red-600">₹{searchedStudent.summary.totalDue}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCardIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Mark Payment as Received</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                    <select 
                      value={markPaid.studentId} 
                      onChange={(e)=> setMarkPaid({ ...markPaid, studentId: e.target.value, feeCollectionId: '' })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>
                          {`${s.firstName || ''} ${s.lastName || ''}`.trim()} - {s.scholarNumber || 'No Scholar No.'} - {s.className}{s.section ? `-${s.section}`:''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Fee Collection</label>
                    <select 
                      value={markPaid.feeCollectionId} 
                      onChange={(e)=> setMarkPaid({ ...markPaid, feeCollectionId: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose fee collection...</option>
                      {markPaidCollections.map(c => {
                        const totalPending = (c.pendingAmount || 0) + (c.lateFee || 0);
                        return (
                          <option key={c._id} value={c._id}>
                            {`${c.receiptNumber} — Pending ₹${totalPending} — Due ${new Date(c.dueDate).toLocaleDateString()}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Fee Summary Display */}
                {markPaid.feeCollectionId && (() => {
                  const selectedCollection = markPaidCollections.find(c => c._id === markPaid.feeCollectionId);
                  if (!selectedCollection) return null;
                  
                  const totalPending = (selectedCollection.pendingAmount || 0) + (selectedCollection.lateFee || 0);
                  const totalAmount = selectedCollection.totalAmount || 0;
                  const paidAmount = selectedCollection.paidAmount || 0;
                  
                  return (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Selected Fee Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Fee:</span>
                          <div className="font-medium">₹{totalAmount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Paid Amount:</span>
                          <div className="font-medium text-green-600">₹{paidAmount}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Pending Amount:</span>
                          <div className="font-medium text-red-600">₹{totalPending}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Status:</span>
                          <div className={`font-medium ${
                            selectedCollection.paymentStatus === 'PAID' ? 'text-green-600' :
                            selectedCollection.paymentStatus === 'PARTIAL' ? 'text-yellow-600' :
                            selectedCollection.paymentStatus === 'OVERDUE' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {selectedCollection.paymentStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                    <input 
                      type="number" 
                      placeholder="Leave blank for full payment" 
                      value={markPaid.amount} 
                      onChange={(e)=> setMarkPaid({ ...markPaid, amount: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const selectedCollection = markPaidCollections.find(c => c._id === markPaid.feeCollectionId);
                        if (!selectedCollection) return '';
                        const totalPending = (selectedCollection.pendingAmount || 0) + (selectedCollection.lateFee || 0);
                        return `Maximum: ₹${totalPending}`;
                      })()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select 
                      value={markPaid.paymentMethod || 'CASH'} 
                      onChange={(e)=> setMarkPaid({ ...markPaid, paymentMethod: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CARD">Card Payment</option>
                      <option value="UPI">UPI</option>
                      <option value="DD">Demand Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Auto-generated if empty" 
                      value={markPaid.receiptNumber || ''} 
                      onChange={(e)=> setMarkPaid({ ...markPaid, receiptNumber: e.target.value })} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    disabled={!markPaid.studentId || !markPaid.feeCollectionId} 
                    onClick={handleMarkAsPaid}
                    className={`px-6 py-3 text-white rounded-lg font-medium transition-colors ${
                      (!markPaid.studentId || !markPaid.feeCollectionId) 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-5 w-5" />
                      <span>Mark as Paid</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Fee Structure */}
          {activeTab === 'fee-structure' && (
            <div className="space-y-6">
              {/* Create Fee Structure */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Fee Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input type="text" value={structureForm.academicYear} onChange={(e)=>setStructureForm({...structureForm, academicYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input type="text" value={structureForm.className} onChange={(e)=>setStructureForm({...structureForm, className: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee Components</label>
                  {structureForm.components.map((component, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                      <input type="text" placeholder="Component name" value={component.componentName} onChange={(e)=>setStructureForm({...structureForm, components: structureForm.components.map((c, i) => i === index ? {...c, componentName: e.target.value} : c)})} className="border border-gray-300 rounded-lg px-3 py-2" />
                      <input type="number" placeholder="Amount" value={component.amount} onChange={(e)=>setStructureForm({...structureForm, components: structureForm.components.map((c, i) => i === index ? {...c, amount: e.target.value} : c)})} className="border border-gray-300 rounded-lg px-3 py-2" />
                      <select value={component.frequency} onChange={(e)=>setStructureForm({...structureForm, components: structureForm.components.map((c, i) => i === index ? {...c, frequency: e.target.value} : c)})} className="border border-gray-300 rounded-lg px-3 py-2">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="ANNUALLY">Annually</option>
                        <option value="ONE_TIME">One Time</option>
                      </select>
                      <input type="number" placeholder="Due day" value={component.dueDate} onChange={(e)=>setStructureForm({...structureForm, components: structureForm.components.map((c, i) => i === index ? {...c, dueDate: e.target.value} : c)})} className="border border-gray-300 rounded-lg px-3 py-2" />
                      <label className="flex items-center">
                        <input type="checkbox" checked={component.isOptional} onChange={(e)=>setStructureForm({...structureForm, components: structureForm.components.map((c, i) => i === index ? {...c, isOptional: e.target.checked} : c)})} className="mr-2" />
                        Optional
                      </label>
                    </div>
                  ))}
                  <button onClick={()=>setStructureForm({...structureForm, components: [...structureForm.components, {componentName: '', amount: '', frequency: 'ANNUALLY', dueDate: 15, isOptional: false, description: ''}]})} className="text-blue-600 hover:text-blue-800 text-sm">+ Add Component</button>
                </div>
                <button onClick={handleSaveStructure} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Fee Structure</button>
              </div>

              {/* Assign Fees to Class */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Fees to Class</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <input type="text" value={assignForm.academicYear} onChange={(e)=>setAssignForm({...assignForm, academicYear: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <input type="text" value={assignForm.className} onChange={(e)=>setAssignForm({...assignForm, className: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <button onClick={handleAssignFees} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Assign to Class</button>
              </div>
            </div>
          )}

          {/* Tab 3: Bulk Upload */}
          {activeTab === 'bulk-upload' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Fee Structure</h3>
                <p className="text-gray-600 mb-4">Upload a CSV file to create fee structures for multiple classes at once.</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="csv-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Choose CSV File
                    </label>
                    <input id="csv-upload" type="file" accept=".csv" onChange={(e) => {
                      if (e.target.files[0]) {
                        const formData = new FormData();
                        formData.append('csvFile', e.target.files[0]);
                        handleUploadCSV(formData);
                      }
                    }} className="hidden" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
                </div>
                {uploading && <p className="text-blue-600 text-center mt-2">Uploading...</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Extra Fee</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select value={extraFee.studentId} onChange={(e)=> setExtraFee({ ...extraFee, studentId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Student</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{`${s.firstName || ''} ${s.lastName || ''}`.trim()} - ${s.className}${s.section ? `-${s.section}`:''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                    <input value={extraFee.feeType} onChange={(e)=> setExtraFee({ ...extraFee, feeType: e.target.value })} placeholder="e.g., Transport Fee" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" value={extraFee.amount} onChange={(e)=> setExtraFee({ ...extraFee, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input type="date" value={extraFee.dueDate} onChange={(e)=> setExtraFee({ ...extraFee, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleGenerateExtraFee}
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