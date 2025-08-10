import { useState, useEffect } from 'react';
import { FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/freelancer/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (filter === 'active') return project.status === 'in-progress';
    if (filter === 'upcoming') return project.status === 'upcoming';
    if (filter === 'completed') return project.status === 'completed';
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
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Project Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded flex items-center ${
              filter === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiTrendingUp className="mr-2" /> Active
          </button>
          <button 
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded flex items-center ${
              filter === 'upcoming' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiClock className="mr-2" /> Upcoming
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded flex items-center ${
              filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            <FiCheckCircle className="mr-2" /> Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{project.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client:</span>
                  <span>{project.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget:</span>
                  <span>${project.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline:</span>
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="capitalize">{project.category}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                {project.status === 'in-progress' && (
                  <>
                    <button 
                      onClick={() => updateProjectStatus(project._id, 'completed')}
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
            <FiBriefcase className="mx-auto mb-2" size={24} />
            No {filter} projects found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;