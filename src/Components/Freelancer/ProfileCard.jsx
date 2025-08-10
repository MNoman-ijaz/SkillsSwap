import { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiPlus, FiTrash2, FiStar, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import StarRating from './../Client/StarRating';

const ProfileCard = ({ profileData, isClientView = false, currentUser, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    hourlyRate: '',
    portfolio: [],
    profileImage: '',
    ratings: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioItem, setNewPortfolioItem] = useState({ 
    title: '', 
    url: '',
    description: '',
    image: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  // Initialize form data
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        skills: profileData.skills || [],
        hourlyRate: profileData.hourlyRate || '',
        portfolio: profileData.portfolio || [],
        profileImage: profileData.profileImage || '',
        ratings: profileData.ratings || []
      });
      setImagePreview(profileData.profileImage || '');
    }
  }, [profileData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setFormData(prev => ({ ...prev, profileImage: response.data.url }));
      setImagePreview(response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/freelancer/profile',
        {
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills,
          hourlyRate: formData.hourlyRate,
          portfolio: formData.portfolio?.map(item => ({
            title: item.title,
            url: item.url,
            description: item.description || '',
            image: item.image || ''
          })) || [],
          profileImage: formData.profileImage
        }
        // No auth headers needed
      );
      
      setIsEditing(false);
      if (onUpdate) onUpdate(response.data);
    } catch (error) {
      console.error('Save error:', error);
      alert(`Save failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim() && newPortfolioItem.url.trim()) {
      setFormData({
        ...formData,
        portfolio: [...formData.portfolio, {
          ...newPortfolioItem,
          id: Date.now() // Temporary ID
        }]
      });
      setNewPortfolioItem({ title: '', url: '', description: '', image: '' });
    }
  };

  const removePortfolioItem = (id) => {
    setFormData({
      ...formData,
      portfolio: formData.portfolio.filter(item => item.id !== id)
    });
  };

  const handlePortfolioImageUpload = async (e, itemId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData(prev => ({
        ...prev,
        portfolio: prev.portfolio.map(item => 
          item.id === itemId ? { ...item, image: response.data.url } : item
        )
      }));
    } catch (error) {
      console.error('Error uploading portfolio image:', error);
      alert(`Failed to upload portfolio image: ${error.response?.data?.error || error.message}`);
    }
  };

  const submitReview = async () => {
    if (!newReview.rating || !newReview.comment) {
      alert('Please provide both a rating and comment');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/ratings', {
        freelancerId: profileData.userId,
        clientId: currentUser.id,
        clientName: currentUser.name,
        value: newReview.rating,
        comment: newReview.comment
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData(prev => ({
        ...prev,
        ratings: [...prev.ratings, response.data]
      }));
      setNewReview({ rating: 0, comment: '' });
      if (onUpdate) onUpdate({ ...formData, ratings: [...formData.ratings, response.data] });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.response?.data?.error || error.message}`);
    }
  };

  // Calculate average rating
  const averageRating = formData.ratings?.length > 0 
    ? (formData.ratings.reduce((sum, rating) => sum + rating.value, 0) / formData.ratings.length).toFixed(1)
    : 0;

  // Check if current user has already reviewed
  const hasReviewed = currentUser && formData.ratings.some(r => r.clientId === currentUser.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile Header with Image */}
      {!isEditing && (isClientView || formData.profileImage) && (
        <div className="relative h-48 bg-gray-200">
          {formData.profileImage ? (
            <img 
              src={formData.profileImage} 
              alt="Profile header" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              {isClientView ? 'No profile image' : 'Upload a profile image'}
            </div>
          )}
          {isClientView && (
            <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full shadow flex items-center">
              <FiStar className="text-yellow-500 mr-1" />
              <span className="font-medium">{averageRating}</span>
              <span className="text-gray-500 ml-1">({formData.ratings?.length || 0})</span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {isClientView ? `${formData.name}'s Profile` : 'Professional Profile'}
          </h2>
          {!isClientView && (
            isEditing ? (
              <div className="flex space-x-2">
                <button 
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <FiSave className="mr-2" /> Save Profile
                    </>
                  )}
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
            )
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="50"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded inline-flex items-center">
                <FiUpload className="mr-2" />
                Upload Image
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="mt-2 w-32 h-32 rounded overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                placeholder="Describe your skills and experience"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills.map((skill, index) => (
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
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
              <div className="space-y-3 mb-3">
                {formData.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 p-3 rounded relative">
                    <button 
                      onClick={() => removePortfolioItem(item.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                    <h4 className="font-medium">{item.title}</h4>
                    {item.image && (
                      <div className="my-2 w-full h-32 rounded overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-1">{item.description}</p>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 text-sm"
                    >
                      {item.url}
                    </a>
                    <div className="mt-2">
                      <label className="cursor-pointer bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm inline-flex items-center">
                        <FiUpload className="mr-1" size={14} />
                        {item.image ? 'Change Image' : 'Upload Image'}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePortfolioImageUpload(e, item.id)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                  placeholder="Project title"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <textarea
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, description: e.target.value})}
                  placeholder="Project description (shown to clients)"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="2"
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
                  disabled={!newPortfolioItem.title || !newPortfolioItem.url}
                  className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center justify-center disabled:opacity-50"
                >
                  <FiPlus className="mr-2" /> Add Portfolio Item
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">About</h3>
                  <p className="whitespace-pre-line">{formData.bio || 'No bio added yet'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
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

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Hourly Rate</h3>
                  <p>{formData.hourlyRate ? `$${formData.hourlyRate}/hr` : 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Portfolio</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.portfolio.length > 0 ? (
                  formData.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-gray-600 text-sm my-2">{item.description}</p>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 text-sm hover:underline"
                        >
                          View Project
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No portfolio items added yet</p>
                )}
              </div>
            </div>

            {/* Ratings Section (Visible in Client View) */}
            {isClientView && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Client Reviews</h3>
                
                {formData.ratings?.length > 0 ? (
                  <div className="space-y-4">
                    {formData.ratings.map((rating, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <StarRating value={rating.value} />
                          <span className="text-gray-500 text-sm ml-2">
                            {new Date(rating.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">{rating.comment}</p>
                        <p className="text-sm text-gray-500 mt-1">- {rating.clientName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet</p>
                )}

                {/* Review Form */}
                {currentUser && !hasReviewed && (
                  <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-medium mb-3">Leave a Review</h4>
                    <div className="mb-3">
                      <StarRating 
                        value={newReview.rating} 
                        editable={true} 
                        onChange={(rating) => setNewReview({...newReview, rating})} 
                      />
                    </div>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded mb-3"
                      rows="3"
                      placeholder="Share your experience working with this freelancer..."
                    />
                    <button
                      onClick={submitReview}
                      disabled={!newReview.rating || !newReview.comment}
                      className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;