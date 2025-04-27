// policy-wordcloud.js
// D3.js visualization for climate policy text analysis

// Create policy word cloud
function createPolicyWordCloud() {
    // Set dimensions
    const margin = {top: 20, right: 20, bottom: 20, left: 20};
    const width = document.getElementById("policy-wordcloud").offsetWidth - margin.left - margin.right;
    const height = document.getElementById("policy-wordcloud").offsetHeight - margin.top - margin.bottom;
  
    // Clear previous content
    d3.select("#policy-wordcloud").html("");
  
    // Create SVG
    const svg = d3.select("#policy-wordcloud")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left + width/2},${margin.top + height/2})`);
  
    // Add loading indicator
    const loadingText = svg.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .text("Loading data...");
  
    // Initial settings
    let source = "paris";
    let words = [];
  
    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);
  
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    // Load policy word data
    d3.json("data/policy-words.json")
      .then(function(policyWords) {
        // Remove loading indicator
        loadingText.remove();
        
        // Set initial words
        words = policyWords[source];
  
        // Function to draw word cloud
        function drawWordCloud(words) {
          // Calculate appropriate font sizes
          const maxSize = d3.max(words, d => d.size);
          const minSize = d3.min(words, d => d.size);
          const fontScale = d3.scaleLinear()
            .domain([minSize, maxSize])
            .range([10, 60]); // Min and max font sizes
          
          words.forEach(d => {
            d.fontSize = fontScale(d.size);
          });
          
          // Create cloud layout
          const layout = d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Arial")
            .fontSize(d => d.fontSize)
            .on("end", cloudDraw);
          
          // Generate the word cloud
          layout.start();
          
          // Function to draw the word cloud
          function cloudDraw(cloudWords) {
            // Clear previous words
            svg.selectAll("text").remove();
            
            // Add words
            svg.selectAll("text")
              .data(cloudWords)
              .enter()
              .append("text")
                .style("font-size", d => `${d.size / 2}px`)
                .style("font-family", "Arial")
                .style("fill", (d, i) => color(i))
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .text(d => d.text)
                .on("mouseover", function(event, d) {
                  d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size", `${d.size / 1.5}px`)
                    .style("font-weight", "bold");
                  
                  tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                  
                  tooltip.html(`Term: "${d.text}"<br>Frequency: ${d.size}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(event, d) {
                  d3.select(this)
                    .transition()
                    .duration(500)
                    .style("font-size", `${d.size / 2}px`)
                    .style("font-weight", "normal");
                  
                  tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                })
                .on("click", function(event, d) {
                  // In a real app, this could show related terms or document excerpts
                  console.log(`Clicked on "${d.text}" with frequency ${d.size}`);
                });
          }
        }
  
        // Initial draw
        drawWordCloud(words);
  
        // Add event listener for source selection
        document.getElementById("policy-source").addEventListener("change", function() {
          source = this.value;
          words = policyWords[source];
          drawWordCloud(words);
        });
  
        // Make word cloud responsive
        function resizeWordCloud() {
          const newWidth = document.getElementById("policy-wordcloud").offsetWidth - margin.left - margin.right;
          const newHeight = document.getElementById("policy-wordcloud").offsetHeight - margin.top - margin.bottom;
          
          d3.select("#policy-wordcloud svg")
            .attr("width", newWidth + margin.left + margin.right)
            .attr("height", newHeight + margin.top + margin.bottom);
          
          svg.attr("transform", `translate(${margin.left + newWidth/2},${margin.top + newHeight/2})`);
          
          // Redraw word cloud
          drawWordCloud(words);
        }
        
        // Add resize listener
        window.addEventListener("resize", resizeWordCloud);
      })
      .catch(function(error) {
        console.error("Error loading policy word data:", error);
        loadingText.text("Error loading data. Please try refreshing the page.");
      });
  }
  
  // Initialize word cloud when DOM is loaded
  document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("policy-wordcloud")) {
      createPolicyWordCloud();
    }
  });