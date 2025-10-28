/**
 * Star Rating Component
 * 
 * Displays star ratings with support for half-stars (0.5-5.0 scale).
 * Can be used in display-only mode or interactive mode for user input.
 * 
 * Features:
 * - Half-star precision (0.5, 1.0, 1.5, 2.0, etc.)
 * - Interactive mode with click zones for full and half stars
 * - Hover preview in interactive mode
 * - Multiple sizes (sm, md, lg)
 * - Optional numeric display
 */
import React from 'react';
import { Star } from 'lucide-react';

/**
 * @param {number} rating - Current rating value (0-5)
 * @param {Function} onRatingChange - Callback when rating changes (interactive mode only)
 * @param {boolean} interactive - Enable click/hover interactions
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} showNumber - Display numeric rating next to stars
 */
const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  interactive = false,
  size = 'md',
  showNumber = false 
}) => {
  const [hoveredRating, setHoveredRating] = React.useState(0);
  
  // Size classes for different star sizes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const starSize = sizeClasses[size] || sizeClasses.md;
  
  /**
   * Calculate how much of each star should be filled
   * @param {number} starIndex - Index of the star (0-4)
   * @returns {string} 'full', 'half', or 'empty'
   */
  const getStarFill = (starIndex) => {
    const displayRating = interactive ? (hoveredRating || rating) : rating;
    const fillAmount = displayRating - starIndex;
    
    if (fillAmount >= 1) return 'full';
    if (fillAmount >= 0.5) return 'half';
    return 'empty';
  };
  
  /**
   * Handle star click for rating input
   * @param {number} starIndex - Index of clicked star
   * @param {boolean} isHalf - Whether left half was clicked
   */
  const handleStarClick = (starIndex, isHalf) => {
    if (!interactive || !onRatingChange) return;
    const newRating = starIndex + (isHalf ? 0.5 : 1);
    onRatingChange(newRating);
  };
  
  /**
   * Handle star hover for preview
   * @param {number} starIndex - Index of hovered star
   * @param {boolean} isHalf - Whether left half is hovered
   */
  const handleStarHover = (starIndex, isHalf) => {
    if (!interactive) return;
    const hoverValue = starIndex + (isHalf ? 0.5 : 1);
    setHoveredRating(hoverValue);
  };
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const fillType = getStarFill(starIndex);
        
        if (interactive) {
          // Interactive star with half-star click zones
          return (
            <div
              key={starIndex}
              className="relative inline-block"
              onMouseLeave={() => interactive && setHoveredRating(0)}
            >
              {/* Star visual */}
              <div className="relative pointer-events-none">
                {fillType === 'half' ? (
                  <>
                    {/* Empty star background */}
                    <Star className={`${starSize} text-gray-300`} />
                    {/* Half-filled star overlay */}
                    <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                      <Star className={`${starSize} text-yellow-400 fill-current`} />
                    </div>
                  </>
                ) : (
                  <Star
                    className={`${starSize} ${
                      fillType === 'full'
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                )}
              </div>
              
              {/* Invisible click zones */}
              <div className="absolute inset-0 flex">
                {/* Left half */}
                <button
                  onClick={() => handleStarClick(starIndex, true)}
                  onMouseEnter={() => handleStarHover(starIndex, true)}
                  className="w-1/2 h-full cursor-pointer focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label={`Rate ${starIndex + 0.5} stars`}
                />
                {/* Right half */}
                <button
                  onClick={() => handleStarClick(starIndex, false)}
                  onMouseEnter={() => handleStarHover(starIndex, false)}
                  className="w-1/2 h-full cursor-pointer focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  aria-label={`Rate ${starIndex + 1} stars`}
                />
              </div>
            </div>
          );
        } else {
          // Display-only star
          return (
            <div key={starIndex} className="relative inline-block">
              {fillType === 'half' ? (
                <>
                  {/* Empty star background */}
                  <Star className={`${starSize} text-gray-300`} />
                  {/* Half-filled star overlay */}
                  <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${starSize} text-yellow-400 fill-current`} />
                  </div>
                </>
              ) : (
                <Star
                  className={`${starSize} ${
                    fillType === 'full'
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              )}
            </div>
          );
        }
      })}
      
      {showNumber && (
        <span className="ml-1 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

