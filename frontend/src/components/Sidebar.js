// Sidebar.js
import React, { useEffect, useState } from 'react';

const Sidebar = ({ sidebarContent }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderPointLabel = (header, topLabel, bottomLabel1, bottomLabel2) => (
    <div className="point">
{/* <      <div className="point-header">{header}</div> New Header */}      
      <div className="point-label above">{topLabel}</div>
      <div className="point-circle"></div>
      <div className="point-label below">
        {bottomLabel1 === bottomLabel2 ? (
          <span>{bottomLabel1}</span>
        ) : (
          <>
            {bottomLabel1} <br /> Today: {bottomLabel2}
          </>
        )}
      </div>
    </div>
  );
  

  const renderDetails = () => {
    if (typeof sidebarContent === 'string') {
      return <p>{sidebarContent}</p>;
    }
  
    return (
      <div>
        <h2>{sidebarContent.name_short}</h2>
        <p><strong>Full name:</strong> {sidebarContent.name}</p>
        <p><strong>Relation:</strong> {sidebarContent.relation}</p>
        <p><strong>Gender:</strong> {sidebarContent.gender}</p>
        <h2 className="timeline">Birth and Migration Decades</h2>
        
        {/* Line Segment Section */}
        <div className="line-segment">
          {/* Point A - Birth */}
          {renderPointLabel(
            "Birth Decade",
            sidebarContent.birth_decade,
            sidebarContent.birth_loc,
            sidebarContent.birth_modern
          )}
  
          {/* Line */}
          <div className="line"></div>
  
          {/* Point B - Migration */}
          {renderPointLabel(
            "Migration Decade",
            sidebarContent.migrate_decade,
            sidebarContent.destination,
            sidebarContent.destination_modern
          )}
        </div>
        <p> </p>
        <p><strong>Primary Language Spoken in Childhood:</strong> {sidebarContent.primary_lang}</p>
        <p><strong>Other Languages Spoken:</strong> {sidebarContent.other_lang}</p>
        <p><strong>Jewish?:</strong> {sidebarContent.jewish_yn}</p>
        <p><strong>Migrated?:</strong> {sidebarContent.migrate_yn}</p>
        <p><strong>Other Info:</strong> {sidebarContent.other_info}</p>
      </div>
    );
  };

  return (
    <div className={`sidebar ${isMobile ? 'mobile-sidebar' : 'desktop-sidebar'}`}>
      <h3>Ancestor Details</h3>
      {sidebarContent ? renderDetails() : <p>Click on a point to show details</p>}
    </div>
  );
};

export default Sidebar;
