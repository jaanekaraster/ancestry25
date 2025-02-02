import pandas as pd
import folium

# Load your CSV data
data = pd.read_csv('./Ancestry_82824_Formatted_geocoded_classroom1_edited_with_languages.csv')  # Replace with your CSV file path

# Create a base map
m = folium.Map(location=[data['Birth_City_Lat'].mean(), data['Birth_City_Lon'].mean()], zoom_start=5)

# Add markers to the map
for index, row in data.iterrows():
    folium.Marker(
        location=[row['Birth_City_Lat'], row['Birth_City_Lon']],
        popup=row['Birth City Formatted'],
        tooltip=row['Name']
    ).add_to(m)

# Save the map to an HTML file
m.save('map.html')
