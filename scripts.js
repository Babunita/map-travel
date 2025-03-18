var map = L.map('map', {
    scrollWheelZoom: true,
    dragging: true,
    tap: true,
    touchZoom: true
}).setView([16.4023, 120.5960], 13); // Center the map on Baguio

// Add this after map initialization
map.on('load', function() {
    setTimeout(function() {
        map.invalidateSize();
    }, 100);
});

// Add resize handler
window.addEventListener('resize', function() {
    map.invalidateSize();
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var busTypes = {
    "victoryCubao": [
        { type: "Regular Air-conditioned Bus", fare: 616 },
        { type: "First Class Bus", fare: 999 },
        { type: "Royal Class Bus", fare: 1500 }
    ],
    "victoryPasay": [
        { type: "Regular Air-conditioned Bus", fare: 480 },
        { type: "First Class Bus", fare: 800 }
    ],
    "victorySampaloc": [
        { type: "Regular Air-conditioned Bus", fare: 487 },
        { type: "Deluxe Bus", fare: 1006 },
        { type: "Special Bus", fare: 1238 }
    ],
    "genesisCubao": [
        { type: "Deluxe Bus", fare: 720 },
        { type: "Premier Bus", fare: 740 }
    ],
    "genesisPasay": [
        { type: "Deluxe Bus", fare: 730 },
        { type: "Premier Bus", fare: 760 }
    ],
    "genesisAvenida": [
        { type: "Semi-Deluxe Bus", fare: 600 },
        { type: "Deluxe Bus", fare: 720 }
    ],
    "solidNorth": [
        { type: "Luxury Bus", fare: 600 },
        { type: "Super Deluxe Bus with CR", fare: 800 }
    ]
};

var schedules = {
    "victoryCubao": "Buses depart every 30 minutes starting from 12:15 AM, with subsequent trips at 10:15 AM, 12:20 PM, 2:15 PM, 8:15 PM, and 11:15 PM.",
    "victoryPasay": "Buses depart hourly.",
    "victorySampaloc": "Buses depart at 6:00 AM and 10:00 AM.",
    "genesisCubao": "Buses to Baguio depart from 3:00 AM to 7:00 AM with 1-hour intervals.",
    "genesisPasay": "Buses to La Union depart from 2:00 AM to 6:30 PM with 1.5-hour intervals.",
    "genesisAvenida": "Information not specified; please contact Genesis Transport for details.",
    "solidNorth": "Buses to Baguio depart regularly; specific times not provided."
};

var control;

function getWaypoints(terminal) {
    var waypoints = [
        L.latLng(14.5995, 120.9842),
        L.latLng(14.7006, 120.9830),
        L.latLng(15.4826, 120.5976),
        L.latLng(15.9761, 120.5717),
        L.latLng(16.4023, 120.5960)
    ];

    switch (terminal) {
        case 'victoryCubao':
            waypoints.splice(1, 0, L.latLng(14.6180, 121.0560));
            break;
        case 'victoryPasay':
            waypoints.splice(1, 0, L.latLng(14.5378, 121.0014));
            break;
        case 'victorySampaloc':
            waypoints.splice(1, 0, L.latLng(14.6095, 120.9842));
            break;
        case 'genesisPasay':
            waypoints.splice(1, 0, L.latLng(14.5378, 121.0014));
            break;
        case 'genesisCubao':
            waypoints.splice(1, 0, L.latLng(14.6180, 121.0560));
            break;
        case 'genesisAvenida':
            waypoints.splice(1, 0, L.latLng(14.6095, 120.9842));
            break;
        case 'solidNorth':
            waypoints.splice(1, 0, L.latLng(14.6095, 120.9842));
            break;
    }

    return waypoints;
}

function addRoutingControl(terminal) {
    if (control) {
        map.removeControl(control);
    }

    var waypoints = getWaypoints(terminal);

    control = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true
    }).addTo(map);

    control.on('routesfound', function(e) {
        var routes = e.routes;
        var routeInfoTable = document.getElementById('routeInfo').getElementsByTagName('tbody')[0];
        routeInfoTable.innerHTML = '';

        var departureTimeInput = document.getElementById('departureTime').value;
        var departureTime = new Date();
        var timeParts = departureTimeInput.split(':');
        departureTime.setHours(timeParts[0], timeParts[1], 0); // Set departure time based on user input

        // Estimated travel duration in hours (4.5 to 7 hours)
        var travelDuration = 4.5 + Math.random() * 2.5;
        var travelDurationInSeconds = travelDuration * 3600;

        var busTypeInfo = busTypes[terminal];
        busTypeInfo.forEach(function(busType) {
            var row = routeInfoTable.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = busType.type;
            cell2.innerHTML = busType.fare.toFixed(2);

            var arrivalTime = new Date(departureTime.getTime() + travelDurationInSeconds * 1000);
            var arrivalTimeString = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            cell3.innerHTML = arrivalTimeString;
        });

        // Display schedule information
        var scheduleInfo = schedules[terminal];
        if (scheduleInfo) {
            var scheduleRow = routeInfoTable.insertRow();
            var scheduleCell = scheduleRow.insertCell(0);
            scheduleCell.colSpan = 3;
            scheduleCell.innerHTML = `<b>Schedule:</b> ${scheduleInfo}`;
        }
    });
}

