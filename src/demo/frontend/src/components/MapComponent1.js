import React, { useRef, useState, useEffect } from 'react';

import { MapContainer, TileLayer, GeoJSON, LayersControl, CircleMarker, Popup } from 'react-leaflet';
import * as d3 from 'd3';
import * as wkt from 'wkt'; // Ensure you install a WKT parser library

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';
import Legend from './Legend';
import TimelineSlider from './TimelineSlider'; // Import TimelineSlider

import CustomLayersControl from './CustomLayersControl';
import MarkerList from './MarkerList';
import MarkerClusterGroup from 'react-leaflet-markercluster';

/////////////////// Create the color mapping ///////////////////////////////
// Function to create a color mapping based on unique languages
const createColorMapping = (uniqueLangs) => {
  const customColors = [
    '#2f4f4f', '#34A3D2FF', '#191970', '#DDDCDCFF', '#991616FF',
    '#ffa500', '#ffff00', '#0000cd', '#00ff00', '#00bfff',
    '#00fa9a', '#D10ED1FF', '#ff1493', '#dda0dd', '#20B2AA',
    '#006400', '#A9A9A9', '#BDB76B', '#FF1493', '#C71585'
  ];

  const colors = d3.scaleOrdinal(customColors);

  return uniqueLangs.reduce((acc, language, index) => {
    acc[language] = colors(index % customColors.length); // Loop through colors
    return acc;
  }, {});
};

// Function to generate color based on the index of each segment in the line
const getColorAtPoint = (index, totalPoints) => {
  const startColor = [169,169,169]; // Red
  const endColor = [0, 255, 0];   // Green

  // Calculate interpolation ratio (position along the line)
  const ratio = index / totalPoints;

  // Interpolate RGB values
  const red = Math.round(startColor[0] * (1 - ratio) + endColor[0] * ratio);
  const green = Math.round(startColor[1] * (1 - ratio) + endColor[1] * ratio);
  const blue = Math.round(startColor[2] * (1 - ratio) + endColor[2] * ratio);

  return `rgb(${red}, ${green}, ${blue})`;
};

// Function to break the line into segments and apply color gradient
const applyGradientToLine = (latlngs) => {
  const totalPoints = latlngs.length;
  return latlngs.map((latlng, index) => ({
    latlng,
    color: getColorAtPoint(index, totalPoints),
  }));
};



const BordersLayer = ({ isVisible, data, styleFunction }) => {
  return isVisible && data ? <GeoJSON data={data} style={styleFunction} /> : null;
};

//////////////////// Render Map Component //////////////////////////////////
const MapComponent = () => {
  //////// Persist these items between map renders //////////////
  const mapRef = useRef(null);
  const cursorRef = useRef(null);
  const popupRef = useRef(null);
  const isMountedRef = useRef(true);

  //state for geojson data
  const [geoData1850, setGeoData1850] = useState(null);
  const [geoData1880, setGeoData1880] = useState(null);
  const [geoData1900, setGeoData1900] = useState(null);
  const [geoData1914, setGeoData1914] = useState(null);
  const [geoData1920, setGeoData1920] = useState(null);
  const [geoData1938, setGeoData1938] = useState(null);
  const [geoData1945, setGeoData1945] = useState(null);
  const [geoData1950, setGeoData1950] = useState(null);
  const [geoData1960, setGeoData1960] = useState(null);
  const [geoData1970, setGeoData1970] = useState(null);

  const [geoData1994, setGeoData1994] = useState(null); 

  //state for visibility toggles
  const [isBordersVisible1850, setIsBordersVisible1850] = useState(false);
  const [isBordersVisible1880, setIsBordersVisible1880] = useState(false);
  const [isBordersVisible1900, setIsBordersVisible1900] = useState(false);
  const [isBordersVisible1914, setIsBordersVisible1914] = useState(false);
  const [isBordersVisible1920, setIsBordersVisible1920] = useState(false);
  const [isBordersVisible1938, setIsBordersVisible1938] = useState(false);
  const [isBordersVisible1945, setIsBordersVisible1945] = useState(false);
  const [isBordersVisible1950, setIsBordersVisible1950] = useState(false);
  const [isBordersVisible1960, setIsBordersVisible1960] = useState(false);
  const [isBordersVisible1970, setIsBordersVisible1970] = useState(false);


  const [isBordersVisible1994, setIsBordersVisible1994] = useState(false);

  //////// Define the state variables ///////////////////////////
  // const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedDecadeFilter, setSelectedDecadeFilter] = useState('All');  // Track the selected decade filter
  const [markerData, setMarkerData] = useState([]); // State to store marker data
  const [updatedFilteredMarkers, setUpdatedFilteredMarkers] = useState([]);
  const [dynamicColorMapping, setDynamicColorMapping] = useState({}); // State to store dynamic color mapping

  // Track map marker state
  const [mapMarkers, setMapMarkers] = useState([]);

  // Track GeoJSON data
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [geoJsonDataLines, setGeoJsonDataLines] = useState(null);
  // State for changing the key of the GeoJSON layer to trigger re-render
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  // Track layer variables
  const [basemap, setBasemap] = useState('light'); // State to store the selected basemap
  const [isMigrationLinesVisible, setIsMigrationLinesVisible] = useState(true); // State to store migration line visibility
  const handleBasemapChange = (value) => setBasemap(value); // Basemap style
  
 // Function to handle migration lines visibility toggle
const handleToggleMigrationLines = () => {
  setIsMigrationLinesVisible(prev => !prev); // Toggle visibility
};

  const [sidebarContent, setSidebarContent] = useState("Click on a point to show details"); // Sidebar content defaults
  const [ancestryLinesLayer, setAncestryLinesLayer] = useState('');  
  
  const [selectedBirthDecades, setBirthDecades] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('All'); // Track selected decade
  const [filteredLines, setFilteredLines] = useState(''); // Track filtered lines
  const [selectedLanguage, setSelectedLanguage] = useState('All'); // Track selected language
  
  const [filteredMarkers, setFilteredMarkers] = useState(markerData); // Track filtered markers
  const [inactiveLanguages, setInactiveLanguages] = useState([]); // Track inactive languages
  const [updatedData, setUpdatedData] = useState([]);
  const [dataByDecade, setDataByDecade] = useState({});


  // Track selection variables
  const [selectedPoint, setSelectedPoint] = useState(null); // Track the selected point
  const [selectedNames, setSelectedNames] = useState([]); // State to track selected names
  const [selectedSidebarFilter, setSelectedSidebarFilter] = useState('');  // Sidebar filter when an item is clicked
  const [highlightedLine, setHighlightedLine] = useState(null); // Track which line to highlight
  const [clickedLineIndex, setClickedLineIndex] = useState(null); // Track the clicked line index
  const [activeMarker, setActiveMarker] = useState(null); // Keep track of the currently active marker
  const [hoveredFeature, setHoveredFeature] = useState(null);

   // Extract unique birthDecades from the updated data
   const uniqueBirthDecades = [...new Set(updatedData.map((marker) => marker.birthDecade))];
   console.log("Unique Birth Decades:", uniqueBirthDecades);

 
   // Handle decade change to filter lines based on the selected decade
const handleDecadeChange = (decade) => {
  setSelectedDecade(decade);
  console.log("Selected Decade:", decade);
};

const refreshMigrationLines = () => {
  // Un-toggle migration lines (set to false)
  setIsMigrationLinesVisible(false);

  // Force a brief delay and re-toggle the lines (set back to true)
  setTimeout(() => {
    setIsMigrationLinesVisible(true);
  }, 100); // Small delay to ensure the layer is removed before being re-added
};


const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang); // Update selected language directly
    console.log("Selected Language from Legend:", lang);
  
    // Filter markers and lines using both selected language and selected decade
    filterMarkers(selectedDecade, lang);
};

const resetLanguageFilter = () => {
    setSelectedLanguage('All'); // Reset the language filter
    console.log("reset language filter to all");
    filterMarkers(selectedDecade, 'All'); // Show all languages for the selected decade
    resetLanguageSelection(); // Reset the selected language in Legend
};

