import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = 'md',
  className = '',
}) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentDisplay = hoverVal !== null ? hoverVal : value;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= currentDisplay;

        return (
          <motion.button
            key={i}
            type="button"
            disabled={readOnly}
            whileHover={!readOnly ? { scale: 1.25, rotate: 6 } : undefined}
            whileTap={!readOnly ? { scale: 0.85 } : undefined}
            onClick={() => !readOnly && onChange && onChange(starIndex)}
            onMouseEnter={() => !readOnly && setHoverVal(starIndex)}
            onMouseLeave={() => !readOnly && setHoverVal(null)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} p-0.5 focus:outline-none`}
            aria-label={`Rate ${starIndex} out of ${max}`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? 'fill-[#FFB800] text-[#FFB800]'
                  : 'text-border-strong fill-transparent'
              } transition-colors`}
              strokeWidth={1.75}
            />
          </motion.button>
        );
      })}
    </div>
  );
};
