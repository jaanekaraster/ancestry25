import React, { useState, useEffect } from "react";
import './MapComponent.css'; // Import the stylesheet

const TimelineSlider = ({ birthDecades, onDecadeChange }) => {
  const [sortedDecades, setSortedDecades] = useState([]);
  const [selectedDecade, setSelectedDecade] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Sort the birthDecades array
    const sorted = birthDecades
      .filter((decade) => decade !== 'Unknown') // Remove 'Unknown'
      .sort((a, b) => {
        if (a === 'Before 1850') return -1; // Ensure 'Before 1850' is at the top
        if (b === 'Before 1850') return 1;
        return a.localeCompare(b); // Sort other decades alphabetically
      });

    setSortedDecades(['All', ...sorted]); // Add 'All' at the beginning
    setSelectedDecade('All'); // Set default selected decade
  }, [birthDecades]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Listen to window resize and orientation change
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const handleSliderChange = (event) => {
    const index = parseInt(event.target.value, 10);
    const decade = sortedDecades[index];
    setSelectedDecade(decade);
    setCurrentIndex(index);
    onDecadeChange(decade); // Notify parent component
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedDecade(sortedDecades[newIndex]);
      onDecadeChange(sortedDecades[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedDecades.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedDecade(sortedDecades[newIndex]);
      onDecadeChange(sortedDecades[newIndex]);
    }
  };

  return (
    <div className="timeline-slider-container">
      {/* For mobile, use arrows */}
      {isMobile ? (
        <div className="timeline-arrows">
          <button
            className="arrow-button left"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            &#8592;
          </button>
          <span className="timeline-text">{selectedDecade}</span>
          <button
            className="arrow-button right"
            onClick={handleNext}
            disabled={currentIndex === sortedDecades.length - 1}
          >
            &#8594;
          </button>
        </div>
      ) : (
        /* For laptop size and larger, keep the timeline slider */
        <div className="slider-wrapper">
          <input
            type="range"
            className="timeline-slider"
            min="0"
            max={sortedDecades.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
          />
          <div className="tick-marks">
            {sortedDecades.map((decade, index) => (
              <div
                key={index}
                className={`tick ${selectedDecade === decade ? "active" : ""}`}
                style={{ left: `${(index / (sortedDecades.length - 1)) * 100}%` }}
              >
                <span className="tick-label">{decade}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineSlider;