const resetLanguageSelection = () => {
    setSelectedLanguage('All'); // Reset the selected language in Legend
    console.log("Selected language has been reset"); // Confirm reset
};

// This function filters markers and lines by both decade and language
const filterMarkers = (decade, language) => {
    console.log("Current Decade:", decade);
    console.log("Current Language:", language);

    let updatedFilteredMarkers = markerData;

    // Case 1: Filter by selected decade if it's not 'All'
    if (decade && decade !== 'All') {
        updatedFilteredMarkers = updatedFilteredMarkers.filter(
            (marker) => marker.birthDecade === decade
        );
    }

    // Case 2: Filter by selected language if it's not 'All'
    if (language && language !== 'All') {
        updatedFilteredMarkers = updatedFilteredMarkers.filter(
            (marker) => marker.lang2 === language
        );
    }

    // Update the filtered markers state
    setFilteredMarkers(updatedFilteredMarkers);
    console.log("Filtered Markers Count:", updatedFilteredMarkers.length);
    console.log("Filtered Markers Data:", updatedFilteredMarkers);

    // Now filter migration lines by both selected decade & language
    const filteredLines = updatedFilteredMarkers
        .filter((marker) => marker.greatCircleLine) // Ensure it has a valid line
        .map((marker) => ({
            ...marker,
            greatCircleLine: marker.greatCircleLine,
        }));

    // Update GeoJSON lines for the map
    setGeoJsonDataLines({
        type: "FeatureCollection",
        features: filteredLines,
    });

    setFilteredLines(filteredLines); // Make sure this state exists
};


  ////////////////////// Load data from CSV and GeoJSON files ///////////////////////
  useEffect(() => {
    fetch('http://localhost:5000/download-csv')
    .then((response) => response.text())
      .then((data) => {
        const parsedData = d3.csvParse(data); // `d3.csvParse` converts CSV text to an array of objects
        const updatedData = parsedData.map((d) => ({
          ...d,
          lat: parseFloat(d.Birth_City_Lat),
          lon: parseFloat(d.Birth_City_Lon),
          language: d.lang2,
          birthDecade: d["Birth Decade"], // Map birthDecade field here
          greatCircleLine: d.great_circle_line // Assuming the column contains a valid GeoJSON line (LineString or MultiLineString)
            ? wkt.parse(d.great_circle_line)
            : null,
        }));
        // Assign language and color mapping to each map marker
        const uniqueLangs = [...new Set(updatedData.map((marker) => marker.lang2))];
        // Extract unique birthDecades
        const uniqueBirthDecades = [...new Set(updatedData.map((marker) => marker.birthDecade))];
        console.log("Unique Birth Decades:", uniqueBirthDecades);
        setBirthDecades(uniqueBirthDecades); // store the unique birthDecade values

        // Get color mapping for languages
        const colorMapping = createColorMapping(uniqueLangs);
        setDynamicColorMapping(colorMapping);  // Set dynamic color mapping here
        setMarkerData(updatedData);
        setUpdatedData(updatedData); // Update updatedData state

        ///////////////////////////////////////////
        // Create an object where keys are decades, and values are filtered data
      const dataByDecade = {};
      uniqueBirthDecades.forEach((decade) => {
        dataByDecade[decade] = updatedData.filter((d) => d.birthDecade === decade);
      });

      console.log("Data by Decade:", dataByDecade);
      
      // Store these subsets in state
      setDataByDecade(dataByDecade);
      /////////////////////////////

      })
      .catch((error) => console.error('Error loading CSV data:', error));

      const fetchGeoData = async () => {
        // Example: Fetching data from external or local sources
        const response1850 = await fetch('/data/cntry1815.geojson');
        const data1850 = await response1850.json();
        setGeoData1850(data1850);

        const response1880 = await fetch('/data/cntry1880.geojson');
        const data1880 = await response1880.json();
        setGeoData1880(data1880);

        const response1900 = await fetch('/data/cntry1900.geojson');
        const data1900 = await response1900.json();
        setGeoData1900(data1900);
  
        const response1945 = await fetch('/data/cntry1945.geojson');
        const data1945 = await response1945.json();
        setGeoData1945(data1945);

        const response1914 = await fetch('/data/cntry1914.geojson'); // reverting to older 1920 data because of overlap visualization issue
        const data1914 = await response1914.json();
        setGeoData1914(data1914);
      
        const response1920 = await fetch('/data/cntry1920.geojson'); // reverting to older 1920 data because of overlap visualization issue
        const data1920 = await response1920.json();
        setGeoData1920(data1920);
      
        const response1938 = await fetch('/data/cntry_1930.geojson');
        const data1938 = await response1938.json();
        setGeoData1938(data1938);
      
        const response1950 = await fetch('/data/cntry_1950.geojson');
        const data1950 = await response1950.json();
        setGeoData1950(data1950);

        const response1960 = await fetch('/data/cntry_1960.geojson');
        const data1960 = await response1960.json();
        setGeoData1960(data1960);

        const response1970 = await fetch('/data/cntry_1970.geojson');
        const data1970 = await response1970.json();
        setGeoData1970(data1970);

        const response1994 = await fetch('/data/cntry1994.geojson');
        const data1994 = await response1994.json();
        setGeoData1994(data1994);
      
      };

      fetchGeoData();

      // d3.json('/data/ancestry_12_2024_lines_break.geojson')
      // .then((data) => {
      //   setGeoJsonDataLines(data); // Store GeoJSON data for lines into state

      //   // Add GeoJSON lines to the map
      //   const ancestryLinesLayer = new L.GeoJSON(data, {
      //     style: {styleFunctionLine},
      //   }).addTo(mapRef.current);
  
      //   // Store the layer in a ref for later use
      //   setAncestryLinesLayer(ancestryLinesLayer);

      // })
      // .catch((error) => console.error('Error loading GeoJSON lines:', error));
        
    // d3.json('/data/jlp_classroom1_lines.geojson')
    //   .then((data) => setGeoJsonDataLines(data))
    //   .catch((error) => console.error('Error loading GeoJSON lines:', error));

  }, [mapRef]);

  ////////////////////////////// Marker behaviors /////////////////////////////////////////
  // Second useEffect: Filter markers based on selectedDecade
  useEffect(() => {
    filterMarkers(selectedDecade, selectedLanguage);
  }, [selectedDecade, selectedLanguage, markerData]);

