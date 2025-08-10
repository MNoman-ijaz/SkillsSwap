import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiMessageSquare, FiPlus, FiBarChart2, FiFilter, FiX } from 'react-icons/fi';
import FreelancerCard from './../Freelancer/FreelancerCard';
import ProjectForm from './../Client/ProjectForm';
import axios from 'axios';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [filters, setFilters] = useState({
    skills: [],
    minRating: 0,
    maxRate: 100,
    availability: 'all'
  });
  const [currentUser] = useState({
    name: 'Client User', // This would typically come from your auth system
    id: 'client123' // Mock client ID
  });

  // Fetch freelancers when Find Freelancers tab is active
  useEffect(() => {
    if (activeTab === 'freelancers') {
      fetchFreelancers();
    }
  }, [activeTab]);

  const fetchFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/freelancer', {
        params: {
          completeProfile: true // Request complete profile data
        }
      });
      
      // Format the data to ensure all required fields exist
      const formattedFreelancers = response.data.map(freelancer => ({
        _id: freelancer._id,
        name: freelancer.name || 'Unknown Freelancer',
        bio: freelancer.bio || '',
        skills: freelancer.skills || [],
        hourlyRate: freelancer.hourlyRate || 0,
        rating: freelancer.rating || 0,
        profileImage: freelancer.profileImage || '',
        availability: freelancer.availability || 'full-time',
        portfolio: freelancer.portfolio || [],
        education: freelancer.education || [],
        experience: freelancer.experience || [],
        hiredBy: freelancer.hiredBy || [] // Add hiredBy field
      }));

      setFreelancers(formattedFreelancers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch freelancers');
      console.error('Error fetching freelancers:', err);
    } finally {
      setLoading(false);
    }
  };

