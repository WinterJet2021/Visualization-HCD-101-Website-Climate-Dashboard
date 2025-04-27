// temperature-chart.js
// D3.js visualization for temperature trends

// Create temperature chart
function createTemperatureChart() {
    console.log("Initializing temperature chart...");
    
    // Set dimensions and margins
    const margin = {top: 40, right: 80, bottom: 60, left: 60};
    const width = document.getElementById("temperature-chart").offsetWidth - margin.left - margin.right;
    const height = document.getElementById("temperature-chart").offsetHeight - margin.top - margin.bottom;
    
    console.log("Temperature chart container dimensions:", 
      document.getElementById("temperature-chart").offsetWidth,
      document.getElementById("temperature-chart").offsetHeight);
  
    // Create SVG
    const svg = d3.select("#temperature-chart")
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
  
    // Variables to store state
    let data = [];
    let animating = false;
    let animationTimer;
    let currentRegion = "global";
  
    // Load data from JSON file
    console.log("Loading temperature data...");
    d3.json("data/temperature-data.json")
      .then(function(temperatureData) {
        console.log("Temperature data loaded successfully:", temperatureData);
        
        // Remove loading indicator
        loadingText.remove();
        
        // Initial dataset
        data = temperatureData[currentRegion];
        console.log("Initial data set:", data.length, "data points");
  
        // Add title
        const chartTitle = svg.append("text")
          .attr("class", "chart-title")
          .attr("x", width / 2)
          .attr("y", -15)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text("Global Temperature Anomalies (1990-2020)");
  
        // Create scales
        const x = d3.scaleLinear()
          .domain(d3.extent(data, d => d.year))
          .range([0, width]);
  
        const y = d3.scaleLinear()
          .domain([-0.2, 1.5]) // Fixed domain to allow for animation between datasets
          .range([height, 0]);
  
        // Add X axis
        const xAxis = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
  
        // Add Y axis
        const yAxis = svg.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(y));
  
        // Add X axis label
        svg.append("text")
          .attr("class", "x-label")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .text("Year");
  
        // Add Y axis label
        svg.append("text")
          .attr("class", "y-label")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("x", -height / 2)
          .text("Temperature Anomaly (°C)");
  
        // Add grid
        svg.append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
          );
  
        // Create area for uncertainty
        const area = d3.area()
          .x(d => x(d.year))
          .y0(d => y(d.value - d.uncertainty))
          .y1(d => y(d.value + d.uncertainty))
          .curve(d3.curveMonotoneX);
  
        // Add uncertainty area
        const uncertaintyArea = svg.append("path")
          .attr("class", "uncertainty-area")
          .datum(data)
          .attr("fill", "#e74c3c")
          .attr("fill-opacity", 0.2)
          .attr("d", area);
  
        // Create line generator
        const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.value))
          .curve(d3.curveMonotoneX);
  
        // Add the line path
        const temperatureLine = svg.append("path")
          .attr("class", "line")
          .datum(data)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "#e74c3c")
          .attr("stroke-width", 3);
  
        // Add dots
        const dotsGroup = svg.append("g")
          .attr("class", "dots-group");
          
        const dots = dotsGroup.selectAll(".dot")
          .data(data)
          .enter()
          .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.value))
            .attr("r", 5)
            .style("fill", "#e74c3c");
  
        // Create tooltip
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
  
        // Add interactivity to dots
        dots.on("mouseover", function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 8);
            
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            
            tooltip.html(`Year: ${d.year}<br>Temperature Anomaly: ${d.value.toFixed(2)}°C<br>Uncertainty: ±${d.uncertainty.toFixed(2)}°C`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .transition()
              .duration(500)
              .attr("r", 5);
            
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
  
        // Function to update chart with new data
        function updateChart(newData, updateTitle = false) {
          console.log("Updating chart with", newData.length, "data points");
          
          // Update scales
          x.domain(d3.extent(newData, d => d.year));
          
          // Update axes with transition
          xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
          
          // Update uncertainty area
          uncertaintyArea.datum(newData)
            .transition()
            .duration(1000)
            .attr("d", area);
          
          // Update line
          temperatureLine.datum(newData)
            .transition()
            .duration(1000)
            .attr("d", line);
          
          // Update dots
          dotsGroup.selectAll(".dot").remove();
          
          dotsGroup.selectAll(".dot")
            .data(newData)
            .enter()
            .append("circle")
              .attr("class", "dot")
              .attr("cx", d => x(d.year))
              .attr("cy", d => y(d.value))
              .attr("r", 0)
              .style("fill", "#e74c3c")
              .on("mouseover", function(event, d) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("r", 8);
                
                tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
                
                tooltip.html(`Year: ${d.year}<br>Temperature Anomaly: ${d.value.toFixed(2)}°C<br>Uncertainty: ±${d.uncertainty.toFixed(2)}°C`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function() {
                d3.select(this)
                  .transition()
                  .duration(500)
                  .attr("r", 5);
                
                tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
              })
              .transition()
              .duration(1000)
              .attr("r", 5);
          
          // Update title if needed
          if (updateTitle) {
            let regionText = "Global";
            if (currentRegion === "northern") regionText = "Northern Hemisphere";
            if (currentRegion === "southern") regionText = "Southern Hemisphere";
            
            chartTitle.text(`${regionText} Temperature Anomalies (1990-2020)`);
          }
        }
  
        // Animation function
        function animateChart() {
          console.log("Animation triggered, current state:", animating);
          
          if (animating) {
            // Stop animation
            clearTimeout(animationTimer);
            animating = false;
            document.getElementById("temp-play").textContent = "Play Animation";
            updateChart(data); // Reset to full data
            return;
          }
          
          // Start animation
          animating = true;
          document.getElementById("temp-play").textContent = "Stop Animation";
          
          // Get year range
          const years = data.map(d => d.year);
          const minYear = Math.min(...years);
          const maxYear = Math.max(...years);
          
          console.log("Animating from", minYear, "to", maxYear);
          
          let currentYear = minYear;
          
          const animationStep = () => {
            if (currentYear <= maxYear && animating) {
              console.log("Animation step:", currentYear);
              const filteredData = data.filter(d => d.year <= currentYear);
              updateChart(filteredData);
              currentYear++;
              animationTimer = setTimeout(animationStep, 300);
            } else {
              animating = false;
              document.getElementById("temp-play").textContent = "Play Animation";
            }
          };
          
          // Start with just the first data point
          updateChart([data[0]]);
          currentYear = minYear + 1;
          animationTimer = setTimeout(animationStep, 300);
        }
  
        // Event listeners for controls
        document.getElementById("temp-play").addEventListener("click", function() {
          console.log("Play button clicked");
          animateChart();
        });
        
        document.getElementById("temp-region").addEventListener("change", function() {
          console.log("Region selection changed to:", this.value);
          currentRegion = this.value;
          
          // Stop any running animation
          if (animating) {
            clearTimeout(animationTimer);
            animating = false;
            document.getElementById("temp-play").textContent = "Play Animation";
          }
          
          // Update data and chart
          data = temperatureData[currentRegion];
          updateChart(data, true);
        });
  
        // Make chart responsive
        function resizeChart() {
          const newWidth = document.getElementById("temperature-chart").offsetWidth - margin.left - margin.right;
          const newHeight = document.getElementById("temperature-chart").offsetHeight - margin.top - margin.bottom;
          
          svg.attr("width", newWidth + margin.left + margin.right)
             .attr("height", newHeight + margin.top + margin.bottom);
          
          x.range([0, newWidth]);
          y.range([newHeight, 0]);
          
          xAxis.attr("transform", `translate(0,${newHeight})`)
               .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
          
          yAxis.call(d3.axisLeft(y));
          
          svg.select(".grid")
             .call(d3.axisLeft(y)
               .tickSize(-newWidth)
               .tickFormat("")
             );
          
          svg.select(".x-label")
             .attr("x", newWidth / 2)
             .attr("y", newHeight + 40);
          
          svg.select(".y-label")
             .attr("x", -newHeight / 2);
          
          svg.select(".chart-title")
             .attr("x", newWidth / 2);
          
          // Update line and area
          temperatureLine.attr("d", line);
          uncertaintyArea.attr("d", area);
          
          // Update dots
          dotsGroup.selectAll(".dot")
             .attr("cx", d => x(d.year))
             .attr("cy", d => y(d.value));
        }
        
        // Add resize listener
        window.addEventListener("resize", resizeChart);
        
        console.log("Temperature chart setup complete");
      })
      .catch(function(error) {
        console.error("Error loading temperature data:", error);
        loadingText.text("Error loading temperature data. Please try refreshing the page.");
      });
  }
  
  // Initialize chart when DOM is loaded
  document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("temperature-chart")) {
      console.log("DOM loaded, initializing temperature chart");
      createTemperatureChart();
    } else {
      console.error("Temperature chart container not found in DOM");
    }
  });