// useEffect to handle filtered markers and migration lines
useEffect(() => {
  if (!filteredMarkers || filteredMarkers.length === 0) {
    console.warn("No filtered markers to render.");
    return;
  }

  // Render log for filtered markers
  console.log("Rendering filtered markers:", filteredMarkers);
  
  // Ensure lines are updated after markers are filtered
  const filteredLines = filteredMarkers
    .filter((marker) => marker.greatCircleLine) // Ensure it has a valid line
    .map((marker) => ({
      ...marker,
      greatCircleLine: marker.greatCircleLine,
    }));

  // Set filtered lines state
  setFilteredLines(filteredLines);

   // Update the key of the GeoJSON to force re-rendering
   setGeoJsonKey((prevKey) => prevKey + 1); // Increment the key to trigger re-render
  console.log("Rendering filtered migration lines:", filteredLines);

  return () => {
    // Cleanup logic here
    console.log("Cleaning up marker and line rendering.");
  };
}, [filteredMarkers]);  // Trigger only when filteredMarkers changes


// useEffect to handle rendering filtered migration lines
useEffect(() => {
  if (!filteredLines || filteredLines.length === 0) {
    console.warn("No filtered migration lines to render.");
    return;
  }

  // Log filtered migration lines
  console.log("Rendering filtered migration lines:", filteredLines);

  return () => {
    // Cleanup logic here (if needed)
    console.log("Cleaning up migration line rendering.");
  };
}, [filteredLines]);


