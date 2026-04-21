import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Fees from '../pages/Fees';
import { feeService } from '../services/feeService';
import { CurrencyDollarIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PaymentButton from './PaymentButton/PaymentButton';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
});

const formatCurrency = (amount) => currencyFormatter.format(Number(amount || 0));
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-IN') : 'N/A';
const getFrequencyLabel = (frequency) => ({
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half Yearly',
  ANNUALLY: 'Yearly',
  ONE_TIME: 'One Time',
}[frequency] || frequency || 'N/A');

const RoleAwareFees = () => {
  const { getUserRole, user } = useAuth();
  const userRole = getUserRole();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        setLoading(true);
        
        if (userRole === 'student') {
          const studentId = user?.userData?._id || user?.student?._id;
          if (studentId) {
            const response = await feeService.getFeeDetails(studentId);
            setFeeData(response);
          }
        }
      } catch (err) {
        console.error('Error fetching fee details:', err);
        setError('Failed to load fee information');
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'student') {
      fetchFeeDetails();
    } else {
      setLoading(false);
    }
  }, [userRole, user]);

  if (userRole === 'admin') {
    // Admin sees full fee management interface
    return <Fees />;
  }

  if (userRole === 'teacher' || userRole === 'employee') {
    // Teachers don't have access to fees
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access fee information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (userRole === 'student') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Fees</h1>
          <p className="text-gray-600">View and pay your fees</p>
        </div>
        
        {!feeData ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <CurrencyDollarIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Information</h3>
              <p className="text-gray-500">No fee details found for your account.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fee Summary</h2>
              {feeData.structureContext?.mismatchReason && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="font-semibold mb-1">Fee Structure Notice</div>
                  <div>{feeData.structureContext.mismatchReason}</div>
                  <div className="mt-1 text-xs text-amber-700">
                    Matched year: {feeData.structureContext.matchedAcademicYear || 'None'} | Latest uploaded year: {feeData.structureContext.latestAcademicYear || 'None'}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total Fee</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(feeData.summary?.totalFee || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Paid</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(feeData.summary?.totalPaid || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-xl font-bold text-yellow-600">{formatCurrency(feeData.summary?.totalPending || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Late Fee</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(feeData.summary?.totalLateFee || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Total Due</p>
                      <p className="text-xl font-bold text-indigo-600">{formatCurrency(feeData.summary?.totalDue || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Fee Structure</h2>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    {feeData.structureBreakdown?.feeProfileType || 'N/A'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-3">Component</th>
                        <th className="py-2 pr-3">Cycle</th>
                        <th className="py-2 pr-3">Base</th>
                        <th className="py-2 pr-3">Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(feeData.structureBreakdown?.components || []).filter((component) => component.isApplicable).map((component) => (
                        <tr key={`${component.componentName}-${component.frequency}`} className="border-b border-gray-100">
                          <td className="py-2 pr-3">
                            <div className="font-medium text-gray-900">{component.componentName}</div>
                            <div className="text-xs text-gray-500">{component.category}</div>
                          </td>
                          <td className="py-2 pr-3">{getFrequencyLabel(component.frequency)}</td>
                          <td className="py-2 pr-3">{formatCurrency(component.baseAmount)}</td>
                          <td className="py-2 pr-3 font-medium">{formatCurrency(component.annualAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cycle-wise Ledger</h2>
                <div className="space-y-3">
                  {(feeData.periodLedger || []).map((period) => (
                    <div key={period.frequency} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{getFrequencyLabel(period.frequency)}</div>
                          <div className="text-xs text-gray-500">{period.componentCount} billed item(s)</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>Total: {formatCurrency(period.billedAmount)}</div>
                          <div className="text-green-600">Paid: {formatCurrency(period.paidAmount)}</div>
                          <div className="text-red-600">Pending: {formatCurrency(period.pendingAmount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Component-wise Status</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Component</th>
                      <th className="py-2 pr-3">Cycle</th>
                      <th className="py-2 pr-3">Billed</th>
                      <th className="py-2 pr-3">Paid</th>
                      <th className="py-2 pr-3">Pending</th>
                      <th className="py-2 pr-3">Latest Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(feeData.componentLedger || []).map((component) => (
                      <tr key={`${component.componentName}-${component.frequency}`} className="border-b border-gray-100">
                        <td className="py-2 pr-3">
                          <div className="font-medium text-gray-900">{component.componentName}</div>
                          <div className="text-xs text-gray-500">{component.category}</div>
                        </td>
                        <td className="py-2 pr-3">{getFrequencyLabel(component.frequency)}</td>
                        <td className="py-2 pr-3">{formatCurrency(component.billedAmount)}</td>
                        <td className="py-2 pr-3 text-green-600">{formatCurrency(component.paidAmount)}</td>
                        <td className="py-2 pr-3 text-red-600">{formatCurrency(component.pendingAmount)}</td>
                        <td className="py-2 pr-3">{formatDate(component.latestDueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {feeData.feeCollections && feeData.feeCollections.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Fee Collections</h2>
                <div className="space-y-4">
                  {feeData.feeCollections.map((collection) => (
                    <div key={collection._id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <div className="font-semibold text-gray-900">{collection.receiptNumber}</div>
                          <div className="text-sm text-gray-500">Due {formatDate(collection.dueDate)} • {collection.term || 'FEE'}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            collection.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : collection.paymentStatus === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : collection.paymentStatus === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {collection.paymentStatus}
                          </span>
                          {collection.paymentStatus !== 'PAID' && (
                            <PaymentButton
                              amount={(collection.pendingAmount || 0) + (collection.lateFee || 0)}
                              feeCollection={collection}
                              student={feeData.student}
                              onPaymentSuccess={async () => {
                                try {
                                  const studentId = feeData.student._id;
                                  const refreshed = await feeService.getFeeDetails(studentId);
                                  setFeeData(refreshed);
                                } catch (e) {
                                  console.error('Failed to refresh fee data after payment', e);
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>Total: {formatCurrency(collection.totalAmount)}</div>
                        <div className="text-green-600">Paid: {formatCurrency(collection.paidAmount)}</div>
                        <div className="text-red-600">Pending: {formatCurrency(collection.pendingAmount)}</div>
                        <div className="text-orange-600">Late Fee: {formatCurrency(collection.lateFee)}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(collection.feeComponents || []).map((component, index) => {
                          const componentPaid = component.paidAmount || 0;
                          const componentPending = Math.max(0, (component.amount || 0) - componentPaid);
                          return (
                            <div key={`${component.componentName}-${index}`} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900">{component.componentName}</div>
                                <div className="text-xs text-gray-500">{getFrequencyLabel(component.frequency)}</div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div>Total: {formatCurrency(component.amount)}</div>
                                <div className="text-green-600">Paid: {formatCurrency(componentPaid)}</div>
                                <div className="text-red-600">Pending: {formatCurrency(componentPending)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default RoleAwareFees;
