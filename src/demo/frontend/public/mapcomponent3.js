import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, LayersControl } from 'react-leaflet';
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';

// Function to create a color mapping based on unique languages
const createColorMapping = (uniqueLangs) => {
  const colors = d3.schemeCategory10; // Use D3's color palette
  return uniqueLangs.reduce((acc, language, index) => {
    acc[language] = colors[index % colors.length]; // Loop through colors
    return acc;
  }, {});
};

// Style function for GeoJSON features
const styleFunction = () => ({
  fillColor: '#f0dbc5', // Light brown color for fill
  color: '#b0906d', // Dark brown color for borders
  weight: 1,
  fillOpacity: 0.1,
});

// Style function for GeoJSON migration lines features
const styleFunctionLine = () => ({
  fillColor: '#f0dbc5', // Light brown color for fill
  color: '#909090', // Dark brown color for borders
  weight: 1,
  fillOpacity: 0.1,
});

const MapComponent = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [markerData, setMarkerData] = useState([]);
  const [colorMapping, setColorMapping] = useState({});
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [geoJsonDataLines, setGeoJsonDataLines] = useState(null);
  const [selectedNames, setSelectedNames] = useState([]); // State to track selected names
  const [highlightedLine, setHighlightedLine] = useState(null); // Track which line to highlight
  const [basemap, setBasemap] = useState('light');
  const [isBordersVisible, setIsBordersVisible] = useState(true);
  const [isMigrationLinesVisible, setIsMigrationLinesVisible] = useState(true);
  const handleBasemapChange = (value) => setBasemap(value);
  const [selectedPoint, setSelectedPoint] = useState(null); // Track the selected point


  // Load data from CSV file on component mount
  useEffect(() => {
    // Load marker data
    //d3.csv('/data/Ancestry_82824_Formatted_geocoded_classroom1_edited_with_languages_2.csv').then((data) => {
    d3.csv('/data/jlp_combined_demo.csv').then((data) => {

      const uniqueLangs = [...new Set(data.map((marker) => marker.lang2))];
      const initialColorMapping = createColorMapping(uniqueLangs);
      setColorMapping(initialColorMapping);
      setMarkerData(data);
    }).catch((error) => {
      console.error('Error loading CSV data:', error);
    });

    // Load GeoJSON data
    d3.json('/data/cntry1880.geojson').then((data) => {
      setGeoJsonData(data);
    }).catch((error) => {
      console.error('Error loading GeoJSON data:', error);
    });

    // Load migration lines
    d3.json('/data/jlp_classroom1_lines.geojson').then((data) => {
      setGeoJsonDataLines(data);
    }).catch((error) => {
      console.error('Error loading GeoJSON lines:', error);
    });
  }, []);

  // Toggle name selection in the list
  const toggleNameSelection = (name) => {
    setSelectedNames((prevSelected) =>
      prevSelected.includes(name)
        ? prevSelected.filter((item) => item !== name) // Deselect
        : [...prevSelected, name] // Select
    );
    // Highlight corresponding line when a single user is clicked
    setHighlightedLine(name);
  };

  // Handle map click to reset selection
  const handleMapClick = (event) => {
    console.log(event.latlng)
    console.log("map was clicked");
    setSelectedNames([]); // Reset selected names on map click
    setHighlightedLine(null); // Optionally, reset highlighted line as well
  };

  // Handle marker click to update the selected point
  const handleMarkerClick = (marker) => {
    console.log("marker was clicked");
    setSelectedPoint(marker); // Update selectedPoint with marker details
  };

  // Reset selected point if no marker is selected
  const resetSelectedPoint = () => {
    setSelectedPoint(null);
  };

  // Style function for the GeoJSON lines
const styleFunctionLine = (feature) => {
  const isSelected = selectedNames.includes(feature.properties.Name);
  return {
    color: isSelected ? '#FF0000' : '#909090', // Highlight with red if selected
    weight: isSelected ? 3 : 1, // Make the highlighted line thicker
    fillOpacity: 0.1,
  };
};

  // Function to filter markers based on the selected names
  const shouldShowMarker = (marker) => {
    if (selectedNames.length === 0) return true; // Show all if no specific name is selected
    return selectedNames.includes(marker.Name_Short);
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  // Add this on the eventHandlers for your GeoJSON layer to stop propagation on click
  const handleGeoJsonLayerClick = (event, feature) => {
    event.stopPropagation();  // Prevent the map click handler from being triggered
    toggleNameSelection(feature.properties.Name);
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MapContainer 
      center={[51.505, -0.09]} 
      zoom={3} 
      style={{ position: 'relative', height: '100vh'}}   // Set the minimum zoom level  
      minZoom={3} 
      zoomControl={false}
      onClick={handleMapClick} // Reset selection on map click
      >
  
      {/* Dynamic Basemap */}
      <TileLayer
        url={
          basemap === 'light'
            ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        }
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Borders Layer */}
      {isBordersVisible && geoJsonData && (
        <GeoJSON data={geoJsonData} style={{ color: 'blue', weight: 2 }} />
      )}

      {/* Dynamic Migration Lines Layer */}
      {isMigrationLinesVisible && geoJsonDataLines && (
        <GeoJSON 
          data={geoJsonDataLines} 
          style={styleFunctionLine} 
          onEachFeature={(feature, layer) => {
            layer.on('click', () => {
              console.log("Selected feature:", feature.properties.Name);
              toggleNameSelection(feature.properties.Name);
            });
          }}
        />
      )}

      {/* Dynamic Migration Lines Layer */}
      {isMigrationLinesVisible && geoJsonDataLines && (
        <GeoJSON 
          data={geoJsonDataLines} 
          style={styleFunctionLine} 
          onEachFeature={(feature, layer) => {
            layer.on('click', () => {
              console.log("Selected feature:", feature.properties.Name);
              toggleNameSelection(feature.properties.Name);
            });
          }}
        />
      )}


      {/* Custom Layers Control */}
      <CustomLayersControl
        onToggleBorders={() => setIsBordersVisible(!isBordersVisible)}
        onToggleMigrationLines={() => setIsMigrationLinesVisible(!isMigrationLinesVisible)}
        isBordersVisible={isBordersVisible}
        isMigrationLinesVisible={isMigrationLinesVisible}
        onBasemapChange={handleBasemapChange}
      />


    <Legend 
      colorMapping={colorMapping}
      selectedFilter={selectedFilter}
      handleFilterChange={handleFilterChange}
    />

    <Sidebar 
      sidebarContent={
        selectedPoint ? (
          <div>
            <b>Name:</b> {selectedPoint.Name}<br />
            <b>Relation:</b> {selectedPoint.Relation}<br />
            <b>Gender:</b> {selectedPoint.Gender}<br />
            <b>Birth Decade:</b> {selectedPoint['Birth Decade']}<br />
            <b>Birth Country:</b> {selectedPoint['Birth Country']}<br />
          </div>
        ) : null // Default handled by Sidebar.js
      }
    />


        {/* <LayersControl position="topright">
          
          <LayersControl.BaseLayer checked name="Basemap">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </LayersControl.BaseLayer> */}

          {/* Add GeoJSON Layer below CircleMarkers */}
          {/* <LayersControl.Overlay name="Borders 1880" checked>
            {geoJsonData && (
              <GeoJSON data={geoJsonData} style={styleFunction} />
            )}
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Migration Lines" checked>
            {geoJsonDataLines && (
              <GeoJSON data={geoJsonDataLines} style={styleFunctionLine} />
            )}
          </LayersControl.Overlay>
        </LayersControl> */}
   
        {/* Other layers */}
        {geoJsonDataLines && (
          <GeoJSON 
            data={geoJsonDataLines} 
            style={styleFunctionLine} 
            onEachFeature={(feature, layer) => {
              layer.on('click', (event) => handleGeoJsonLayerClick(event, feature));
            }}
          />
        )}

        {/* Add CircleMarkers after GeoJSON Layer to ensure they are on top */}
        {markerData
          .filter((marker) => shouldShowMarker(marker))
          .map((marker, index) => {
            const lat = parseFloat(marker.Birth_City_Lat);
            const lon = parseFloat(marker.Birth_City_Lon);
            const color = colorMapping[marker.lang2] || '#808080';

            if (isNaN(lat) || isNaN(lon)) {
              console.warn(`Invalid coordinates for marker ${index}:`, marker);
              return null;
            }

            const shouldShowMarker = selectedFilter === 'all' || marker.lang2 === selectedFilter;

            return shouldShowMarker ? (
              <CircleMarker
                key={index}
                center={[lat, lon]}
                radius={5}
                fillColor={color}
                color={color}
                fillOpacity={0.8}
                style={{ zIndex: 1000 }}  // Ensuring CircleMarkers are on top
                eventHandlers={{
                  click: () => handleMarkerClick(marker), // Update selectedPoint on click
                }}
              >
                <Popup>
                <div>                  
                  <h2>{marker.Name_Short}</h2><br />
                  <b>Name:</b> {marker.Name}<br />
                  <b>Relation1:</b> {marker.Relation}<br />
                  <b>Gender:</b> {marker.Gender}<br />
                  <b>Birth Decade:</b> {marker['Birth Decade']}<br />
                  <b>Birth Country:</b> {marker['Birth Country']}<br />
                  <b>Birth Country Detail:</b> {marker['Birth Country Other Info']}<br />
                  <b>Birth City:</b> {marker['Birth City Formatted']}<br />
                  <b>Primary Language Spoken in Childhood:</b> {marker.lang2}<br />
                  <b>Other Spoken Languages:</b> {marker['Other Spoken Languages']}<br />
                  <b>Jewish?</b> {marker['Was ancestor Jewish?']}<br />
                  <b>Migrated?</b> {marker['Did the ancestor migrate?']}<br />
                  <b>Decade Migrated:</b> {marker['Decade Migrated']}<br />
                  <b>Destination Country:</b> {marker['Destination Country']}<br />
                  <b>Destination City:</b> {marker['Destination City Formatted']}<br />
                </div>
              </Popup>
              </CircleMarker>
            ) : null;
          })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