// UseEffect to update migration lines whenever filteredLines or visibility changes
useEffect(() => {
  if (isMigrationLinesVisible && filteredLines.length > 0) {
    // Update GeoJSON layer with filtered lines when visibility is true
    setGeoJsonDataLines({
      type: "FeatureCollection",
      features: filteredLines,
    });
    console.log("Migration Lines Updated:", filteredLines);
  } else {
    console.log("Migration Lines are hidden or no lines available.");
  }
}, [filteredLines, isMigrationLinesVisible]);


useEffect(() => {
  // Call the refreshMigrationLines function when selectedDecade changes
  refreshMigrationLines();
}, [selectedDecade, selectedLanguage]); // This ensures the lines are refreshed when the decade changes

  useEffect(() => {
    const borderVisibility = {
      'Before 1850': { '1850': true },
      '1850s': { '1850': true },
      '1860s': { '1850': true },
      '1870s': { '1850': true },
      '1880s': { '1880': true },
      '1890s': { '1880': true },
      '1900s': { '1900': true },
      '1910s': { '1914': true },
      '1920s': { '1920': true },
      '1930s': { '1938': true },
      '1940s': { '1945': true },
      '1950s': { '1950': true },
      '1960s': { '1960': true },
      '1970s': { '1970': true },
    };
  
    const defaultVisibility = {
      '1850': false,
      '1880': false,
      '1900': false,
      '1914': false,
      '1920': false,
      '1938': false,
      '1945': false,
      '1950': false,
      '1960': false,
      '1970': false,

      '1994': false,
    };
  
    const visibility = { ...defaultVisibility, ...borderVisibility[selectedDecade] };
  
    setIsBordersVisible1850(visibility['1850']);
    setIsBordersVisible1880(visibility['1880']);
    setIsBordersVisible1900(visibility['1900']);
    setIsBordersVisible1914(visibility['1914']);
    setIsBordersVisible1920(visibility['1920']);
    setIsBordersVisible1938(visibility['1938']);
    setIsBordersVisible1945(visibility['1945']);
    setIsBordersVisible1950(visibility['1950']);
    setIsBordersVisible1960(visibility['1960']);
    setIsBordersVisible1970(visibility['1970']);

    setIsBordersVisible1994(visibility['1994']);
  }, [selectedDecade]);

  useEffect(() => {
    setSidebarContent("Click on a point to show details"); // Reset sidebar to default message
  }, [selectedDecade, selectedLanguage]);

  //////////////////////// Marker behaviors /////////////////////////////////
  
  // Marker is hovered
  const onMarkerMouseOver = (e, marker) => {
      setHoveredFeature(marker);

      // Update cursor position and style
      const cursor = cursorRef.current;
      if (cursor) {
          // cursor.style.left = `${e.originalEvent.pageX}px`;
          // cursor.style.top = `${e.originalEvent.pageY}px`;
          cursor.style.width = '50px';
          cursor.style.height = '50px';
          cursor.classList.add('active', 'expanded');
          // cursor.style.setProperty('--triangle-color', 'rgba(19, 233, 97, 0.8)'); // Green
          // cursor.style.setProperty('--triangle-color', 'rgba(255, 255, 255, 0.8)'); // White
          cursor.style.setProperty('--triangle-color', 'rgba(50, 205, 50, 0.8)'); // Dark Green


      }

      // Function to update the cursor position dynamically
      const updateCursorPosition = (event) => {
        if (cursor) {
            cursor.style.left = `${event.originalEvent.pageX}px`;
            cursor.style.top = `${event.originalEvent.pageY}px`;
        }
      };

      // Attach mousemove event to update cursor position
      e.target._map.on('mousemove', updateCursorPosition);

      // Show popup
      const popup = popupRef.current;
      if (popup) {
          popup.style.display = 'block';
          popup.style.left = `${e.originalEvent.pageX + 50}px`;
          popup.style.top = `${e.originalEvent.pageY - 25}px`;
          popup.innerHTML = `<strong>${marker.Name_Short}</strong>`;
      }
  };

  // Marker is unhovered
  const onMarkerMouseOut = () => {
      setHoveredFeature(null);

      // Reset cursor
      const cursor = cursorRef.current;
      if (cursor) {
          cursor.style.width = '40px';
          cursor.style.height = '40px';
          cursor.classList.remove('active', 'expanded');
      }

      // Hide popup
      const popup = popupRef.current;
      if (popup) {
          popup.style.display = 'none';
      }
  };

   //// Marker is clicked ////
   const onMarkerClick = (e, marker) => {
    console.log(`Clicked on ${marker.Name_Short}`);
    setSidebarContent({
      name_short: marker.Name_Short,
      name: marker.Name,
      relation: marker.Relation,
      gender: marker.Gender,
      birth_decade: marker["Birth Decade"],
      birth_loc: `${marker["Birth City Formatted"]}`,
      birth_modern: `${marker["birth_city_modern"]}`,
      // primary_lang: `${marker["Primary Language Spoken in Childhood"]}`,
      primary_lang: `${marker["lang2"]}`,
      other_lang: `${marker["Other Spoken Languages"]}`,
      jewish_yn: `${marker["Was ancestor Jewish?"]}`,
      migrate_yn: `${marker["Did the ancestor migrate?"]}`,
      migrate_decade: `${marker["Decade Migrated"]}`,
      destination: `${marker["Destination City Formatted"]}`,
      destination_modern: `${marker["dest_formatted"]}`,
      other_info: `${marker["Other Info"]}`
    });

    // Reset the previous marker's style
    resetMarkerStyle(activeMarker);

    // Highlight the clicked marker
    const clickedMarker = e.target;
    clickedMarker.setRadius(10); // Increase the radius to highlight
    clickedMarker.setStyle({
      color: '', // Highlight color
      // fillColor: 'pink',
      // fillOpacity: 0.5,
    });
    // Update the active marker reference
    setActiveMarker(clickedMarker);
    // Reset all line styles
    if (ancestryLinesLayer) {
      ancestryLinesLayer.eachLayer((layer) => {
        ancestryLinesLayer.resetStyle(layer);
      });

      // Highlight the corresponding line
      ancestryLinesLayer.eachLayer((layer) => {
        if (layer.feature.properties.ancestor_id === marker.ancestor_id) {
          console.log("i was clicked and i am active")
          layer.setStyle({
            color: 'red',
            weight: 3,
            opacity: 1,
          });
        }
      });
    }
  }
  
  //// Map is clicked (not marker) ////
  const onMapClick = (e) => {
    console.log("Map clicked", e)
    // Reset the currently active marker when the map is clicked
    resetMarkerStyle(activeMarker);
    setActiveMarker(null);
    setSidebarContent(null);
  };
  
  const resetMarkerStyle = (marker) => {
    if (marker) {
      marker.setRadius(5); // Reset radius
      marker.setStyle({
        color: 'rgba(0, 0, 0, 0)', // Transparent border (rgba format)
      });
    }
  };

  /////////////////////// Style the GeoJSON Lines ///////////////////////////////
  // style function for map layer
  const styleFunctionMap = () => ({
    fillColor: '#EBBB87FF', // Light brown color for fill
    color: '#6E57386C', // Dark brown color for borders
    weight: 1,
    fillOpacity: 0.3,
  });

    // Style function for the GeoJSON lines
