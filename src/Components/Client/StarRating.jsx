import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ value = 0, editable = false, onChange = () => {}, size = 20 }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={i} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => editable && onChange(ratingValue)}
              className="hidden"
            />
            <FiStar
              className={`${editable ? 'hover:scale-110 transition' : ''}`}
              size={size}
              color={ratingValue <= (hover || value) ? '#f59e0b' : '#d1d5db'}
              onMouseEnter={() => editable && setHover(ratingValue)}
              onMouseLeave={() => editable && setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;