import React, { useState } from 'react';
import './MapComponent.css'; // Import the stylesheet

const Legend = ({ 
  colorMapping, 
  handleLanguageSelect, 
  resetLanguageFilter, 
  resetLanguageSelection 
}) => {
  const [hoveredLanguage, setHoveredLanguage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleMouseEnter = (language) => {
    setHoveredLanguage(language);
  };

  const handleMouseLeave = () => {
    setHoveredLanguage(null);
  };

  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
    handleLanguageSelect(language); // Trigger the parent handler
  };

  const handleShowAllClick = () => {
    setSelectedLanguage(null); // Explicitly set to null to reset
    resetLanguageFilter(); // Reset the selected language when "Show All" is clicked
  };

  const handleDropdownChange = (event) => {
    const selectedLang = event.target.value;
    setSelectedLanguage(selectedLang);
    if (selectedLang === "All") {
      resetLanguageFilter();
    } else {
      handleLanguageSelect(selectedLang);
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      {/* Logo and Title Section */}
      <div className="legend-header">
        <div className="legend-logo">
          <img src="/jlp-huc-logo.jpg" alt="Logo" />
        </div>
        <div className="legend-title">
          <h1>Mapping Jewish Ancestry and Migrations</h1>
          <h2>Explore languages spoken by Jewish ancestors and their migration paths.</h2>
        </div>
      </div>
  
      {/* Legend Section */}
      <div className="legend-box">
        <h4>Primary Languages Spoken</h4>
        {isMobile ? (
          <div className="dropdown-row">
            {/* Dropdown for mobile */}
            <select 
              className="legend-dropdown" 
              value={selectedLanguage || "All"} 
              onChange={handleDropdownChange}
            >
              <option value="All">Show All Languages</option>
              {Object.entries(colorMapping).map(([lang]) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            {/* Show All Button for mobile */}
            <button 
              className="show-all-button" 
              onClick={handleShowAllClick}
            >
              Show All
            </button>
          </div>
        ) : (
          <>
            {/* List of languages for desktop */}
            {Object.entries(colorMapping).map(([lang, color]) => (
              <div 
                key={lang} 
                className={`legend-item ${hoveredLanguage === lang ? 'hovered' : ''} ${
                  selectedLanguage === lang || selectedLanguage === 'All' ? 'selected' : ''
                }`}
                onClick={() => handleLanguageClick(lang)}
                onMouseEnter={() => handleMouseEnter(lang)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="legend-color" style={{ backgroundColor: color }}></div>
                <span>{lang}</span>
              </div>
            ))}
  
            {/* Show All Button for desktop */}
            <button 
              className={`show-all-button ${selectedLanguage === 'All' ? 'active' : ''}`} 
              onClick={handleShowAllClick}
            >
              Show all languages for selected time period
            </button>
          </>
        )}
        
        {/* Link Button */}
        <button 
          className="button-link"
          onClick={() => window.open('https://www.jls.org/languages', '_blank')} 
        >
          Explore All Jewish Languages
        </button>
      </div>
    </div>
  );
};

export default Legend;
