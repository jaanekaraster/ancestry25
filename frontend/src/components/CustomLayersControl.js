import React from "react";
import "./MapComponent.css"; // Import the stylesheet
import TimelineSlider from "./TimelineSlider.js";
import ToggleLayerControl from "./ToggleLayerControl.js";

const CustomLayersControl = ({
  onToggleBorders1880,
  isBordersVisible1880,
  onToggleBorders1945,
  isBordersVisible1945,

  onToggleMigrationLines,
  isMigrationLinesVisible,
  
  onBasemapChange,
  birthDecades,
  onDecadeChange,
}) => {
  return (
    <div className="layer-controls-container">
      {/* Migration Lines Toggle Row */}
      <div className="layer-controls-row">
        <ToggleLayerControl
          label="Show Migration Lines"
          isChecked={isMigrationLinesVisible}
          onToggle={onToggleMigrationLines}
        />
      </div>

      {/* Timeline Slider Row */}
      <div className="layer-controls-row">
        <TimelineSlider birthDecades={birthDecades} onDecadeChange={onDecadeChange} />
      </div>
    </div>
  );
};

export default CustomLayersControl;