const styleFunctionLine = (feature) => {
  const isSelected = selectedNames.includes(feature.properties.Name);
  return {
    color: isSelected ? '#FF0000' : '#909090', // Highlight with red if selected
    weight: isSelected ? 3 : 1, // Make the highlighted line thicker
    fillOpacity: 0.1,
  };
};

  /////////////////////// Custom Marker Cluster //////////////////////////////////////////////////////////////////////////
  const createClusterIcon = (languages, dynamicColorMapping) => {
    if (!dynamicColorMapping || Object.keys(dynamicColorMapping).length === 0) {
      console.warn('dynamicColorMapping is empty');
      return null;
    }
  
    // Calculate the counts of each language in the cluster
    const counts = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
  
    // Create the canvas and set its size to 30x20 (width x height)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = 30;
    const height = 20;
    const padding = 2;
    const total = languages.length;
  
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
  
    // Divide the canvas into two squares of equal width (15px each)
    const squareWidth = width / 2;
  
    // Draw the left square with the total count
    context.fillStyle = 'white'; // Background color of the left square
    context.fillRect(0, 0, squareWidth, height);
  
    context.fillStyle = 'black'; // Text color for count
    context.font = 'bold 12px Arial';
    const totalText = `${total}`;
    const textWidth = context.measureText(totalText).width;
    context.fillText(totalText, (squareWidth - textWidth) / 2, height / 2 + 5);
  
    // Draw the right square with the color mapping
    let currentY = 0;
    const entries = Object.entries(counts).map(([lang, count]) => {
      const color = dynamicColorMapping[lang] || '#808080'; // Default to gray if not found
      return {
        lang,
        count,
        color,
        height: (count / total) * height, // Calculate height of each colored part
      };
    });
  
    entries.forEach(({ color, height }, index) => {
      context.fillStyle = color;
      context.fillRect(squareWidth, currentY, squareWidth, height); // Draw the colored square
      currentY += height; // Update the currentY for the next color block
    });
  
    // Return the custom icon with the generated canvas image
    return new L.DivIcon({
      html: `<img src="${canvas.toDataURL()}" style="display:block;" />`,
      iconSize: [width, height],  // Set the size of the icon
      iconAnchor: [width / 2, height / 2],  // Set anchor point to the center of the icon
    });
  };
  
  // Only render MarkerClusterGroup when dynamicColorMapping is available
  if (!dynamicColorMapping || Object.keys(dynamicColorMapping).length === 0) {
    return <div>Loading...</div>;
  }

  const handleClusterClick = (cluster) => {
    cluster.spiderfy();
  };

  const handleSpiderfy = (e) => {
    const cluster = e.target;
    cluster.spiderfy(); // Freeze the spiderfy state
  };
  
  const handleUnspiderfy = (e) => {
    // Optionally, prevent automatic unspiderfy until a zoom or pan event occurs
    e.preventDefault();
  };

  const handleZoomOrPan = () => {
    const map = mapRef.current;
    if (map) {
      // Find all clusters and unspiderfy them
      const clusters = map._layers; // Access all layers
      Object.values(clusters).forEach((layer) => {
        if (layer.unspiderfy) {
          layer.unspiderfy();
        }
      });
    }
  };
  

  const handleFilterMarkers = (filterCriteria) => {
    // Apply your filter logic here
    const filtered = markerData.filter(marker => {
      // Example filter logic
      return marker.birthDecade === selectedDecade;
    });
    setUpdatedFilteredMarkers(filtered);
    console.log("Filtered Markers:", filtered); // Log the filtered markers
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 ////////////////////////////////////////// Return these upon some action ////////////////////////////////////////////

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      
       {/* Custom Layers Control */}
       <CustomLayersControl
          onToggleMigrationLines={handleToggleMigrationLines}         
          isMigrationLinesVisible={isMigrationLinesVisible}

          isBordersVisible1880={isBordersVisible1880}
          onToggleBorders1880={setIsBordersVisible1880}
          
          isBordersVisible1945={isBordersVisible1945}
          onToggleBorders1945={setIsBordersVisible1945}

          onBasemapChange={handleBasemapChange}
          birthDecades = {selectedBirthDecades}
          onDecadeChange = {handleDecadeChange}
        />

      {/* Map Container including Basemap, Data Layers, Layers Control, Custom Cursor, Popup, Marker Cluster */}
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={3} 
        maxZoom={14} 
        minZoom={3} 
        zoomControl={false} 
        style={{ height: '100vh' }} // Ensure height is set for the container
        // whenCreated={(map) => {
        //   mapRef.current = map;
        // }}
        onClick={(e) => console.log("Map clicked", e)}

        // onClick={onMapClick} // Detect clicks outside markers
        onZoom={handleZoomOrPan}
        onMoveEnd={handleZoomOrPan}
        >

        {/* Basemap Layer */}
        <TileLayer
          url={
            basemap === 'light'
              ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Borders Layer */}
        <BordersLayer
          isVisible={isBordersVisible1850}
          data={geoData1850}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1880}
          data={geoData1880}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1900}
          data={geoData1900}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1914}
          data={geoData1914}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1920}
          data={geoData1920}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1938}
          data={geoData1938}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1945}
          data={geoData1945}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1950}
          data={geoData1950}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1960}
          data={geoData1960}
          styleFunction={styleFunctionMap}
        />
        <BordersLayer
          isVisible={isBordersVisible1970}
          data={geoData1970}
          styleFunction={styleFunctionMap}
        />

  {/* Migration Lines with gradient from red to green */}
  {isMigrationLinesVisible && filteredLines && (
      <GeoJSON
        data={{
          type: "FeatureCollection",
          features: filteredLines.map((line) => ({
            type: "Feature",
            geometry: line.greatCircleLine, // GeoJSON geometry
            properties: line, // You can pass more properties if needed
          })),
        }}
        style={(feature) => {
          const line = feature.geometry.coordinates;
          const coloredLine = applyGradientToLine(line); // Get gradient colors
          
          // You can return the first color or customize further
          return {
            color: coloredLine.length > 0 ? coloredLine[0].color : 'blue',  // Starting color of the line
            weight: 2,
            opacity: 0.8,
          };
        }}
         />
    )}