const hireFreelancer = async (freelancerName) => {
  try {
    console.log('Attempting to hire:', freelancerName); // Debug log
    
    const freelancerToHire = freelancers.find(f => f.name === freelancerName);
    if (!freelancerToHire) {
      throw new Error('Freelancer not found in local data');
    }

    const response = await axios.post(
      'http://localhost:5000/api/freelancer/hire', // Note: singular
      {
        freelancerName,
        clientName: currentUser.name
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Hire response:', response.data); // Debug log

    if (response.data.success) {
      setFreelancers(freelancers.map(f => 
        f.name === freelancerName
          ? { ...f, hiredBy: [...(f.hiredBy || []), currentUser.name] }
          : f
      ));
      alert(response.data.message);
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.error('Full hiring error:', {
      message: err.message,
      response: err.response?.data,
      config: err.config
    });
    alert(err.response?.data?.message || err.message || 'Hiring failed. Please try again.');
  }
};
  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills.some(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilters =
      freelancer.rating >= filters.minRating &&
      freelancer.hourlyRate <= filters.maxRate &&
      (filters.skills.length === 0 ||
        filters.skills.every(skill => freelancer.skills.includes(skill))) &&
      (filters.availability === 'all' || 
       freelancer.availability === filters.availability);

    return matchesSearch && matchesFilters;
  });

  const allSkills = Array.from(
    new Set(freelancers.flatMap(f => f.skills))
  ).sort();

  const handleCreateProject = (newProject) => {
    setProjects([...projects, {
      ...newProject,
      id: Date.now(),
      status: 'open',
      bidsCount: 0,
      deadline: new Date(newProject.deadline).toLocaleDateString()
    }]);
    setShowProjectForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SkillSwap</h1>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg bg-indigo-600 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="p-2 hover:bg-indigo-600 rounded-full relative">
              <FiBell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <button className="p-2 hover:bg-indigo-600 rounded-full relative">
              <FiMessageSquare size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="font-medium">C</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto flex overflow-x-auto">
          {['projects', 'freelancers', 'bids', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-700 border-b-2 border-indigo-700'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'projects' && 'My Projects'}
              {tab === 'freelancers' && 'Find Freelancers'}
              {tab === 'bids' && 'Bids'}
              {tab === 'analytics' && 'Analytics'}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-6">
        {/* Freelancers Tab */}
        {activeTab === 'freelancers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Available Freelancers</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <FiFilter className="mr-2" />
                  Filters
                </button>
                <button 
                  onClick={fetchFreelancers}
                  className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <p>Loading freelancers...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <button 
                  onClick={fetchFreelancers}
                  className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Filters Panel */}
                {showFilters && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Skills</label>
                        <select
                          multiple
                          className="w-full p-2 border rounded h-auto min-h-[100px]"
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFilters({...filters, skills: selected});
                          }}
                        >
                          {allSkills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                        {filters.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {filters.skills.map(skill => (
                              <span 
                                key={skill} 
                                className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center"
                              >
                                {skill}
                                <button 
                                  onClick={() => setFilters({
                                    ...filters, 
                                    skills: filters.skills.filter(s => s !== skill)
                                  })}
                                  className="ml-1"
                                >
                                  <FiX size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Min Rating: {filters.minRating}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={filters.minRating}
                          onChange={(e) =>
                            setFilters({ ...filters, minRating: parseFloat(e.target.value) })
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>5</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Max Hourly Rate: ${filters.maxRate}
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={filters.maxRate}
                          onChange={(e) =>
                            setFilters({ ...filters, maxRate: parseInt(e.target.value) })
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>$10</span>
                          <span>$200</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Availability</label>
                        <select
                          className="w-full p-2 border rounded"
                          value={filters.availability}
                          onChange={(e) => setFilters({...filters, availability: e.target.value})}
                        >
                          <option value="all">All</option>
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Freelancer Cards */}
                <div className="p-4">
                  {filteredFreelancers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFreelancers.map(freelancer => (
                        <FreelancerCard 
                          key={freelancer._id} 
                          freelancer={freelancer}
                          onHire={() => hireFreelancer(freelancer.name)}
                          currentUser={currentUser}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {freelancers.length === 0 
                          ? 'No freelancers available' 
                          : 'No freelancers match your search criteria'}
                      </p>
                      <button 
                        onClick={() => {
                          setFilters({
                            skills: [],
                            minRating: 0,
                            maxRate: 100,
                            availability: 'all'
                          });
                          setSearchTerm('');
                        }}
                        className="mt-2 text-indigo-600 hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">My Projects</h2>
              <button 
                onClick={() => setShowProjectForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-700"
              >
                <FiPlus className="mr-2" />
                New Project
              </button>
            </div>

            <div className="divide-y">
              {projects.length > 0 ? (
                projects.map(project => (
                  <div key={project.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{project.title}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'open' 
                              ? 'bg-green-100 text-green-800' 
                              : project.status === 'in-progress' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                          <span className="ml-2 text-gray-500 text-sm">
                            {project.deadline}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:underline">Edit</button>
                        <button className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                    <p className="my-2 text-gray-600">{project.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex space-x-2">
                        {project.skills?.map(skill => (
                          <span key={skill} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {project.bidsCount || 0} bids
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">You don't have any projects yet</p>
                  <button 
                    onClick={() => setShowProjectForm(true)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bids Tab */}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Project Bids</h2>
            </div>

            <div className="divide-y">
              {bids.length > 0 ? (
                bids.map(bid => (
                  <div key={bid.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">
                            {bid.freelancerName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{bid.freelancerName}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Bid: <span className="font-bold">${bid.amount}</span> • 
                            Estimated: {bid.deliveryTime} days
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                          Accept
                        </button>
                        <button className="border border-indigo-600 text-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-50">
                          Counter
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 ml-13 text-gray-600">{bid.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">You don't have any bids yet</p>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Create a project to get bids
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex items-center">
              <FiBarChart2 className="text-indigo-600 mr-2" size={20} />
              <h2 className="text-xl font-bold">Analytics Dashboard</h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="border rounded-lg p-4 hover:shadow transition">
                  <h3 className="text-gray-600 text-sm">Total Projects</h3>
                  <p className="text-3xl font-bold text-indigo-600">{projects.length}</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow transition">
                  <h3 className="text-gray-600 text-sm">Active Freelancers</h3>
                  <p className="text-3xl font-bold text-indigo-600">{freelancers.length}</p>
                </div>
                <div className="border rounded-lg p-4 hover:shadow transition">
                  <h3 className="text-gray-600 text-sm">Total Bids</h3>
                  <p className="text-3xl font-bold text-indigo-600">{bids.length}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Projects by Status</h3>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  Projects Status Chart
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ProjectForm 
            onClose={() => setShowProjectForm(false)}
            onSubmit={handleCreateProject}
          />
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;