const spotIcons = {
    park: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    museum: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    church: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    market: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
    attraction: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    })
};

var touristSpots = [
    { name: "Burnham Park", coords: [16.4112, 120.5954], type: "park", description: "Located in the heart of the city, this park offers a serene environment with a man-made lake ideal for boating, walking paths, gardens, and recreational areas." },
    { name: "Mines View Park", coords: [16.4210, 120.6231], type: "park", description: "This park provides panoramic views of the Cordillera mountains and the historic mining town of Itogon. Visitors can also shop for souvenirs and try on traditional Igorot attire for photos." },
    { name: "The Mansion", coords: [16.4120, 120.6215], type: "attraction", description: "Serving as the official summer residence of the Philippine President, The Mansion boasts impressive architecture and beautifully manicured gardens. While the main building isn't open to the public, visitors can explore the grounds and take photos at the iconic gate." },
    { name: "Wright Park", coords: [16.4131, 120.6212], type: "park", description: "Famous for its 'Pool of Pines,' this park is a favorite spot for horseback riding and leisurely walks among towering pine trees." },
    { name: "Baguio Cathedral", coords: [16.4131, 120.5986], type: "church", description: "Perched atop a hill, this majestic church is known for its distinct pink facade, twin spires, and stained glass windows. It also offers a panoramic view of the city." },
    { name: "Tam-awan Village", coords: [16.4260, 120.5770], type: "attraction", description: "Dubbed the 'Garden in the Sky,' this cultural village showcases traditional Ifugao and Kalinga huts, local art exhibits, and workshops, providing insights into indigenous culture." },
    { name: "BenCab Museum", coords: [16.4023, 120.5960], type: "museum", description: "Founded by National Artist Benedicto Cabrera, the museum houses contemporary Philippine art and artifacts. Its location also offers scenic views of the surrounding gardens and mountains." },
    { name: "Strawberry Farm", coords: [16.4551, 120.5863], type: "attraction", description: "Just a short drive from Baguio, visitors can experience strawberry picking and taste various strawberry-based products." },
    { name: "Camp John Hay", coords: [16.3840, 120.6136], type: "attraction", description: "Once a US military base, it's now a recreational complex featuring hotels, restaurants, a golf course, and nature trails." },
    { name: "Baguio Night Market", coords: [16.4122, 120.5992], type: "market", description: "Held along Harrison Road, this bustling market offers a wide array of goods, from clothes to street food, and is a haven for bargain hunters." },
    { name: "Baguio Public Market", coords: [16.4143, 120.5953], type: "market", description: "The city's main public market, offering fresh vegetables, fruits, flowers, and local delicacies at wholesale prices." },
    { name: "Maharlika Livelihood Center", coords: [16.4135, 120.5965], type: "market", description: "A multi-story shopping center offering traditional handicrafts, clothing, and souvenirs at reasonable prices." },
    { name: "Botanical Garden", coords: [16.4115, 120.6175], type: "park", description: "Also known as the Igorot Village, this garden showcases native huts typical of Cordillera architecture and various plant species." },
    { name: "Session Road", coords: [16.4120, 120.5990], type: "attraction", description: "The main thoroughfare of Baguio City, lined with shops, cafes, and restaurants, making it a hub for commerce and leisure." },
    { name: "Lourdes Grotto", coords: [16.4083, 120.5883], type: "church", description: "A Catholic shrine and pilgrimage site that requires visitors to climb 252 steps to reach the top, where a statue of the Virgin Mary stands. The summit offers a panoramic view of the city." },
    { name: "Bell Church", coords: [16.4300, 120.6010], type: "church", description: "A Taoist temple featuring intricate architecture, beautifully landscaped gardens, and serene ponds, reflecting Chinese culture and beliefs." },
    { name: "Diplomat Hotel", coords: [16.4112, 120.5900], type: "attraction", description: "An abandoned retreat house atop Dominican Hill, known for its historical significance and panoramic city views." },
    { name: "Igorot Stone Kingdom", coords: [16.4150, 120.6000], type: "attraction", description: "A relatively new attraction, this park showcases terraced stone structures inspired by Igorot culture and legends." },
    { name: "Mirador Heritage and Eco-Spirituality Park", coords: [16.4020, 120.5950], type: "park", description: "Offers a peaceful environment with gardens, meditation spaces, and a bamboo grove, perfect for reflection and relaxation." },
    { name: "Baguio Museum", coords: [16.4100, 120.6000], type: "museum", description: "Displays artifacts and exhibits that narrate the history and culture of Baguio and the Cordillera region." },
    { name: "Asin Hot Springs", coords: [16.4000, 120.5500], type: "attraction", description: "Located in Tuba, Benguet, these natural hot springs are perfect for relaxation and are set amidst scenic landscapes." },
    { name: "Tree Top Adventure", coords: [16.3800, 120.6100], type: "attraction", description: "For thrill-seekers, this destination offers activities like zip-lining, canopy rides, and trekking amidst the pine forests." },
    { name: "Baguio Public Market", coords: [16.4143, 120.5953], type: "market", description: "The city's main public market, offering fresh vegetables, fruits, flowers, and local delicacies at wholesale prices." },
    { name: "Maharlika Livelihood Center", coords: [16.4135, 120.5965], type: "market", description: "A multi-story shopping center offering traditional handicrafts, clothing, and souvenirs at reasonable prices." }
];

function getImagePath(spotName) {
    // Map specific image filenames
    const imageMap = {
        "Burnham Park": "burnham-park.jpg",
        "Mines View Park": "mines-view-park.jpg",
        "Wright Park": "wright-park.jpg",
        "Botanical Garden": "botanical-garden.jpg",
        "Mirador Heritage and Eco-Spirituality Park": "mirador-heritage.jpg",
        "BenCab Museum": "BenCab-museum.jpg",
        "Baguio Museum": "baguio-museum.jpg",
        "Baguio Cathedral": "baguio-cathedral.jpg",
        "Lourdes Grotto": "loudes-grotto.jpg",
        "Bell Church": "bell-church.jpg",
        "Baguio Night Market": "baguio-night-market.jpg",
        "Baguio Public Market": "Baguio-City-Public-Market.jpg",
        "Maharlika Livelihood Center": "maharlika-livelihood-complex.jpg",
        "The Mansion": "the-mansion.jpg",
        "Tam-awan Village": "Tam-Awan-Village-Baguio-City.jpg",
        "Strawberry Farm": "strawberry-farm.jpg",
        "Camp John Hay": "camp-john-hay.jpg",
        "Session Road": "Session-Road.jpg",
        "Diplomat Hotel": "diplomat-hotel.jpg",
        "Igorot Stone Kingdom": "Igorot-Stone-Kingdom.jpg",
        "Asin Hot Springs": "asin-hot-springs.jpg",
        "Tree Top Adventure": "Tree-Top-Adventure-Baguio.jpg"
    };

    return imageMap[spotName] || 'default.jpg';
}

function addTouristSpots() {
    touristSpots.forEach(function(spot) {
        var icon = spotIcons[spot.type] || spotIcons.attraction;
        var marker = L.marker(spot.coords, { icon: icon }).addTo(map);
        
        // Get the correct image path for this spot
        var imagePath = `images/${getImagePath(spot.name)}`;
        
        var popupContent = `
            <div class="popup-content">
                <img class="popup-image" 
                     src="${imagePath}" 
                     alt="${spot.name}"
                     onerror="this.src='images/default.jpg'">
                <div class="popup-text">
                    <h3 style="color: #800000; margin: 0 0 8px 0;">${spot.name}</h3>
                    <p style="margin: 0; font-size: 14px;">${spot.description}</p>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 300
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    addTouristSpots();
});

document.getElementById('terminalSelection').addEventListener('change', function() {
    var selectedTerminal = this.value;
    if (selectedTerminal) {
        addRoutingControl(selectedTerminal);
    }
});

let userMarker = null;

function createPermissionDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'permission-dialog';
    dialog.innerHTML = `
        <h3>Location Access</h3>
        <p>This app wants to access your location</p>
        <div class="permission-buttons">
            <button class="allow-button">Allow</button>
            <button class="deny-button">Deny</button>
        </div>
    `;
    document.body.appendChild(dialog);
    return dialog;
}

function showPermissionDialog() {
    return new Promise((resolve, reject) => {
        const dialog = createPermissionDialog();
        
        // Trigger animation after a small delay
        setTimeout(() => dialog.classList.add('show'), 10);

        dialog.querySelector('.allow-button').addEventListener('click', () => {
            dialog.classList.remove('show');
            setTimeout(() => {
                dialog.remove();
                resolve(true);
            }, 400);
        });

        dialog.querySelector('.deny-button').addEventListener('click', () => {
            dialog.classList.remove('show');
            setTimeout(() => {
                dialog.remove();
                resolve(false);
            }, 400);
        });
    });
}

document.getElementById('locationButton').addEventListener('click', async () => {
    const statusElement = document.getElementById('locationStatus');
    
    if (!navigator.geolocation) {
        statusElement.textContent = 'Geolocation is not supported by your browser';
        return;
    }

    // Show custom permission dialog
    const permission = await showPermissionDialog();
    
    if (!permission) {
        statusElement.textContent = 'Location access denied';
        return;
    }

    statusElement.textContent = 'Getting your location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);

            userMarker.bindPopup('You are here!').openPopup();
            
            // Smooth pan and zoom animation
            map.flyTo([latitude, longitude], 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
            
            statusElement.textContent = 'Location found!';
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    statusElement.textContent = 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    statusElement.textContent = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    statusElement.textContent = 'Location request timed out';
                    break;
                default:
                    statusElement.textContent = 'An unknown error occurred';
            }
        }
    );
});