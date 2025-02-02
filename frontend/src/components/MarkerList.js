import React from 'react';

const MarkerList = ({ markerData, selectedNames, toggleNameSelection, setSelectedNames }) => (
  <div>
    <h4>Select Ancestor Names</h4>
    <button onClick={() => setSelectedNames([])}>Show All</button>
    <ul>
      {markerData.map((marker) => (
        <li key={marker.Name_Short}>
          <label>
            <input
              type="checkbox"
              checked={selectedNames.includes(marker.Name_Short)}
              onChange={() => toggleNameSelection(marker.Name_Short)}
            />
            {marker.Name_Short}
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default MarkerList;
