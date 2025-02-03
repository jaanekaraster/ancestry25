import logo from './logo.svg';
import './App.css';
import MapComponent from './components/MapComponent1.js';

function App() {
  return (
    <div className="App">
      <div className="App">
      {/*<h1>JLP Ancestry</h1>*/}
      {/* <iframe 
        src="/python/interactive_map_with_1880.html"         // Path to your Folium map
        style={{ width: '100%', height: '600px', border: 'none' }}
        title="Map"
      /> */}
      <MapComponent /> 
    </div>
    </div>
  );
}

export default App;
