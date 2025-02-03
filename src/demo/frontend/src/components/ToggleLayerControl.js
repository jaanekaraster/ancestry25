const ToggleLayerControl = ({ label, isChecked, onToggle }) => (
    <label style={{ display: "block", marginBottom: "10px" }}>
      <input type="checkbox" checked={isChecked} onChange={onToggle} />
      {label}
    </label>
  );
  
  export default ToggleLayerControl;
  