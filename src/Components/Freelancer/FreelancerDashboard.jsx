import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiUser, FiBriefcase, FiDollarSign, FiClock, FiCheckCircle, FiSettings } from 'react-icons/fi';
import axios from 'axios';

const FreelancerDashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [profileComplete, setProfileComplete] = useState(0);
  const location = useLocation();

  // Get active tab from URL
  const activeTab = location.pathname.split('/').pop() || 'profile';

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/freelancer/profile');
        setProfileData(response.data);
        calculateProfileComplete(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const calculateProfileComplete = (data) => {
    let complete = 0;
    if (data?.skills?.length > 0) complete += 30;
    if (data?.portfolio?.length > 0) complete += 30;
    if (data?.bio) complete += 20;
    if (data?.hourlyRate) complete += 20;
    setProfileComplete(Math.min(100, complete));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Freelancer Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-800 font-medium">
                {profileData?.name?.charAt(0) || 'F'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs - Now using Links */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link
            to="/freelancer-dashboard/profile"
            className={`py-4 px-6 font-medium ${
              activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
          >
            <FiUser className="inline mr-2" /> Profile
          </Link>
          <Link
            to="/freelancer-dashboard/bids"
            className={`py-4 px-6 font-medium ${
              activeTab === 'bids' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
          >
            <FiDollarSign className="inline mr-2" /> Bids
          </Link>
          <Link
            to="/freelancer-dashboard/projects"
            className={`py-4 px-6 font-medium ${
              activeTab === 'projects' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
          >
            <FiBriefcase className="inline mr-2" /> Projects
          </Link>
          <Link
            to="/freelancer-dashboard/timeline"
            className={`py-4 px-6 font-medium ${
              activeTab === 'timeline' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
          >
            <FiClock className="inline mr-2" /> Timeline
          </Link>
        </div>

        {/* Profile Completeness Indicator - Only shows on profile tab */}
        {activeTab === 'profile' && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm font-medium">{profileComplete}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${profileComplete}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tab Content - Rendered via Outlet */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Outlet context={{ profileData }} />
        </div>
      </main>
    </div>
  );
};

export default FreelancerDashboard;