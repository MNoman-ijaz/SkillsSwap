import { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiTrendingUp, FiArchive } from 'react-icons/fi';
import axios from 'axios';

const ProjectsOverview = () => {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/freelancer/projects');
        // Ensure projects is always an array
        setProjects(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (!project.status) return false;
    if (activeFilter === 'active') return project.status === 'in-progress';
    if (activeFilter === 'completed') return project.status === 'completed';
    if (activeFilter === 'upcoming') return project.status === 'upcoming';
    return true;
  });

  const updateProjectStatus = async (projectId, status) => {
    try {
      await axios.put(`/api/freelancer/projects/${projectId}`, { status });
      setProjects(projects.map(project => 
        project._id === projectId ? { ...project, status } : project
      ));
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project status');
    }
  };

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
        <h2 className="text-xl font-bold">Project Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded flex items-center ${
              activeFilter === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiTrendingUp className="mr-2" /> Active
          </button>
          <button 
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 rounded flex items-center ${
              activeFilter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiClock className="mr-2" /> Upcoming
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded flex items-center ${
              activeFilter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiCheckCircle className="mr-2" /> Completed
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div key={project._id || project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{project.title || 'Untitled Project'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status ? project.status.replace('-', ' ') : 'unknown'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client:</span>
                  <span>{project.clientName || 'Unknown Client'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span>${project.budget || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline:</span>
                  <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="capitalize">{project.category || 'uncategorized'}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {project.status === 'in-progress' && (
                  <>
                    <button 
                      onClick={() => updateProjectStatus(project._id || project.id, 'completed')}
                      className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded flex items-center"
                    >
                      <FiCheckCircle className="mr-1" size={14} /> Complete
                    </button>
                    <button className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
                      Update Progress
                    </button>
                  </>
                )}
                <button className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-500">
            <FiArchive className="mx-auto mb-2" size={24} />
            No {activeFilter} projects found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsOverview;