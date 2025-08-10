import { useState } from 'react';
import { FiStar, FiMessageCircle, FiBriefcase, FiDollarSign, FiCheck } from 'react-icons/fi';
import axios from 'axios';

const FreelancerCard = ({ freelancer, onHire, currentUser }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isHired, setIsHired] = useState(freelancer.hiredBy?.includes(currentUser?.name));

  const submitRating = async () => {
    try {
      await axios.post('http://localhost:5000/api/ratings', {
        freelancerName: freelancer.name,
        clientName: currentUser.name,
        rating,
        comment
      });
      setComment('');
      setIsHired(true);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const handleHire = async () => {
    if (!isHired) {
      try {
        await axios.post('http://localhost:5000/api/freelancers/hire', {
          freelancerName: freelancer.name,
          clientName: currentUser.name
        });
        setIsHired(true);
        if (onHire) onHire(freelancer.name);
      } catch (err) {
        console.error('Error hiring freelancer:', err);
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition duration-300 w-full max-w-md mx-auto">
      {/* Header with Fixed Image */}
      <div className="relative h-48 bg-gray-200">
        {freelancer.profileImage ? (
          <img 
            src={freelancer.profileImage} 
            alt={freelancer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full shadow flex items-center">
          <FiStar className="text-yellow-500 mr-1" />
          <span className="font-medium">{freelancer.rating?.toFixed(1) || 'New'}</span>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{freelancer.name}</h3>
        
        <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
          <span className="flex items-center mr-3">
            <FiBriefcase className="mr-1" />
            {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : 'Rate not specified'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{freelancer.bio || 'No bio provided'}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {freelancer.skills?.slice(0, 4).map((skill, index) => (
            <span key={index} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>

        {/* Rating Section */}
        <div className="p-4 border-t">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <button
                  key={index}
                  className={`text-2xl ${ratingValue <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              );
            })}
          </div>

          {/* Comment Input */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your review..."
            className="w-full p-2 border rounded mb-2"
            rows="2"
          />
          <button
            onClick={submitRating}
            disabled={!rating}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Submit Review
          </button>
        </div>

        {/* Hire Button */}
        <div className="p-4">
          <button
            onClick={handleHire}
            disabled={isHired}
            className={`w-full py-2 rounded flex items-center justify-center ${
              isHired 
                ? 'bg-green-100 text-green-800'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isHired ? (
              <>
                <FiCheck className="mr-2" />
                Hired
              </>
            ) : (
              'Hire Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerCard;