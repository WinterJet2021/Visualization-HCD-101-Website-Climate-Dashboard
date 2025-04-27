// emissions-map.js
// D3.js visualization for emissions map

// Create emissions map
function createEmissionsMap() {
    console.log("Initializing emissions map...");
    
    // Set dimensions and margins
    const margin = {top: 20, right: 20, bottom: 40, left: 20};
    const width = document.getElementById("emissions-map").offsetWidth - margin.left - margin.right;
    const height = document.getElementById("emissions-map").offsetHeight - margin.top - margin.bottom;
    
    console.log("Map container dimensions:", 
      document.getElementById("emissions-map").offsetWidth,
      document.getElementById("emissions-map").offsetHeight);
  
    // Create SVG
    const svg = d3.select("#emissions-map")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Add loading indicator
    const loadingText = svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .text("Loading data...");
  
    // Initial settings
    let selectedYear = "2020";
    let selectedType = "total";
    let currentData;
  
    // Create a projection
    const projection = d3.geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 1.8]);
  
    // Create a path generator
    const path = d3.geoPath()
      .projection(projection);
  
    // Create color scales
    const totalColorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, 12000]);
    
    const capitaColorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, 50]);
  
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    // Load emissions data
    console.log("Loading emissions data...");
    d3.json("data/emissions-data.json")
      .then(function(emissionsData) {
        console.log("Emissions data loaded successfully:", emissionsData);
        
        // Set current data based on initial selections
        currentData = emissionsData[selectedYear][selectedType];
        console.log("Current data selected:", currentData);
  
        // Create explicit mapping between country names and ISO codes
        const countryNameToISO = {
          "United States": "USA",
          "China": "CHN",
          "India": "IND",
          "Russia": "RUS",
          "Japan": "JPN",
          "Germany": "DEU",
          "Iran": "IRN",
          "South Korea": "KOR",
          "Saudi Arabia": "SAU",
          "Indonesia": "IDN",
          "Canada": "CAN",
          "Mexico": "MEX",
          "Brazil": "BRA",
          "South Africa": "ZAF",
          "Australia": "AUS",
          "Turkey": "TUR",
          "United Kingdom": "GBR",
          "Italy": "ITA",
          "France": "FRA",
          "Poland": "POL",
          "Qatar": "QAT",
          "Kuwait": "KWT",
          "United Arab Emirates": "ARE",
          "Kazakhstan": "KAZ",
          "Netherlands": "NLD"
        };
        
        // Load world map data
        console.log("Loading world map data...");
        loadWorldMap();
        
        function loadWorldMap() {
          // Try primary source
          d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
            .then(processWorldData)
            .catch(function(error) {
              console.error("Error loading primary world map source:", error);
              console.log("Trying alternative source...");
              
              // Try alternative source if primary fails
              d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
                .then(processWorldData)
                .catch(function(error) {
                  console.error("Error loading alternative world map source:", error);
                  handleMapLoadError("Failed to load map data from both sources. Please check your internet connection.");
                });
            });
        }
        
        function handleMapLoadError(message) {
          loadingText.remove();
          svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "red")
            .text(message);
            
          console.error(message);
        }
        
        function processWorldData(world) {
          console.log("World map data loaded successfully");
          
          try {
            // Remove loading indicator
            loadingText.remove();
  
            // Examine the world data structure
            console.log("World data structure:", Object.keys(world));
            console.log("Objects in world data:", Object.keys(world.objects));
            
            // Ensure we're using the correct property for countries
            const countryObjectName = world.objects.countries ? "countries" : 
                                     (world.objects.ne_110m_admin_0_countries ? "ne_110m_admin_0_countries" : null);
            
            if (!countryObjectName) {
              throw new Error("Could not find countries object in the TopoJSON data");
            }
            
            console.log("Using country object name:", countryObjectName);
            
            // Convert TopoJSON to GeoJSON
            const countries = topojson.feature(world, world.objects[countryObjectName]).features;
            console.log("Converted to GeoJSON. Countries count:", countries.length);
            
            // Sample of the country data to understand its structure
            const sampleCountries = countries.slice(0, 5);
            console.log("Sample country data:", sampleCountries);
            
            // Create a comprehensive mapping between country properties and ISO codes
            // This will look at names, IDs, and any other properties to find matches
            const getCountryISO = (country) => {
              // Try direct mapping by name if available
              if (country.properties && country.properties.name) {
                const iso = countryNameToISO[country.properties.name];
                if (iso && currentData[iso]) return iso;
              }
              
              // Try by name property variations
              if (country.properties) {
                for (const prop in country.properties) {
                  if (typeof country.properties[prop] === 'string') {
                    const iso = countryNameToISO[country.properties[prop]];
                    if (iso && currentData[iso]) return iso;
                  }
                }
              }
              
              // Hard-coded mappings for specific country IDs
              // Based on common mappings in TopoJSON files
              const idToISO = {
                840: "USA", 156: "CHN", 356: "IND", 643: "RUS", 392: "JPN",
                276: "DEU", 364: "IRN", 410: "KOR", 682: "SAU", 360: "IDN",
                124: "CAN", 484: "MEX", 76: "BRA", 710: "ZAF", 36: "AUS",
                792: "TUR", 826: "GBR", 380: "ITA", 250: "FRA", 616: "POL",
                634: "QAT", 414: "KWT", 784: "ARE", 398: "KAZ", 528: "NLD"
              };
              
              if (country.id && idToISO[country.id] && currentData[idToISO[country.id]]) {
                return idToISO[country.id];
              }
              
              return null;
            };
            
            // Count how many countries we can map to our data
            let matchCount = 0;
            countries.forEach(country => {
              if (getCountryISO(country)) matchCount++;
            });
            console.log(`Found matches for ${matchCount} out of ${countries.length} countries`);
            
            // Draw countries
            console.log("Drawing country paths...");
            const countryPaths = svg.selectAll("path.country")
              .data(countries)
              .enter()
              .append("path")
                .attr("class", "country")
                .attr("d", path)
                .attr("fill", function(d) {
                  const iso = getCountryISO(d);
                  if (iso) {
                    return selectedType === "total" ? 
                      totalColorScale(currentData[iso]) : capitaColorScale(currentData[iso]);
                  }
                  return "#ccc"; // Default gray color
                })
                .on("mouseover", function(event, d) {
                  const iso = getCountryISO(d);
                  if (iso) {
                    d3.select(this)
                      .transition()
                      .duration(200)
                      .style("stroke", "#000")
                      .style("stroke-width", 1.5);
                    
                    let emissionValue = currentData[iso];
                    let units = selectedType === "total" ? "million tonnes" : "tonnes per capita";
                    
                    tooltip.transition()
                      .duration(200)
                      .style("opacity", .9);
                    
                    const countryName = d.properties && d.properties.name ? 
                                       d.properties.name : iso;
                    
                    tooltip.html(`<strong>${countryName}</strong><br>CO<sub>2</sub> emissions: ${emissionValue} ${units}`)
                      .style("left", (event.pageX + 10) + "px")
                      .style("top", (event.pageY - 28) + "px");
                  }
                })
                .on("mouseout", function() {
                  d3.select(this)
                    .transition()
                    .duration(500)
                    .style("stroke", "#fff")
                    .style("stroke-width", 0.5);
                  
                  tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                });
            
            console.log("Country paths drawn");
            
            // Create legend
            console.log("Creating legend...");
            const legendWidth = 300;
            const legendHeight = 10;
            const legendPosition = {x: 20, y: height - 40};
            
            // Create gradient for legend
            const defs = svg.append("defs");
            const linearGradient = defs.append("linearGradient")
              .attr("id", "legend-gradient")
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "100%")
              .attr("y2", "0%");
            
            // Add color stops to gradient
            updateLegendGradient(selectedType);
            
            // Create legend rectangle
            const legendRect = svg.append("rect")
              .attr("x", legendPosition.x)
              .attr("y", legendPosition.y)
              .attr("width", legendWidth)
              .attr("height", legendHeight)
              .style("fill", "url(#legend-gradient)");
            
            // Add legend axis
            const legendScale = d3.scaleLinear()
              .domain(selectedType === "total" ? [0, 12000] : [0, 50])
              .range([0, legendWidth]);
            
            const legendAxis = svg.append("g")
              .attr("class", "legend-axis")
              .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y + legendHeight})`)
              .call(d3.axisBottom(legendScale).ticks(5).tickFormat(d => d));
            
            // Add legend title
            const legendTitle = svg.append("text")
              .attr("class", "legend-title")
              .attr("x", legendPosition.x + legendWidth / 2)
              .attr("y", legendPosition.y - 10)
              .attr("text-anchor", "middle")
              .text(selectedType === "total" ? "CO₂ Emissions (million tonnes)" : "CO₂ Emissions (tonnes per capita)");
            
            // Function to update the legend gradient
            function updateLegendGradient(type) {
              // Remove old stops
              linearGradient.selectAll("stop").remove();
              
              // Add new stops
              if (type === "total") {
                linearGradient.selectAll("stop")
                  .data([0, 2000, 4000, 6000, 8000, 10000, 12000])
                  .enter()
                  .append("stop")
                  .attr("offset", d => `${(d / 12000) * 100}%`)
                  .attr("stop-color", d => totalColorScale(d));
              } else {
                linearGradient.selectAll("stop")
                  .data([0, 10, 20, 30, 40, 50])
                  .enter()
                  .append("stop")
                  .attr("offset", d => `${(d / 50) * 100}%`)
                  .attr("stop-color", d => capitaColorScale(d));
              }
            }
            
            // Function to update map
            function updateMap() {
              currentData = emissionsData[selectedYear][selectedType];
              console.log("Updating map with new data:", selectedYear, selectedType);
              
              // Update country colors
              countryPaths
                .transition()
                .duration(750)
                .attr("fill", d => {
                  const iso = getCountryISO(d);
                  if (iso) {
                    return selectedType === "total" ? 
                      totalColorScale(currentData[iso]) : capitaColorScale(currentData[iso]);
                  }
                  return "#ccc"; // Default gray color
                });
              
              // Update legend
              legendScale.domain(selectedType === "total" ? [0, 12000] : [0, 50]);
              legendAxis.transition().duration(750).call(d3.axisBottom(legendScale).ticks(5));
              updateLegendGradient(selectedType);
              legendTitle.text(selectedType === "total" ? 
                "CO₂ Emissions (million tonnes)" : "CO₂ Emissions (tonnes per capita)");
            }
            
            // Event listeners for controls
            document.getElementById("emissions-year").addEventListener("change", function() {
              selectedYear = this.value;
              updateMap();
            });
            
            document.getElementById("emissions-type").addEventListener("change", function() {
              selectedType = this.value;
              updateMap();
            });
            
            // Make map responsive
            function resizeMap() {
              const newWidth = document.getElementById("emissions-map").offsetWidth - margin.left - margin.right;
              const newHeight = document.getElementById("emissions-map").offsetHeight - margin.top - margin.bottom;
              
              svg.attr("width", newWidth + margin.left + margin.right)
                 .attr("height", newHeight + margin.top + margin.bottom);
              
              projection
                .scale(newWidth / 5.5)
                .translate([newWidth / 2, newHeight / 1.8]);
              
              countryPaths.attr("d", path);
              
              // Update legend position
              const legendPosition = {x: 20, y: newHeight - 40};
              legendRect
                .attr("x", legendPosition.x)
                .attr("y", legendPosition.y);
              
              legendAxis
                .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y + legendHeight})`);
              
              legendTitle
                .attr("x", legendPosition.x + legendWidth / 2)
                .attr("y", legendPosition.y - 10);
            }
            
            // Add resize listener
            window.addEventListener("resize", resizeMap);
            
            console.log("Map setup complete");
          } catch (error) {
            console.error("Error processing world map data:", error);
            handleMapLoadError("Error processing map data: " + error.message);
          }
        }
      })
      .catch(function(error) {
        console.error("Error loading emissions data:", error);
        loadingText.text("Error loading emissions data. Please try refreshing the page.");
      });
  }
  
  // Initialize map when DOM is loaded
  document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("emissions-map")) {
      console.log("DOM loaded, initializing emissions map");
      createEmissionsMap();
    } else {
      console.error("Emissions map container not found in DOM");
    }
  });