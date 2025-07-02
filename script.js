let budget = 1000;
let purchasedFeatures = new Set();
let headerElement = null;
let footerElement = null;
let adsElements = [];

// YouTube Player API variables
let player = null;
let rickrollTriggered = false;

// YouTube IFrame Player API callback - called when API is ready
function onYouTubeIframeAPIReady() {
  console.log('YouTube IFrame API is ready');
  // If rickroll was already triggered, load the player
  if (rickrollTriggered && !player) {
    loadYouTubePlayer();
  }
}

// Load YouTube player
function loadYouTubePlayer() {
  console.log('Loading YouTube player');
  player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: 'dQw4w9WgXcQ',
    playerVars: {
      'autoplay': 1,
      'controls': 0,
      'showinfo': 0,
      'rel': 0,
      'modestbranding': 1,
      'loop': 1,
      'playlist': 'dQw4w9WgXcQ',
      'fs': 0,
      'disablekb': 1,
      'iv_load_policy': 3
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// Player ready event
function onPlayerReady(event) {
  console.log('Player is ready');
  event.target.playVideo();
  event.target.setVolume(100);
}

// Player state change event
function onPlayerStateChange(event) {
  // If video ends, restart it (backup for loop)
  if (event.data == YT.PlayerState.ENDED) {
    event.target.playVideo();
  }
}

// Update budget display
function updateBudget() {
  const budgetElement = document.getElementById('budgetAmount');
  budgetElement.textContent = `$${budget}`;

  // Add visual feedback for budget changes
  budgetElement.style.transform = 'scale(1.2)';
  budgetElement.style.color = budget < 200 ? '#f44336' : '#4CAF50';

  setTimeout(() => {
    budgetElement.style.transform = 'scale(1)';
  }, 300);
}

// Show modal
function showModal(modalId) {
  console.log('Attempting to show modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; // Force display
    console.log(
      'Modal shown:',
      modalId,
      'Display:',
      modal.style.display,
      'Z-index:',
      window.getComputedStyle(modal).zIndex
    );

    // Special handling for adblocker modal
    if (modalId === 'adblockerModal') {
      modal.style.zIndex = '15000';
      modal.style.background = 'rgba(0, 0, 0, 0.8)';
      console.log('Adblocker modal special styling applied');
    }
  } else {
    console.error('Modal not found:', modalId);
  }
}

// Hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// Show color wheel
function showColorWheel() {
  // Create color wheel overlay
  const colorWheelOverlay = document.createElement('div');
  colorWheelOverlay.id = 'colorWheelOverlay';
  colorWheelOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 12000;
    backdrop-filter: blur(5px);
  `;

  // Create the spinning color wheel
  const colorWheel = document.createElement('div');
  colorWheel.id = 'colorWheel';
  colorWheel.style.cssText = `
    width: 300px;
    height: 300px;
    border-radius: 50%;
    position: relative;
    animation: spinCounterClockwise 3s linear infinite;
    cursor: pointer;
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.3);
    overflow: hidden;
  `;

  // Define color segments
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#01a3a4', '#2e86de',
    '#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#74b9ff', '#00b894'
  ];

  const segmentAngle = 360 / colors.length;

  // Create color segments as proper pie slices
  colors.forEach((color, index) => {
    const segment = document.createElement('div');
    const startAngle = segmentAngle * index;
    const endAngle = segmentAngle * (index + 1);
    
    // Calculate the points for the pie slice
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    
    // Convert angles to radians and adjust for CSS coordinate system
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate the outer points of the slice
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Create the clip path for a proper pie slice
    const clipPath = `polygon(${centerX}% ${centerY}%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
    
    segment.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: ${color};
      clip-path: ${clipPath};
      cursor: pointer;
      transition: transform 0.2s ease;
      transform-origin: center;
    `;
    
    segment.addEventListener('mouseenter', () => {
      segment.style.transform = 'scale(1.05)';
    });
    
    segment.addEventListener('mouseleave', () => {
      segment.style.transform = 'scale(1)';
    });
    
    colorWheel.appendChild(segment);
  });

  // Add center circle (smaller and non-clickable)
  const centerCircle = document.createElement('div');
  centerCircle.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    cursor: default;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    color: #666;
    font-weight: 600;
    transition: all 0.2s ease;
  `;

  colorWheel.appendChild(centerCircle);

  // Add single click listener to the color wheel for accurate click detection
  colorWheel.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Get the bounding rectangle of the color wheel
    const rect = colorWheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate click position relative to center
    const clickX = e.clientX - centerX;
    const clickY = e.clientY - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(clickX * clickX + clickY * clickY);
    const radius = rect.width / 2;
    const innerRadius = 25; // Smaller radius for center circle (was 30)
    
    // Check if click is within the wheel but outside the center circle
    if (distance >= innerRadius && distance <= radius) {
      // Calculate angle (in degrees, adjusted for CSS coordinate system)
      let angle = Math.atan2(clickY, clickX) * 180 / Math.PI;
      // Normalize angle to 0-360 and adjust for our wheel starting position
      angle = (angle + 90 + 360) % 360;
      
      // Determine which color segment was clicked
      const segmentIndex = Math.floor(angle / segmentAngle);
      const selectedColor = colors[segmentIndex];
      
      if (selectedColor) {
        selectColor(selectedColor);
      }
    }
  });

  colorWheelOverlay.appendChild(colorWheel);
  document.body.appendChild(colorWheelOverlay);

  // Close on overlay click (but not wheel click)
  colorWheelOverlay.addEventListener('click', (e) => {
    if (e.target === colorWheelOverlay) {
      closeColorWheel();
    }
  });
}

// Select color from wheel
function selectColor(color) {
  if (budget >= 100) {
    budget -= 100;
    updateBudget();

    // Apply the selected solid color
    document.body.style.background = color;

    // Close the color wheel
    closeColorWheel();

    // Show success message with appropriate text for white
    const colorName = color === '#ffffff' ? 'white background' : 'background color change';
    showSuccessMessage(colorName, 100);
  } else {
    closeColorWheel();
    showModal('brokeModal');
  }
}

// Close color wheel
function closeColorWheel() {
  const colorWheelOverlay = document.getElementById('colorWheelOverlay');
  if (colorWheelOverlay) {
    colorWheelOverlay.remove();
  }
}

// Buy GUI function
function buyGUI() {
  if (budget >= 50) {
    budget -= 50;
    updateBudget();

    // Hide initial modal
    hideModal('modalOverlay');
    hideModal('declineModal');

    // Show left panel
    const leftPanel = document.getElementById('leftPanel');
    const mainContent = document.getElementById('mainContent');

    leftPanel.classList.add('visible');
    mainContent.classList.add('with-panel');

    // Add some celebratory effect
    confetti();
  } else {
    showModal('brokeModal');
  }
}

// Decline GUI
function declineGUI() {
  hideModal('modalOverlay');
  showModal('declineModal');
}

// Stay with blank screen
function stayBlank() {
  hideModal('declineModal');

  // Change the main content to be even more boring
  const emptyState = document.querySelector('.empty-state');
  emptyState.innerHTML = `
    <div style="font-size: 1.5em; opacity: 0.5;">
      You chose the blank screen experience.<br>
      <span style="font-size: 0.8em;">Enjoy the void. 🕳️</span>
    </div>
  `;
}

// Rickroll function - FINAL FULLSCREEN VERSION with YouTube API
function rickrollUser() {
  rickrollTriggered = true;
  
  // Create fullscreen rickroll overlay that covers everything
  const rickrollOverlay = document.createElement('div');
  rickrollOverlay.id = 'rickrollOverlay';
  rickrollOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: rickrollFadeIn 1s ease;
    overflow: hidden;
  `;

  // Create the player div for YouTube API
  const playerDiv = document.createElement('div');
  playerDiv.id = 'player';
  playerDiv.style.cssText = `
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  `;

  // Create the message overlay
  const message = document.createElement('div');
  message.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 4em;
    font-weight: bold;
    text-align: center;
    animation: rickrollPulse 2s infinite;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    z-index: 100000;
    pointer-events: none;
  `;
  message.innerHTML = '<span style="font-size: 0.4em;">Never gonna give you up!</span>';

  // Add elements to overlay
  rickrollOverlay.appendChild(playerDiv);
  rickrollOverlay.appendChild(message);

  // Add CSS animations
  const rickrollStyle = document.createElement('style');
  rickrollStyle.textContent = `
    @keyframes rickrollFadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes rickrollPulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); color: white; }
      50% { transform: translate(-50%, -50%) scale(1.1); color: #ff6b6b; }
    }
  `;
  document.head.appendChild(rickrollStyle);

  // Add to page
  document.body.appendChild(rickrollOverlay);

  // Disable all page interactions
  document.body.style.overflow = 'hidden';
  
  // Prevent escape key, right-click, etc.
  document.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, true);

  // Hide the message after 5 seconds to let the video play unobstructed
  setTimeout(() => {
    if (message.parentNode) {
      message.style.opacity = '0';
      message.style.transition = 'opacity 2s ease';
    }
  }, 5000);

  // Load the YouTube player if API is ready
  if (typeof YT !== 'undefined' && YT.Player) {
    loadYouTubePlayer();
  }
  // If API isn't ready yet, onYouTubeIframeAPIReady will handle it
}

// Buy feature function
function buyFeature(featureType, cost) {
  // Special handling for background color - show color wheel
  if (featureType === 'bgcolor') {
    showColorWheel();
    return;
  }

  // Special handling for font - charge per click
  if (featureType === 'font') {
    // Check if user has header or footer
    if (!headerElement && !footerElement) {
      // Show error message instead of charging
      const message = document.createElement('div');
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(244, 67, 54, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 2000;
        text-align: center;
        max-width: 350px;
      `;
      message.innerHTML = '❌ No Elements!<br><span style="font-size: 0.8em;">Add a Header or Footer first before changing fonts!</span>';

      document.body.appendChild(message);

      setTimeout(() => {
        message.remove();
      }, 4000);
      
      return; // Exit without charging
    }

    if (budget >= cost) {
      budget -= cost;
      updateBudget();
      
      // Apply random font to header and footer only
      const fonts = [
        'Comic Sans MS', 
        'monospace', 
        'Impact', 
        'Papyrus', 
        'Wingdings', 
        'Courier New',
        'Trebuchet MS',
        'Verdana',
        'cursive'
      ];
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      
      // Apply to header if it exists
      if (headerElement) {
        headerElement.style.fontFamily = randomFont;
      }
      
      // Apply to footer if it exists
      if (footerElement) {
        footerElement.style.fontFamily = randomFont;
      }
      
      // Show success message for this click
      showSuccessMessage(`font change to ${randomFont}`, cost);
      
      // Don't disable the button - allow multiple clicks!
      return;
    } else {
      showModal('brokeModal');
      return;
    }
  }

  // Original logic for other features
  if (budget >= cost) {
    budget -= cost;
    updateBudget();
    purchasedFeatures.add(featureType);

    // Disable the button for non-bgcolor and non-font features
    const button = event.target;
    button.disabled = true;
    button.textContent = 'Purchased ✓';
    button.style.background = '#ccc';

    // Add the feature effect
    addFeatureEffect(featureType);

    // Show sarcastic success message
    showSuccessMessage(featureType, cost);
  } else {
    showModal('brokeModal');
  }
}

// Add feature effects
function addFeatureEffect(featureType) {
  const mainContent = document.getElementById('mainContent');

  switch (featureType) {
    case 'watermark':
      
      // Target the .logo element that has the gradient animation
      const logoElement = document.querySelector('.logo');
      if (logoElement) {
        // Remove all gradient styling and animation completely
        logoElement.style.background = 'none';
        logoElement.style.backgroundImage = 'none';
        logoElement.style.webkitBackgroundClip = 'text';
        logoElement.style.webkitTextFillColor = 'rgba(255, 255, 255, 0.25)';
        logoElement.style.animation = 'none';
        logoElement.style.color = 'rgba(255, 255, 255, 0.25)';
        logoElement.style.opacity = '0.25';
        logoElement.style.transition = 'all 1s ease';
        
        // Force override any CSS animations by adding !important styles
        logoElement.style.setProperty('animation', 'none', 'important');
        logoElement.style.setProperty('background', 'none', 'important');
        logoElement.style.setProperty('background-image', 'none', 'important');
      }

      // Also target the tagline element with id="watermark"
      const taglineElement = document.getElementById('watermark');
      if (taglineElement) {
        taglineElement.style.opacity = '0.25';
        taglineElement.style.transition = 'all 1s ease';
      }

      // Wait 3 seconds then ask about removing watermark footprint
      setTimeout(() => {
        showModal('watermarkFootprintModal');
      }, 3000);
      
      break;

    case 'bgcolor':
      // This is now handled by the color wheel
      break;

    case 'header':
      createFallingHeader();
      break;

    case 'footer':
      createDriftingFooter();
      break;

    case 'font':
      // This case is now handled in buyFeature function
      break;

    case 'monetize':
      showModal('monetizeModal');
      break;

    case 'undo':
      const undoBtn = document.createElement('button');
      undoBtn.textContent = 'Undo (Does Nothing)';
      undoBtn.style.cssText =
        'position: fixed; bottom: 20px; left: 20px; padding: 10px 20px; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer;';
      undoBtn.onclick = () =>
        alert('😂 Did you really think the undo button would work?');
      document.body.appendChild(undoBtn);
      break;

    case 'save':
      // RICKROLL THE USER! 🎵 - FINAL FULLSCREEN VERSION with YouTube API
      rickrollUser();
      break;
  }
}

// Remove watermark footprint completely
function removeWatermarkFootprint() {
  if (budget >= 75) {
    budget -= 75;
    updateBudget();
    hideModal('watermarkFootprintModal');

    // Target the .logo element and make it completely invisible
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
      logoElement.style.opacity = '0';
      logoElement.style.transition = 'all 1s ease';
    }

    // Also target the tagline element and make it completely invisible
    const taglineElement = document.getElementById('watermark');
    if (taglineElement) {
      taglineElement.style.opacity = '0';
      taglineElement.style.transition = 'all 1s ease';
    }

    // Show success message
    showSuccessMessage('watermark footprint removal', 75);
  } else {
    hideModal('watermarkFootprintModal');
    showModal('brokeModal');
  }
}

// Keep watermark footprint
function keepWatermarkFootprint() {
  hideModal('watermarkFootprintModal');

  // Show a sarcastic message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 152, 0, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
  `;
  message.innerHTML =
    '🤷‍♂️ Fair enough!';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Create drifting footer
function createDriftingFooter() {
  footerElement = document.createElement('div');
  footerElement.id = 'driftingFooter';
  footerElement.innerHTML = `
    <div class="footer-content">
      <p>🏴‍☠️ Your Footer - Now Sailing Away! ⛵</p>
      <p style="font-size: 0.8em;">© 2024 Your Website - Lost at Sea</p>
    </div>
  `;
  footerElement.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(45deg, #2c3e50, #34495e);
    color: white;
    padding: 20px;
    text-align: center;
    z-index: 400;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
    animation: footerDrift 15s linear forwards;
    border-top: 3px solid #3498db;
  `;

  document.body.appendChild(footerElement);

  // Add CSS animation for drifting
  const style = document.createElement('style');
  style.textContent = `
    @keyframes footerDrift {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(100vw);
      }
    }
    
    @keyframes anchorDrop {
      0% {
        transform: translateY(-100px);
        opacity: 0;
      }
      50% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes chainDrop {
      0% {
        height: 0;
        opacity: 0;
      }
      100% {
        height: 60px;
        opacity: 1;
      }
    }
    
    @keyframes footerStop {
      0% {
        transform: translateX(var(--current-position));
      }
      100% {
        transform: translateX(var(--current-position));
      }
    }
  `;
  document.head.appendChild(style);

  // Show anchor modal after footer starts drifting
  setTimeout(() => {
    showModal('footerAnchorModal');
  }, 3000);
}

// Anchor footer
function anchorFooter() {
  if (budget >= 75) {
    budget -= 75;
    updateBudget();
    hideModal('footerAnchorModal');

    if (footerElement) {
      // Get current position of footer
      const currentTransform = window.getComputedStyle(footerElement).transform;
      const matrix = new DOMMatrix(currentTransform);
      const currentX = matrix.m41;

      // Stop the drifting animation
      footerElement.style.animation = 'none';
      footerElement.style.transform = `translateX(${currentX}px)`;

      // Create chain first (so it appears behind the anchor and over the footer)
      const chain = document.createElement('div');
      chain.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: calc(10% + ${currentX}px);
        width: 4px;
        height: 60px;
        background: repeating-linear-gradient(
          to bottom,
          #8B4513 0px,
          #8B4513 8px,
          #A0522D 8px,
          #A0522D 16px
        );
        z-index: 450;
        animation: chainDrop 1.5s ease-out;
        border-radius: 2px;
      `;

      // Create anchor flush with bottom of screen, aligned with chain
      const anchor = document.createElement('div');
      anchor.innerHTML = '⚓';
      anchor.style.cssText = `
        position: fixed;
        bottom: 0px;
        left: calc(10% + ${currentX}px - 35px);
        font-size: 3em;
        z-index: 500;
        animation: anchorDrop 1s ease-out;
        transform-origin: center;
      `;

      document.body.appendChild(chain);
      document.body.appendChild(anchor);

      // Update footer content
      footerElement.querySelector('.footer-content').innerHTML = `
        <p>⚓ Your Footer - Now Properly Anchored! 🎉</p>
        <p style="font-size: 0.8em;">© 2024 Your Website - Safe in Harbor</p>
      `;

      // Show success message
      showSuccessMessage('footer anchor', 75);

      // Add some water splash effect at the very bottom
      setTimeout(() => {
        createWaterSplash(currentX);
      }, 1000);
    }
  } else {
    hideModal('footerAnchorModal');
    showModal('brokeModal');
  }
}

// Let footer drift away
function letFooterDrift() {
  hideModal('footerAnchorModal');

  // Add a sarcastic message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(52, 152, 219, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
  `;
  message.innerHTML =
    '🌊 Bon voyage!<br><span style="font-size: 0.8em;">Your footer is now exploring the digital ocean!</span>';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 4000);

  // Update footer content to be more nautical
  if (footerElement) {
    footerElement.querySelector('.footer-content').innerHTML = `
      <p>🏴‍☠️ Ahoy! Footer Sailing Away! ⛵</p>
      <p style="font-size: 0.8em;">© 2024 Your Website - Adventure Awaits!</p>
    `;

    // Remove the footer completely after it has drifted off-screen
    // The animation takes 15 seconds, so we'll remove it after 16 seconds
    setTimeout(() => {
      if (footerElement && footerElement.parentNode) {
        footerElement.remove();
        footerElement = null; // Clear the reference
      }
    }, 16000); // 16 seconds - slightly longer than the 15s animation
  }
}

// Create water splash effect - now flush with bottom of screen
function createWaterSplash(anchorX) {
  for (let i = 0; i < 20; i++) {
    const splash = document.createElement('div');
    splash.innerHTML = '💧';
    splash.style.cssText = `
      position: fixed;
      bottom: 0px;
      left: calc(10% + ${anchorX + (Math.random() - 0.5) * 60}px);
      font-size: ${Math.random() * 1.5 + 0.5}em;
      z-index: 480;
      animation: splashEffect ${Math.random() * 1 + 0.5}s ease-out forwards;
      pointer-events: none;
    `;

    document.body.appendChild(splash);

    setTimeout(() => {
      if (splash.parentNode) {
        splash.remove();
      }
    }, 1500);
  }

  // Add splash animation
  const splashStyle = document.createElement('style');
  splashStyle.textContent = `
    @keyframes splashEffect {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(-50px) scale(0.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(splashStyle);
}

// Create falling header
function createFallingHeader() {
  headerElement = document.createElement('div');
  headerElement.id = 'fallingHeader';
  headerElement.innerHTML = '<h1>🎉 Your Amazing Header! 🎉</h1>';
  headerElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    font-size: 1.2em;
    text-align: center;
    z-index: 500;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: headerFall 3s ease-in-out forwards;
  `;

  document.body.appendChild(headerElement);

  // Add CSS animation for falling (no rotation)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes headerFall {
      0% {
        top: 0;
        transform: translateX(-50%);
      }
      100% {
        top: calc(100vh - 100px);
        transform: translateX(-50%);
      }
    }
  `;
  document.head.appendChild(style);

  // Show pin modal after header falls
  setTimeout(() => {
    showModal('headerPinModal');
  }, 3500);
}

// Pin header to top
function pinHeader() {
  if (budget >= 50) {
    budget -= 50;
    updateBudget();
    hideModal('headerPinModal');

    if (headerElement) {
      headerElement.style.animation = 'none';
      headerElement.style.top = '0';
      headerElement.style.position = 'fixed';
      headerElement.style.transform = 'translateX(-50%)';

      // Add success message
      showSuccessMessage('header pin', 50);

      // Add a subtle bounce effect
      headerElement.style.animation = 'headerBounce 0.5s ease';

      const bounceStyle = document.createElement('style');
      bounceStyle.textContent = `
        @keyframes headerBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `;
      document.head.appendChild(bounceStyle);
    }
  } else {
    hideModal('headerPinModal');
    showModal('brokeModal');
  }
}

// Keep header at bottom
function keepHeaderAtBottom() {
  hideModal('headerPinModal');

  // Add a sarcastic message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 152, 0, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
  `;
  message.innerHTML =
    '🤷‍♂️ Well, that\'s... unconventional!';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 4000);
}

// Add tiny ad (for saying YES to monetization)
function addTinyAd() {
  hideModal('monetizeModal');

  const tinyAd = document.createElement('div');
  tinyAd.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 25px;
    height: 35px;
    color: white;
    font-size: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    z-index: 100;
    text-align: center;
    cursor: pointer;
  `;
  tinyAd.innerHTML = '📱<br>Tiny<br>Ad';
  tinyAd.onclick = () => alert('💰 You earned $0.001! Keep clicking!');

  document.body.appendChild(tinyAd);

  // Show success message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
  `;
  message.innerHTML =
    '✨ aww<br><span style="font-size: 0.8em;">What a cute little ad.</span>';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Add many ads (for saying NO to monetization)
function addManyAds() {
  console.log('addManyAds called');
  hideModal('monetizeModal');

  // Clear any existing ads first
  adsElements.forEach((ad) => {
    if (ad && ad.parentNode) {
      ad.parentNode.removeChild(ad);
    }
  });
  adsElements = [];

  // Create multiple ads of different sizes and shapes
  const adConfigs = [
    {
      width: '200px',
      height: '150px',
      top: '10%',
      right: '10px',
      content: '🎮<br>PLAY NOW!<br>FREE GAME!',
    },
    {
      width: '150px',
      height: '300px',
      top: '30%',
      left: '370px', // Moved to the right to avoid GUI panel (was '10px')
      content: '💊<br>DOCTORS<br>HATE THIS<br>ONE TRICK!',
    },
    {
      width: '300px',
      height: '100px',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      content: '🚗 CAR INSURANCE - SAVE 90%! CLICK NOW!',
    },
    {
      width: '120px',
      height: '120px',
      top: '20%',
      right: '220px',
      content: '💰<br>MAKE<br>$5000<br>TODAY!',
    },
    {
      width: '180px',
      height: '80px',
      top: '60%',
      right: '50px',
      content: '🏠 REFINANCE NOW!',
    },
    {
      width: '100px',
      height: '200px',
      bottom: '200px',
      right: '10px',
      content: '📱<br>NEW<br>iPHONE<br>FREE!',
    },
    {
      width: '250px',
      height: '60px',
      top: '5px',
      left: '50%',
      transform: 'translateX(-50%)',
      content: '🎯 TARGETED ADS WORK BETTER - CLICK HERE!',
    },
  ];

  adConfigs.forEach((config, index) => {
    setTimeout(() => {
      const ad = document.createElement('div');
      ad.className = 'annoying-ad';
      ad.style.cssText = `
        position: fixed;
        width: ${config.width};
        height: ${config.height};
        ${config.top ? `top: ${config.top};` : ''}
        ${config.bottom ? `bottom: ${config.bottom};` : ''}
        ${config.left ? `left: ${config.left};` : ''}
        ${config.right ? `right: ${config.right};` : ''}
        ${config.transform ? `transform: ${config.transform};` : ''}
        background: linear-gradient(45deg, ${getRandomColor()}, ${getRandomColor()});
        color: white;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        z-index: 200;
        text-align: center;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        animation: adPulse 2s infinite;
        border: 2px solid rgba(255, 255, 255, 0.3);
      `;
      ad.innerHTML = config.content;
      ad.onclick = () =>
        alert('🎉 Congratulations! You clicked an ad!');

      document.body.appendChild(ad);
      adsElements.push(ad);
      console.log('Ad added:', index);
    }, index * 500);
  });

  // Add pulsing animation for ads
  const adStyle = document.createElement('style');
  adStyle.textContent = `
    @keyframes adPulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    
    @keyframes vigorousShake {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      10% { transform: translate(-5px, -5px) rotate(-2deg); }
      20% { transform: translate(5px, -5px) rotate(2deg); }
      30% { transform: translate(-5px, 5px) rotate(-2deg); }
      40% { transform: translate(5px, 5px) rotate(2deg); }
      50% { transform: translate(-3px, -3px) rotate(-1deg); }
      60% { transform: translate(3px, -3px) rotate(1deg); }
      70% { transform: translate(-3px, 3px) rotate(-1deg); }
      80% { transform: translate(3px, 3px) rotate(1deg); }
      90% { transform: translate(-1px, -1px) rotate(-0.5deg); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(adStyle);

  // Show "punishment" message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(244, 67, 54, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
    max-width: 300px;
  `;
  message.innerHTML =
    '😈 <span style="font-size: 0.8em;">You won\'t monitize for you.</span><br><span style="font-size: 0.8em;">We will monitize for us!</span>';

  document.body.appendChild(message);

  console.log('Setting timeout for adblocker modal');

  // Show adblocker modal after all ads have appeared and users have time to read them
  setTimeout(() => {
    console.log('Removing punishment message and showing adblocker modal');
    message.remove();

    // Show the adblocker modal after users have had time to experience all the ads
    console.log('About to show adblocker modal');
    console.log(
      'Current modal element:',
      document.getElementById('adblockerModal')
    );
    showModal('adblockerModal');
  }, 8000);
}

// Buy adblocker
function buyAdblocker() {
  if (budget >= 250) {
    budget -= 250;
    updateBudget();
    hideModal('adblockerModal');

    // Remove all ads
    adsElements.forEach((ad) => {
      if (ad && ad.parentNode) {
        ad.parentNode.removeChild(ad);
      }
    });
    adsElements = [];

    // Also remove any ads by class name
    const allAds = document.querySelectorAll('.annoying-ad');
    allAds.forEach((ad) => ad.remove());

    // Show success message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(76, 175, 80, 0.95);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 2000;
      text-align: center;
    `;
    message.innerHTML =
      '🛡️ AdBlocker™ activated!<br><span style="font-size: 0.8em;">All ads removed!</span>';

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 4000);

    // Show sarcastic success message
    showSuccessMessage('AdBlocker™', 250);
  } else {
    hideModal('adblockerModal');
    showModal('brokeModal');
  }
}

// Live with ads - now with vigorous shaking and duplication!
function liveWithAds() {
  hideModal('adblockerModal');

  // Show a sarcastic message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 152, 0, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    text-align: center;
  `;
  message.innerHTML =
    '🤷‍♂️ Your choice!';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);

  // After 3 seconds, start the vigorous shaking and duplication sequence
  setTimeout(() => {
    startAdChaos();
  }, 3000);
}

// Start the ad chaos sequence
function startAdChaos() {
  console.log('Starting ad chaos sequence');
  
  // Get all current ads
  const currentAds = [...adsElements];
  
  if (currentAds.length === 0) {
    console.log('No ads found to shake');
    return;
  }

  // Start with the first ad
  let adIndex = 0;
  
  function shakeAndDuplicateNextAd() {
    if (adIndex >= currentAds.length) {
      console.log('All ads have been processed');
      return;
    }

    const ad = currentAds[adIndex];
    if (!ad || !ad.parentNode) {
      console.log('Ad not found or already removed, skipping');
      adIndex++;
      setTimeout(shakeAndDuplicateNextAd, 1000);
      return;
    }

    console.log('Shaking and duplicating ad', adIndex);
    
    // Make the ad shake vigorously for 1 second (reduced from 2 seconds)
    ad.style.animation = 'vigorousShake 0.5s infinite';
    
    // After 1 second of shaking, duplicate it
    setTimeout(() => {
      if (ad && ad.parentNode) {
        // Stop shaking the original
        ad.style.animation = 'adPulse 2s infinite';
        
        // Create a duplicate
        const duplicate = ad.cloneNode(true);
        
        // Get the original ad's position
        const rect = ad.getBoundingClientRect();
        
        // Generate larger random offsets for x and y
        const randomOffsetX = (Math.random() - 0.5) * 200; // -100px to +100px
        const randomOffsetY = (Math.random() - 0.5) * 200; // -100px to +100px
        
        // Position the duplicate with larger random offset
        duplicate.style.left = (rect.left + randomOffsetX) + 'px';
        duplicate.style.top = (rect.top + randomOffsetY) + 'px';
        duplicate.style.right = 'auto';
        duplicate.style.bottom = 'auto';
        duplicate.style.transform = 'none';
        
        // Remove red styling - duplicates now look like normal ads
        duplicate.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        duplicate.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        
        // Add the duplicate to the page and track it
        document.body.appendChild(duplicate);
        adsElements.push(duplicate);
        
        console.log('Duplicate created for ad', adIndex);
      }
      
      // Move to next ad
      adIndex++;
      if (adIndex < currentAds.length) {
        setTimeout(shakeAndDuplicateNextAd, 250);
      }
    }, 250); // Reduced from 2000ms to 1000ms
  }
  
  // Start the sequence
  shakeAndDuplicateNextAd();
}

// Show success message - now positioned below budget counter
function showSuccessMessage(featureType, cost) {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
    animation: slideInFromRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
    max-width: 300px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  `;
  message.textContent = `🎉 You spent $${cost} on ${featureType}! Money well spent! 💸`;

  document.body.appendChild(message);

  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
    }
  }, 3000);

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      0% { 
        opacity: 0; 
        transform: translateX(100%); 
      }
      100% { 
        opacity: 1; 
        transform: translateX(0); 
      }
    }
    @keyframes fadeOut {
      0% { 
        opacity: 1; 
        transform: translateX(0); 
      }
      100% { 
        opacity: 0; 
        transform: translateX(100%); 
      }
    }
  `;
  document.head.appendChild(style);
}

// Add funds
function addFunds() {
  budget += 500;
  updateBudget();
  hideModal('brokeModal');

  // Show sarcastic message
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(33, 150, 243, 0.95);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 2000;
  `;
  message.textContent = '💳 $500 added! Thanks for your "donation"! 😏';

  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3000);
}

// Close broke modal
function closeBrokeModal() {
  hideModal('brokeModal');
}

// Utility functions
function getRandomColor() {
  const colors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#f7b731',
    '#5f27cd',
    '#00d2d3',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Enhanced confetti effect with random falling patterns
function confetti() {
  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement('div');

    // Random starting position across the screen width
    const startX = Math.random() * 100;
    // Random horizontal drift during fall
    const driftX = (Math.random() - 0.5) * 30; // -15 to +15 vw drift
    // Random rotation speed
    const rotationSpeed = Math.random() * 720 + 360; // 360-1080 degrees
    // Random fall duration
    const fallDuration = Math.random() * 2 + 2; // 2-4 seconds
    // Random delay for staggered effect
    const delay = Math.random() * 1; // 0-1 second delay

    confettiPiece.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${getRandomColor()};
      left: ${startX}vw;
      top: -10px;
      z-index: 9999;
      animation: confettiFall${i} ${fallDuration}s linear ${delay}s forwards;
    `;

    // Create unique animation for each piece
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall${i} {
        0% {
          top: -10px;
          left: ${startX}vw;
          transform: rotate(0deg);
          opacity: 1;
        }
        100% {
          top: 100vh;
          left: ${startX + driftX}vw;
          transform: rotate(${rotationSpeed}deg);
          opacity: 0.3;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(confettiPiece);

    // Clean up after animation completes
    setTimeout(() => {
      if (confettiPiece.parentNode) {
        confettiPiece.remove();
      }
      if (style.parentNode) {
        style.remove();
      }
    }, (fallDuration + delay) * 1000 + 500);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  console.log('Page loaded, initializing modals');

  // Hide all modals initially
  hideModal('modalOverlay');
  hideModal('declineModal');
  hideModal('brokeModal');
  hideModal('headerPinModal');
  hideModal('footerAnchorModal');
  hideModal('monetizeModal');
  hideModal('adblockerModal');
  hideModal('watermarkFootprintModal');

  // Show the initial modal after 3 seconds to let users read the content
  setTimeout(() => {
    showModal('modalOverlay');
  }, 4000);
});