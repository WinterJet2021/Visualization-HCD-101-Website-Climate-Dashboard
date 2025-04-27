// main.js
// Main JavaScript file for Climate Dashboard

document.addEventListener("DOMContentLoaded", function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize section visibility
    showActiveSection();
    
    // Add scroll-to-top button
    addScrollToTopButton();
    
    // Check browser compatibility
    checkBrowserCompatibility();
  });
  
  // Initialize smooth scrolling navigation
  function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get target section id from href
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Scroll to target section
        if (targetSection) {
          targetSection.scrollIntoView({ 
            behavior: 'smooth'
          });
          
          // Update URL without page reload
          history.pushState(null, null, targetId);
          
          // Update active link
          updateActiveLink(targetId);
        }
      });
    });
    
    // Handle initial hash on page load
    if (window.location.hash) {
      updateActiveLink(window.location.hash);
    } else {
      // Default to first section
      updateActiveLink('#intro');
    }
    
    // Handle scroll events to update active link
    window.addEventListener('scroll', function() {
      const sections = document.querySelectorAll('section');
      let currentSection = '#intro';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop - 100 && 
            window.pageYOffset < sectionTop + sectionHeight - 100) {
          currentSection = '#' + section.getAttribute('id');
        }
      });
      
      updateActiveLink(currentSection);
    });
  }
  
  // Update active link in navigation
  function updateActiveLink(sectionId) {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === sectionId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Show active section based on URL hash
  function showActiveSection() {
    const hash = window.location.hash || '#intro';
    const targetSection = document.querySelector(hash);
    
    if (targetSection) {
      targetSection.scrollIntoView();
    }
  }
  
  // Add scroll-to-top button
  function addScrollToTopButton() {
    // Create button element
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scroll-top';
    scrollButton.innerHTML = '&#9650;';
    scrollButton.title = 'Scroll to top';
    
    // Add button styles
    scrollButton.style.position = 'fixed';
    scrollButton.style.bottom = '20px';
    scrollButton.style.right = '20px';
    scrollButton.style.width = '50px';
    scrollButton.style.height = '50px';
    scrollButton.style.borderRadius = '50%';
    scrollButton.style.backgroundColor = '#3498db';
    scrollButton.style.color = 'white';
    scrollButton.style.border = 'none';
    scrollButton.style.fontSize = '20px';
    scrollButton.style.cursor = 'pointer';
    scrollButton.style.display = 'none';
    scrollButton.style.zIndex = '1000';
    
    // Add button to page
    document.body.appendChild(scrollButton);
    
    // Add scroll event listener to show/hide button
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollButton.style.display = 'block';
      } else {
        scrollButton.style.display = 'none';
      }
    });
    
    // Add click event listener to scroll to top
    scrollButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Check browser compatibility with required features
  function checkBrowserCompatibility() {
    const incompatibleFeatures = [];
    
    // Check for ES6 support
    try {
      eval('let foo = (x) => x + 1');
    } catch (e) {
      incompatibleFeatures.push('Modern JavaScript (ES6)');
    }
    
    // Check for Fetch API
    if (!window.fetch) {
      incompatibleFeatures.push('Fetch API');
    }
    
    // Check for SVG support
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
      incompatibleFeatures.push('SVG');
    }
    
    // Display warning if incompatible features found
    if (incompatibleFeatures.length > 0) {
      const warningDiv = document.createElement('div');
      warningDiv.className = 'browser-warning';
      warningDiv.style.padding = '10px';
      warningDiv.style.background = '#fff3cd';
      warningDiv.style.color = '#856404';
      warningDiv.style.borderRadius = '4px';
      warningDiv.style.margin = '10px 0';
      warningDiv.style.textAlign = 'center';
      
      warningDiv.innerHTML = `
        <p><strong>Warning:</strong> Your browser may not support all features of this dashboard.</p>
        <p>Missing features: ${incompatibleFeatures.join(', ')}</p>
        <p>Please consider updating your browser for the best experience.</p>
      `;
      
      document.body.insertBefore(warningDiv, document.body.firstChild);
    }
  }
  
  // Function to handle errors in visualization loading
  function handleVisualizationError(containerId, error) {
    console.error(`Error loading visualization in ${containerId}:`, error);
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="error-message" style="padding: 20px; text-align: center; color: #721c24; background-color: #f8d7da; border-radius: 4px;">
          <h3>Visualization Error</h3>
          <p>Sorry, we encountered an error loading this visualization.</p>
          <p>Please try refreshing the page or check your browser compatibility.</p>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }