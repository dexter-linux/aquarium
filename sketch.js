// Harshdeep Singh
// Fish animation
let fish = []; // Array to store all fish objects
let plants = []; // Array for bottom plants
let creatures = []; // Array for other creatures like turtles, octopuses
let paused = false; // Flag to control animation pause/resume
let messages = []; // Array to store temporary messages
let bgMusic;

function preload() {
  bgMusic = loadSound('song.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas size as per requirements
  
  // Spawn initial 10 fish at random positions
  resetAquarium();
  
  // Run minimum tests
  arrayTest(10);
  boundaryTest();
  
  bgMusic.loop(); // Play background music on repeat
  
  // Add some plants at the bottom
  for (let i = 0; i < 5; i++) {
    plants.push({
      x: random(50, width - 50),
      baseY: height,
      height: random(50, 100),
      segments: 5,
      swayAngle: random(PI / 12, PI / 6),
      color: color(random(0, 50), random(150, 200), random(0, 50))
    });
  }
  
  // Add a few other creatures (not too crowded, e.g., 1 turtle, 1 octopus, 1 starfish)
  creatures.push(createTurtle(random(width / 2), height - 50)); // Turtle
  creatures.push(createOctopus(random(width / 2, width), height - 80)); // Octopus
  creatures.push(createStarfish(random(100, width - 100), height - 30)); // Starfish
}

function draw() {
  background(135, 206, 235); // Light blue background for water
  
  // Draw sandy bottom
  fill(194, 178, 128);
  noStroke();
  rect(0, height - 30, width, 30);
  
  renderPlants();
  renderCreatures();
  
  if (!paused) {
    updateFish(); // Update fish positions only if not paused
    updateMessages(); // Update messages
    updateCreatures(); // Update other creatures
  }
  
  renderFish(); // Render all fish
  renderMessages(); // Render messages
  renderHUD(); // Render heads-up display
}

function spawnFish(x, y) {
  let vx = random(-5, 5);
  let vy = random(-5, 5);
  
  // Cap maximum speed to 5 px/frame to avoid tunneling
  let speed = sqrt(vx * vx + vy * vy);
  if (speed > 5) {
    vx = (vx / speed) * 5;
    vy = (vy / speed) * 5;
  }
  
  let newFish = {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    size: random(20, 40), // Random size in small range for variety
    colour: color(random(180, 255), random(180, 255), random(180, 255)), // Random pastel color
    wiggle: 0, // For dynamic wiggling
    wiggleSpeed: random(0.1, 0.2)
  };
  
  fish.push(newFish); // Add to fish array
}

function updateFish() {
  for (let f of fish) {
    f.x += f.vx;
    f.y += f.vy;
    
    // Bounce off walls
    if (f.x < 0 || f.x > width) {
      f.vx *= -1;
    }
    if (f.y < 0 || f.y > height - 30) { // Avoid bottom sandy area
      f.vy *= -1;
    }
    
    // Constrain positions to prevent clipping/sticking
    f.x = constrain(f.x, 0, width);
    f.y = constrain(f.y, 0, height - 30);
    
    // Update wiggle for dynamic movement
    f.wiggle += f.wiggleSpeed;
  }
}

function renderFish() {
  for (let f of fish) {
    push();
    translate(f.x, f.y);
    rotate(atan2(f.vy, f.vx)); // Rotate to face direction
    
    fill(f.colour);
    noStroke();
    
    // More realistic fish shape: body, dorsal fin, caudal fin, eye
    // Body: tapered ellipse
    beginShape();
    vertex(0, 0);
    bezierVertex(f.size / 2, -f.size / 4 + sin(f.wiggle) * 2, f.size, -f.size / 8 + sin(f.wiggle) * 1, f.size, 0);
    bezierVertex(f.size, f.size / 8 - sin(f.wiggle) * 1, f.size / 2, f.size / 4 - sin(f.wiggle) * 2, 0, 0);
    endShape(CLOSE);
    
    // Dorsal fin
    triangle(f.size / 3, -f.size / 6 + sin(f.wiggle) * 2, f.size / 2, -f.size / 3 + sin(f.wiggle) * 3, f.size / 1.5, -f.size / 6 + sin(f.wiggle) * 2);
    
    // Caudal fin (tail)
    triangle(f.size, 0, f.size * 1.2 + cos(f.wiggle) * 5, -f.size / 4, f.size * 1.2 + cos(f.wiggle) * 5, f.size / 4);
    
    // Eye
    fill(0);
    ellipse(f.size / 6, 0, f.size / 10, f.size / 10);
    
    pop();
  }
}

function renderHUD() {
  fill(0);
  textSize(16);
  textAlign(LEFT);
  text(`Fish: ${fish.length}`, 10, 20);
  text(`Mode: ${paused ? 'Paused' : 'Running'}`, 10, 40);
}

function mousePressed() {
  if (keyIsDown(SHIFT)) {
    removeNearestFish(mouseX, mouseY);
  } else {
    spawnFish(mouseX, mouseY);
    // Add fancy message
    messages.push({
      x: width / 2, 
      y: height / 2, 
      text: "I love you Mideva", 
      alpha: 255, 
      scale: 1, 
      scaleSpeed: 0.05, 
      colorPhase: 0
    });
  }
}

function keyPressed() {
  if (key === 'P' || key === 'p') {
    paused = !paused;
  } else if (key === 'R' || key === 'r') {
    resetAquarium();
  }
}

function removeNearestFish(mx, my) {
  if (fish.length === 0) return;
  
  let minDist = Infinity;
  let nearestIndex = -1;
  
  for (let i = 0; i < fish.length; i++) {
    let d = dist(mx, my, fish[i].x, fish[i].y);
    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }
  
  if (nearestIndex !== -1) {
    fish.splice(nearestIndex, 1); // Remove from array
  }
}

function resetAquarium() {
  fish = []; // Clear current fish
  messages = []; // Clear messages
  for (let i = 0; i < 10; i++) {
    spawnFish(random(width), random(height - 100));
  }
}

function arrayTest(n) {
  console.log(`Array test: After spawning ${n} fish, fish.length == ${fish.length}`);
  fish.forEach((f, index) => {
    let hasFields = 'x' in f && 'y' in f && 'vx' in f && 'vy' in f && 'size' in f && 'colour' in f;
    console.log(`Fish ${index}: Has required fields (x, y, vx, vy, size, colour)? ${hasFields}`);
  });
}

function boundaryTest() {
  // Test left boundary bounce
  let testFishLeft = { x: -1, y: 250, vx: -2, vy: 0, size: 30, colour: color(255) };
  testFishLeft.x += testFishLeft.vx;
  testFishLeft.y += testFishLeft.vy;
  if (testFishLeft.x < 0 || testFishLeft.x > width) testFishLeft.vx *= -1;
  if (testFishLeft.y < 0 || testFishLeft.y > height) testFishLeft.vy *= -1;
  testFishLeft.x = constrain(testFishLeft.x, 0, width);
  testFishLeft.y = constrain(testFishLeft.y, 0, height);
  console.log(`Boundary test (left): Position x=${testFishLeft.x} (expected ~0), vx=${testFishLeft.vx} (expected positive)`);
  
  // Test right boundary bounce
  let testFishRight = { x: width + 1, y: 250, vx: 2, vy: 0, size: 30, colour: color(255) };
  testFishRight.x += testFishRight.vx;
  testFishRight.y += testFishRight.vy;
  if (testFishRight.x < 0 || testFishRight.x > width) testFishRight.vx *= -1;
  if (testFishRight.y < 0 || testFishRight.y > height) testFishRight.vy *= -1;
  testFishRight.x = constrain(testFishRight.x, 0, width);
  testFishRight.y = constrain(testFishRight.y, 0, height);
  console.log(`Boundary test (right): Position x=${testFishRight.x} (expected ~${width}), vx=${testFishRight.vx} (expected negative)`);
  
  // Test top boundary bounce
  let testFishTop = { x: 400, y: -1, vx: 0, vy: -2, size: 30, colour: color(255) };
  testFishTop.x += testFishTop.vx;
  testFishTop.y += testFishTop.vy;
  if (testFishTop.x < 0 || testFishTop.x > width) testFishTop.vx *= -1;
  if (testFishTop.y < 0 || testFishTop.y > height) testFishTop.vy *= -1;
  testFishTop.x = constrain(testFishTop.x, 0, width);
  testFishTop.y = constrain(testFishTop.y, 0, height);
  console.log(`Boundary test (top): Position y=${testFishTop.y} (expected ~0), vy=${testFishTop.vy} (expected positive)`);
  
  // Test bottom boundary bounce
  let testFishBottom = { x: 400, y: height + 1, vx: 0, vy: 2, size: 30, colour: color(255) };
  testFishBottom.x += testFishBottom.vx;
  testFishBottom.y += testFishBottom.vy;
  if (testFishBottom.x < 0 || testFishBottom.x > width) testFishBottom.vx *= -1;
  if (testFishBottom.y < 0 || testFishBottom.y > height) testFishBottom.vy *= -1;
  testFishBottom.x = constrain(testFishBottom.x, 0, width);
  testFishBottom.y = constrain(testFishBottom.y, 0, height);
  console.log(`Boundary test (bottom): Position y=${testFishBottom.y} (expected ~${height}), vy=${testFishBottom.vy} (expected negative)`);
}

function updateMessages() {
  for (let i = messages.length - 1; i >= 0; i--) {
    let m = messages[i];
    m.alpha -= 1.5; // Slower fade
    m.scale += m.scaleSpeed; // Grow
    m.colorPhase += 0.05; // For rainbow effect
    if (m.alpha <= 0 || m.scale > 3) {
      messages.splice(i, 1);
    }
  }
}

function renderMessages() {
  for (let m of messages) {
    push();
    textSize(32 * m.scale); // Larger and scaling
    textAlign(CENTER);
    let r = 255 * (sin(m.colorPhase) * 0.5 + 0.5);
    let g = 255 * (sin(m.colorPhase + TWO_PI / 3) * 0.5 + 0.5);
    let b = 255 * (sin(m.colorPhase + 4 * PI / 3) * 0.5 + 0.5);
    fill(r, g, b, m.alpha);
    text(m.text, m.x, m.y);
    pop();
  }
}

function renderPlants() {
  for (let p of plants) {
    stroke(p.color);
    strokeWeight(3);
    let currentX = p.x;
    let currentY = p.baseY;
    for (let i = 0; i < p.segments; i++) {
      let nextY = currentY - (p.height / p.segments);
      let sway = sin(frameCount * 0.05 + p.x) * p.swayAngle * (i / p.segments);
      let nextX = currentX + sway;
      line(currentX, currentY, nextX, nextY);
      currentX = nextX;
      currentY = nextY;
    }
  }
}

function createTurtle(x, y) {
  return {
    x: x,
    y: y,
    vx: random(0.5, 1.5) * (random() > 0.5 ? 1 : -1),
    size: 40,
    colour: color(34, 139, 34),
    wiggle: 0,
    wiggleSpeed: 0.05
  };
}

function createOctopus(x, y) {
  return {
    x: x,
    y: y,
    vx: random(0.2, 0.8) * (random() > 0.5 ? 1 : -1),
    size: 50,
    colour: color(255, 105, 180),
    tentacles: [],
    wiggle: 0,
    wiggleSpeed: 0.1
  };
}

function createStarfish(x, y) {
  return {
    x: x,
    y: y,
    vx: 0, // Static for starfish
    size: 30,
    colour: color(255, 165, 0),
    rotation: 0,
    rotSpeed: 0.01
  };
}

function updateCreatures() {
  for (let c of creatures) {
    if ('vx' in c) {
      c.x += c.vx;
      if (c.x < 0 || c.x > width) {
        c.vx *= -1;
      }
      c.wiggle += c.wiggleSpeed;
    }
    if ('rotSpeed' in c) {
      c.rotation += c.rotSpeed;
    }
  }
}

function renderCreatures() {
  for (let c of creatures) {
    if (c.size === 40) { // Turtle
      push();
      translate(c.x, c.y);
      rotate(atan2(0, c.vx)); // Face direction
      fill(c.colour);
      ellipse(0, 0, c.size, c.size * 0.7); // Shell
      // Head
      ellipse(-c.size / 2 - 10 + sin(c.wiggle) * 2, 0, 15, 10);
      // Legs
      ellipse(-c.size / 4, -c.size / 4 + cos(c.wiggle) * 2, 10, 15);
      ellipse(-c.size / 4, c.size / 4 - cos(c.wiggle) * 2, 10, 15);
      ellipse(c.size / 4, -c.size / 4 + sin(c.wiggle) * 2, 10, 15);
      ellipse(c.size / 4, c.size / 4 - sin(c.wiggle) * 2, 10, 15);
      pop();
    } else if (c.size === 50) { // Octopus
      push();
      translate(c.x, c.y);
      rotate(atan2(0, c.vx));
      fill(c.colour);
      ellipse(0, 0, c.size * 0.6, c.size); // Body
      // Tentacles
      for (let i = 0; i < 8; i++) {
        let angle = (TWO_PI / 8) * i + sin(c.wiggle + i) * 0.2;
        let tx = cos(angle) * c.size / 2;
        let ty = sin(angle) * c.size / 2;
        stroke(c.colour);
        strokeWeight(5);
        line(0, ty, tx * 2 + sin(c.wiggle + i) * 5, ty * 2 + cos(c.wiggle + i) * 5);
      }
      pop();
    } else if (c.size === 30) { // Starfish
      push();
      translate(c.x, c.y);
      rotate(c.rotation);
      fill(c.colour);
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = (TWO_PI / 5) * i;
        vertex(cos(angle) * c.size, sin(angle) * c.size);
        let midAngle = angle + PI / 5;
        vertex(cos(midAngle) * (c.size / 2), sin(midAngle) * (c.size / 2));
      }
      endShape(CLOSE);
      pop();
    }
  }
}
