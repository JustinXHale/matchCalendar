The CSV method is a brilliant, rock-solid way to start. It keeps your app lightning-fast, costs absolutely zero dollars, requires no API registration keys, and runs completely offline in your codebase.To build an internal distance calculator for matchcalendar.web.app, you only need two components: a lightweight list of airport coordinates and a short math formula.Here is the step-by-step roadmap to build this feature right now:Step 1: Get the Airport Coordinate DataYou do not need a massive database. You only need a simple reference list linking 3-letter airport codes (IATA) to their precise coordinates.Go to OurAirports Data (a trusted, public-domain aviation data source).Download the airports.csv file.Filter or clean the file so you keep only the essential columns. You can convert it to a lightweight JSON file or an array of objects inside your app.Your structured dataset code will look exactly like this:

// localAirports.js (or JSON asset inside your project)
const airportRegistry = {
  "SAN": { lat: 32.7336, lon: -117.1897, name: "San Diego International" },
  "HOU": { lat: 29.6454, lon: -95.2789, name: "Houston Hobby" },
  "IAH": { lat: 29.9804, lon: -95.3397, name: "Houston Intercontinental" },
  "OKC": { lat: 35.3931, lon: -97.6008, name: "Will Rogers World" },
  "DFW": { lat: 32.8998, lon: -97.0403, name: "Dallas/Fort Worth" },
  "SAT": { lat: 29.5337, lon: -98.4698, name: "San Antonio International" }
};

Step 2: Add the Distance Formula (Haversine)Because the Earth is a sphere, you can't use simple flat-grid math to find distances. You must use the Haversine formula, which measures the direct line over a curved surface.Paste this pure JavaScript function directly into your app's utility file:

function calculateDistanceBetweenAirports(code1, code2) {
  const airport1 = airportRegistry[code1.toUpperCase()];
  const airport2 = airportRegistry[code2.toUpperCase()];

  if (!airport1 || !airport2) {
    console.error(`Airport code not found in registry: ${code1} or ${code2}`);
    return 0; 
  }

  const R = 3958.8; // Radius of the Earth in MILES (use 6371 for Kilometers)
  
  // Convert degrees to radians
  const dLat = (airport2.lat - airport1.lat) * Math.PI / 180;
  const dLon = (airport2.lon - airport1.lon) * Math.PI / 180;
  
  const lat1Rad = airport1.lat * Math.PI / 180;
  const lat2Rad = airport2.lat * Math.PI / 180;

  // Haversine core math
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * 
            Math.cos(lat1Rad) * Math.cos(lat2Rad);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance); // Returns clean integer miles
}

Step 3: Run Your Multi-Leg Total LoopWhenever you build an itinerary in your UI, map through your legs to generate the total distance tracker:

// Example calculating your screenshot itinerary: SAN -> HOU -> OKC -> DFW -> SAT
const travelLegs = ["SAN", "HOU", "OKC", "DFW", "SAT"];
let totalTripMiles = 0;

for (let i = 0; i < travelLegs.length - 1; i++) {
  const legDistance = calculateDistanceBetweenAirports(travelLegs[i], travelLegs[i+1]);
  totalTripMiles += legDistance;
}

console.log(`Total Trip Mileage: ${totalTripMiles} miles`); 
// Output: Total Trip Mileage: 2152 miles

---

on the card we could add the total miles next to flight like "Flight (1001mi)