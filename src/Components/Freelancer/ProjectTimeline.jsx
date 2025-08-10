import { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiAlertCircle, FiClock, FiPlus } from 'react-icons/fi';
import axios from 'axios';

const ProjectTimeline = () => {
  const [activeProjects, setActiveProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    dueDate: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/freelancer/projects?status=active');
        // Ensure we always have an array
        const projects = Array.isArray(response.data) ? response.data : [];
        setActiveProjects(projects);
        if (projects.length > 0) {
          setSelectedProject(projects[0]._id);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
        setActiveProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveProjects();
  }, []);

  const currentProject = activeProjects.find(p => p._id === selectedProject) || {};
  const daysRemaining = currentProject.deadline 
    ? Math.ceil((new Date(currentProject.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const addMilestone = async () => {
    try {
      const response = await axios.post(
        `/api/freelancer/projects/${selectedProject}/milestones`,
        newMilestone
      );
      setActiveProjects(activeProjects.map(project => 
        project._id === selectedProject 
          ? { 
              ...project, 
              milestones: Array.isArray(project.milestones) 
                ? [...project.milestones, response.data] 
                : [response.data] 
            }
          : project
      ));
      setNewMilestone({ title: '', dueDate: '', description: '' });
    } catch (error) {
      console.error('Error adding milestone:', error);
      setError('Failed to add milestone');
    }
  };

  const updateMilestone = async (milestoneId, updates) => {
    try {
      await axios.put(
        `/api/freelancer/projects/${selectedProject}/milestones/${milestoneId}`,
        updates
      );
      setActiveProjects(activeProjects.map(project => 
        project._id === selectedProject
          ? {
              ...project,
              milestones: Array.isArray(project.milestones) 
                ? project.milestones.map(m =>
                    m._id === milestoneId ? { ...m, ...updates } : m
                  )
                : []
            }
          : project
      ));
    } catch (error) {
      console.error('Error updating milestone:', error);
      setError('Failed to update milestone');
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
      <h2 className="text-xl font-bold mb-6">Project Timeline</h2>
      
      {/* Project Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md"
          disabled={activeProjects.length === 0}
        >
          {activeProjects.length > 0 ? (
            activeProjects.map(project => (
              <option key={project._id} value={project._id}>
                {project.title || 'Untitled Project'} (Due in {daysRemaining} days)
              </option>
            ))
          ) : (
            <option value="">No active projects</option>
          )}
        </select>
      </div>

      {selectedProject && (
        <>
          {/* Project Summary */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">{currentProject.title || 'Untitled Project'}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${
                daysRemaining > 7 ? 'bg-green-100 text-green-800' :
                daysRemaining > 3 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Client</p>
                <p>{currentProject.clientName || 'Unknown Client'}</p>
              </div>
              <div>
                <p className="text-gray-500">Deadline</p>
                <p>{currentProject.deadline ? new Date(currentProject.deadline).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Progress</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${currentProject.progress || 0}%` }}
                    ></div>
                  </div>
                  <span>{currentProject.progress || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-8">
            <h3 className="font-medium text-lg mb-4 flex items-center">
              <FiCalendar className="mr-2" /> Milestones
            </h3>
            
            <div className="space-y-4">
              {currentProject.milestones?.length > 0 ? (
                currentProject.milestones.map(milestone => (
                  <div key={milestone._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {milestone.completed ? (
                          <FiCheck className="text-green-500 mr-2" />
                        ) : (
                          <FiClock className="text-yellow-500 mr-2" />
                        )}
                        <h4 className="font-medium">{milestone.title || 'Untitled Milestone'}</h4>
                      </div>
                      <span className="text-sm text-gray-500">
                        Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{milestone.description || 'No description'}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateMilestone(milestone._id, { completed: !milestone.completed })}
                        className={`text-sm px-3 py-1 rounded flex items-center ${
                          milestone.completed 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {milestone.completed ? (
                          <>
                            <FiCheck className="mr-1" size={14} /> Completed
                          </>
                        ) : (
                          <>
                            <FiAlertCircle className="mr-1" size={14} /> Mark Complete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No milestones created yet
                </div>
              )}
            </div>
          </div>

          {/* Add Milestone Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3 flex items-center">
              <FiPlus className="mr-2" /> Add New Milestone
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Milestone title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Milestone description"
                ></textarea>
              </div>
              <button
                onClick={addMilestone}
                disabled={!newMilestone.title || !newMilestone.dueDate}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectTimeline;