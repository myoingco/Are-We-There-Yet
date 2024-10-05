// Load the cleaned flight data from the JSON file
d3.json('cleaned_flight_data.json').then(data => {
    console.log(data); // Log data for debugging

    // Step 1: Create a dropdown menu with unique country options
    const countryDropdown = d3.select('#countryDropdown');
    const countries = [...new Set(data.map(flight => flight.origin_country))]; // Unique countries

    // Populate the dropdown with country options
    countries.forEach(country => {
        countryDropdown.append('option')
            .text(country)
            .attr('value', country);
    });

    // Initialize the map
    const map = initMap();

    // Step 2: Event listener for dropdown selection
    countryDropdown.on('change', function() {
        const selectedCountry = d3.select(this).property('value');
        updateFlightData(selectedCountry);
    });

    // Initial load of flight data for the first country in the dropdown
    updateFlightData(countries[0]);

    // Function to update flight data display based on selected country
    function updateFlightData(country) {
        const filteredData = data.filter(flight => flight.origin_country === country);
        const flightDataDiv = d3.select('#flightData');
        flightDataDiv.html(''); // Clear previous data

        // Display flight data
        filteredData.forEach(flight => {
            flightDataDiv.append('div')
                .text(`Callsign: ${flight.callsign}, Velocity: ${flight.velocity} m/s, Latitude: ${flight.latitude}, Longitude: ${flight.longitude}`);
        });

        // Plot the first flight of the filtered data on the map
        if (filteredData.length > 0) {
            plotFlightOnMap(filteredData[0]);
        } else {
            alert('No flights found for this country.');
        }
    }

}).catch(error => {
    console.error('Error loading the JSON data:', error);
});

// Function to initialize the map
function initMap() {
    const map = L.map('map').setView([20, 0], 2); // Set initial view to a global view

    // Add a tile layer to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    return map;
}

// Function to plot flight data on the map
function plotFlightOnMap(selectedFlight) {
    const latitude = selectedFlight.latitude;
    const longitude = selectedFlight.longitude;

    // Clear previous markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add marker for the selected flight
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`Callsign: ${selectedFlight.callsign}<br>Velocity: ${selectedFlight.velocity} m/s`).openPopup();

    // Adjust map view to the selected flight marker
    map.setView([latitude, longitude], 8); // Zoom into the marker
}

