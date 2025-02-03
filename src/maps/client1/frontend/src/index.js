import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Add a global stylesheet here if needed
import MapComponent from './components/MapComponent1'; // Adjust the path if your components are organized differently

ReactDOM.render(
  <React.StrictMode>
    <MapComponent />
  </React.StrictMode>,
  document.getElementById('root') // Matches the `<div id="root"></div>` in public/index.html
);