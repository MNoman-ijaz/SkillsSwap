import { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheck, FiX, FiEdit } from 'react-icons/fi';
import axios from 'axios';

const BidsManagement = () => {
  const [bids, setBids] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [stats, setStats] = useState({
    avgBid: 0,
    successRate: 0,
    totalBids: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/freelancer/bids');
        
        // Safely handle API response
        setBids(response.data?.bids || []);
        setStats({
          avgBid: response.data?.stats?.avgBid || 0,
          successRate: response.data?.stats?.successRate || 0,
          totalBids: response.data?.stats?.totalBids || 0
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching bids:', error);
        setError('Failed to load bids');
        setBids([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const updateBid = async (bidId, updates) => {
    try {
      await axios.put(`/api/freelancer/bids/${bidId}`, updates);
      setBids(bids.map(bid => 
        bid._id === bidId ? { ...bid, ...updates } : bid
      ));
    } catch (error) {
      console.error('Error updating bid:', error);
      setError('Failed to update bid');
    }
  };

  const filteredBids = bids.filter(bid => {
    if (!bid.status) return false;
    if (activeTab === 'active') return bid.status === 'pending';
    if (activeTab === 'accepted') return bid.status === 'accepted';
    if (activeTab === 'rejected') return bid.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Bid Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded ${activeTab === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('accepted')}
            className={`px-4 py-2 rounded ${activeTab === 'accepted' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Accepted
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded ${activeTab === 'rejected' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Bid Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <FiDollarSign className="text-green-500 mr-2" size={20} />
            <span className="font-medium">Avg. Bid</span>
          </div>
          <p className="text-2xl font-bold mt-2">${stats.avgBid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <FiCheck className="text-blue-500 mr-2" size={20} />
            <span className="font-medium">Success Rate</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.successRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <FiClock className="text-yellow-500 mr-2" size={20} />
            <span className="font-medium">Total Bids</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalBids}</p>
        </div>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length > 0 ? (
          filteredBids.map(bid => (
            <div key={bid._id || bid.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{bid.projectTitle || 'Untitled Project'}</h3>
                  <p className="text-sm text-gray-600">Client: {bid.clientName || 'Unknown Client'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bid.status || 'unknown'}
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bid Amount</p>
                  <p className="font-medium">${bid.amount || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Time</p>
                  <p className="font-medium">{bid.estimatedTime || 'N/A'} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-medium">
                    {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-500">Proposal</p>
                <p className="text-gray-700">{bid.proposal || 'No proposal text provided'}</p>
              </div>

              {activeTab === 'active' && (
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => updateBid(bid._id || bid.id, { status: 'withdrawn' })}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <FiX className="mr-1" /> Withdraw Bid
                  </button>
                  <button 
                    onClick={() => {/* Implement edit modal */}}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <FiEdit className="mr-1" /> Edit
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No {activeTab} bids found
          </div>
        )}
      </div>
    </div>
  );
};

export default BidsManagement;