{isMigrationLinesVisible && filteredLines.length > 0 && (
      <GeoJSON key={geoJsonKey} data={{ type: "FeatureCollection", features: filteredLines }} />
    )}

        {/* Migration Lines Layer */}
        {isMigrationLinesVisible && geoJsonDataLines && (
          <GeoJSON 
            data={geoJsonDataLines} 
            style={styleFunctionLine} 
          />
        )}

        {/* Custom Cursor */}
        <div className="custom-cursor" ref={cursorRef}>
            <div className="top-right"></div>
            <div className="bottom-left"></div>
        </div>

        {/* Popup */}
        <div className="popup" ref={popupRef}></div>

        <MarkerClusterGroup
  key={filteredMarkers.length} // Reset the group when the filteredMarkers array changes
  spiderfyOnMaxZoom={true}
  showCoverageOnHover={false}
  chunkedLoading={true}
  onClusterClick={handleClusterClick}
  onLayerAdd={handleZoomOrPan}
  iconCreateFunction={(cluster) => {
    const languages = cluster.getAllChildMarkers().map((marker) => marker.options.lang2);
    return createClusterIcon(languages, dynamicColorMapping);
  }}
>
  {/* Render filtered marker data */}
  {filteredMarkers.map((marker, index) => {
    // console.log("Rendering Marker:", marker); // Log each marker being rendered
    return (
      <CircleMarker
        key={index}
        center={[marker.lat, marker.lon]}
        radius={5}
        fillColor={dynamicColorMapping[marker.lang2] || '#808080'}
        color={dynamicColorMapping[marker.lang2] || '#808080'}
        fillOpacity={0.8}
        eventHandlers={{
          mouseover: (e) => onMarkerMouseOver(e, marker),
          mouseout: onMarkerMouseOut,
          click: (e) => {
            onMarkerClick(e, marker);
            e.originalEvent.stopPropagation();
          },
        }}
        lang2={marker.lang2}
      />
    );
  })}
</MarkerClusterGroup>

      {/* Pass uniqueBirthDecades to TimelineSlider */}
      <TimelineSlider
        birthDecades={uniqueBirthDecades}
        selectedDecade={selectedDecade} // Pass selectedDecade state to TimelineSlider
        onDecadeChange={handleDecadeChange} // Pass handleDecadeChange to handle the slider changes
      />

      {/* Legend */}
      <Legend
        colorMapping={dynamicColorMapping}
        selectedLanguage={selectedLanguage}
        handleFilterChange={(e) => setSelectedLanguage(e.target.value)}
        handleLanguageSelect={handleLanguageSelect}
        resetLanguageFilter = {resetLanguageFilter}
        resetLanguageSelection={resetLanguageSelection} 

      />

<Sidebar sidebarContent={sidebarContent} />



      </MapContainer>
    </div>
    
  );
};

export default MapComponent;
