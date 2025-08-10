import { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const ProfileManagement = () => {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    skills: [],
    hourlyRate: '',
    portfolio: [],
    verified: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', url: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/freelancer/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put('/api/freelancer/profile', profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.url.trim()) {
      setProfile({
        ...profile,
        portfolio: [...profile.portfolio, newPortfolioItem]
      });
      setNewPortfolioItem({ title: '', url: '' });
    }
  };

  const removePortfolioItem = (index) => {
    setProfile({
      ...profile,
      portfolio: profile.portfolio.filter((_, i) => i !== index)
    });
  };

  const calculateCompleteness = () => {
    let complete = 0;
    if (profile.skills.length > 0) complete += 30;
    if (profile.portfolio.length > 0) complete += 30;
    if (profile.bio) complete += 20;
    if (profile.hourlyRate) complete += 20;
    return complete;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Profile Management</h2>
        {isEditing ? (
          <div className="flex space-x-2">
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FiSave className="mr-2" /> Save Changes
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 px-4 py-2 rounded flex items-center"
            >
              <FiX className="mr-2" /> Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
          >
            <FiEdit className="mr-2" /> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Editable Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                value={profile.hourlyRate}
                onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              placeholder="Tell clients about your skills and experience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((skill, index) => (
                <div key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center">
                  {skill}
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill"
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <button 
                onClick={addSkill}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r"
              >
                <FiPlus />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Items</label>
            <div className="space-y-3 mb-4">
              {profile.portfolio.map((item, index) => (
                <div key={index} className="border border-gray-200 p-3 rounded flex justify-between">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                      {item.url}
                    </a>
                  </div>
                  <button 
                    onClick={() => removePortfolioItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newPortfolioItem.title}
                onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                placeholder="Project title"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="url"
                value={newPortfolioItem.url}
                onChange={(e) => setNewPortfolioItem({...newPortfolioItem, url: e.target.value})}
                placeholder="Project URL"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button 
                onClick={addPortfolioItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
              >
                <FiPlus className="mr-2" /> Add Portfolio Item
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile View Mode */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">About</h3>
              <p className="text-gray-700">{profile.bio || 'No bio added yet'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Verification Status</h3>
              <div className="flex items-center">
                <span className={`h-3 w-3 rounded-full mr-2 ${profile.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span>{profile.verified ? 'Verified' : 'Pending Verification'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Hourly Rate</h3>
              <p className="text-gray-700">
                {profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not specified'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Portfolio</h3>
              <div className="space-y-3">
                {profile.portfolio.length > 0 ? (
                  profile.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-200 p-3 rounded">
                      <h4 className="font-medium">{item.title}</h4>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm"
                      >
                        View Project
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No portfolio items added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;