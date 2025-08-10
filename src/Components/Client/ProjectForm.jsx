import { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

const ProjectForm = ({ onClose, onSubmit }) => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    skills: [],
    budget: '',
    deadline: '',
    status: 'open'
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...project,
      id: Date.now(),
      bidsCount: 0
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !project.skills.includes(newSkill.trim())) {
      setProject({
        ...project,
        skills: [...project.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProject({
      ...project,
      skills: project.skills.filter(s => s !== skill)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-bold">Create New Project</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Title</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({...project, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={project.description}
              onChange={(e) => setProject({...project, description: e.target.value})}
              className="w-full p-2 border rounded"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.skills.map((skill, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center">
                  {skill}
                  <button 
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-indigo-600"
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 p-2 border rounded-l"
                placeholder="Add skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-indigo-600 text-white px-3 py-2 rounded-r"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget ($)</label>
              <input
                type="number"
                value={project.budget}
                onChange={(e) => setProject({...project, budget: e.target.value})}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={project.deadline}
                onChange={(e) => setProject({...project, deadline: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
          >
            <FiSave className="mr-2" />
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;