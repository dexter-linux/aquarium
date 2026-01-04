// David Gachara - Enhanced Aquarium with Shark, Dolphins, Sunset & Waves
let fish = [];
let plants = [];
let rocks = [];
let creatures = [];
let whale = null;
let shark = null;
let dolphins = [];
let whaleTimer = 0;
let sharkTimer = 0;
let dolphinTimer = 0;
let bubbles = [];
let foodParticles = [];
let paused = false;
let messages = [];
let bgMusic;
let caustics;
function preload() {
  bgMusic = loadSound('song.mp3'); // Make sure you have a song.mp3 in your project
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  caustics = createGraphics(width, height);
  caustics.background(0, 0);
  resetAquarium();
  regenerateEnvironment();
  // Add bottom creatures
  creatures.push(createTurtle(random(width / 3), height - 60));
  creatures.push(createOctopus(random(width / 3, 2 * width / 3), height - 80));
  creatures.push(createStarfish(random(width - 200, width - 50), height - 40));
  bgMusic.loop();
  // Timers for rare visitors
  whaleTimer = floor(random(300, 600));
  sharkTimer = floor(random(900, 1800)); // 15–30 seconds
  dolphinTimer = floor(random(600, 1200)); // 10–20 seconds
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  caustics.resizeCanvas(width, height);
  regenerateEnvironment();
  creatures.forEach(c => {
    c.y = constrain(c.y, height - 100, height - 30);
    c.x = constrain(c.x, 0, width);
  });
  if (whale) whale.y = height / 2;
  if (shark) shark.y = height / 2 + random(-100, 100);
  dolphins.forEach(d => {
    if (d.baseY) d.y = d.baseY + sin(frameCount*0.05 + d.offset)*50;
  });
}
function regenerateEnvironment() {
  plants = [];
  rocks = [];
  for (let i = 0; i < floor(width / 100); i++) {
    plants.push({
      x: random(50, width - 50),
      baseY: height,
      height: random(60, 120 * (height / 600)),
      segments: 6,
      swayAngle: random(PI / 15, PI / 8),
      color: color(random(20, 60), random(140, 200), random(20, 60))
    });
  }
  for (let i = 0; i < floor(width / 200); i++) {
    rocks.push({
      x: random(50, width - 50),
      y: height - 15,
      size: random(40, 80),
      color: color(random(90, 140), random(90, 140), random(90, 140))
    });
  }
}
function draw() {
  // === Sunset gradient background ===
  drawSunsetBackground();
  // === Gentle surface waves ===
  drawSurfaceWaves();
  // Sandy bottom
  fill(210, 190, 140);
  noStroke();
  rect(0, height - 30, width, 30);
  renderRocks();
  renderPlants();
  renderCreatures();
  if (!paused) {
    updateFish();
    updateCreatures();
    updateWhale();
    updateShark();
    updateDolphins();
    updateBubbles();
    updateFoodParticles();
    updateMessages();
    updateCaustics();
  }
  // Subtle caustics overlay
  blendMode(SCREEN);
  image(caustics, 0, 0);
  blendMode(BLEND);
  renderFish();
  if (whale) renderWhale();
  if (shark) renderShark();
  renderDolphins();
  renderBubbles();
  renderFoodParticles();
  renderMessages();
  renderHUD();
}
// === Sunset Background with Sun ===
function drawSunsetBackground() {
  for (let y = 0; y <= height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(255, 100, 80, 220), color(255, 180, 120, 180), constrain(inter * 3, 0, 1));
    c = lerpColor(c, color(60, 120, 200), constrain((inter - 0.3) * 3, 0, 1));
    c = lerpColor(c, color(20, 40, 120), constrain((inter - 0.6) * 3, 0, 1));
    stroke(c);
    line(0, y, width, y);
  }
  // Glowing sun
  let sunY = height * 0.2;
  let sunX = width * 0.8 + sin(frameCount * 0.02) * 40;
  for (let r = 120; r > 0; r -= 12) {
    fill(255, 200 + r, 80, 30 - r/5);
    noStroke();
    ellipse(sunX, sunY, r * 2);
  }
  fill(255, 180, 60);
  ellipse(sunX, sunY, 80);
}
// === Surface Waves ===
function drawSurfaceWaves() {
  noFill();
  strokeWeight(3);
  for (let i = 0; i < 6; i++) {
    let offset = frameCount * 0.02 + i * 0.5;
    stroke(255, 255, 255, 70 - i * 10);
    beginShape();
    for (let x = -10; x <= width + 10; x += 10) {
      let y = 20 + sin(x * 0.02 + offset) * 12 + sin(x * 0.012 + offset * 1.4) * 6;
      vertex(x, y + i * 10);
    }
    endShape();
  }
}
function spawnFish(x, y) {
  let vx = random(-4, 4);
  let vy = random(-3, 3);
  let speed = sqrt(vx*vx + vy*vy);
  if (speed > 4) { vx = vx/speed*4; vy = vy/speed*4; }
  fish.push({
    x, y, vx, vy,
    size: random(25, 45),
    colour: color(random(150, 255), random(150, 255), random(200, 255)),
    wiggle: random(TWO_PI),
    wiggleSpeed: random(0.12, 0.22)
  });
}
function updateFish() {
  for (let f of fish) {
    if (foodParticles.length > 0) {
      let nearest = foodParticles.reduce((a, b) =>
        dist(f.x, f.y, a.x, a.y) < dist(f.x, f.y, b.x, b.y) ? a : b);
      if (dist(f.x, f.y, nearest.x, nearest.y) < 150) {
        f.vx += (nearest.x - f.x) * 0.012;
        f.vy += (nearest.y - f.y) * 0.012;
        let spd = sqrt(f.vx*f.vx + f.vy*f.vy);
        if (spd > 4) { f.vx = f.vx/spd*4; f.vy = f.vy/spd*4; }
      }
    }
    f.x += f.vx;
    f.y += f.vy;
    if (f.x < 0 || f.x > width) f.vx *= -1;
    if (f.y < 0 || f.y > height - 40) f.vy *= -1;
    f.x = constrain(f.x, 0, width);
    f.y = constrain(f.y, 0, height - 40);
    f.wiggle += f.wiggleSpeed;
    if (random() < 0.012) {
      bubbles.push({x: f.x, y: f.y, size: random(6, 12), vy: random(-1.5, -2.5), alpha: 180});
    }
  }
}
function renderFish() {
  for (let f of fish) {
    push();
    translate(f.x, f.y);
    rotate(atan2(f.vy, f.vx) + PI); // Flip 180° so head follows direction
 
    // Body
    fill(f.colour);
    noStroke();
    beginShape();
    vertex(0, 0);
    bezierVertex(f.size/2, -f.size/3 + sin(f.wiggle)*3, f.size, -f.size/10, f.size, 0);
    bezierVertex(f.size, f.size/10, f.size/2, f.size/3 - sin(f.wiggle)*3, 0, 0);
    endShape(CLOSE);
    // Pectoral fins
    fill(red(f.colour)-40, green(f.colour)-40, blue(f.colour)-40);
    triangle(f.size/4, -f.size/5, f.size/4 - 10, -f.size/2 + sin(f.wiggle)*4, f.size/4 + 5, -f.size/6);
    triangle(f.size/4, f.size/5, f.size/4 - 10, f.size/2 - sin(f.wiggle)*4, f.size/4 + 5, f.size/6);
    // Dorsal fin
    triangle(f.size/2, 0, f.size/1.8, -f.size/3 + cos(f.wiggle)*5, f.size/1.3, 0);
    // Tail
    fill(f.colour);
    triangle(f.size, 0, f.size*1.3 + cos(f.wiggle)*8, -f.size/3, f.size*1.3 + cos(f.wiggle)*8, f.size/3);
    // Eye (now on the head after flip)
    fill(255);
    ellipse(f.size - f.size/5, -f.size/12, f.size/8, f.size/8);
    fill(0);
    ellipse(f.size - f.size/5 + 2, -f.size/12, f.size/12, f.size/12);
    // Scales hint
    stroke(f.colour);
    strokeWeight(2);
    for (let i = 1; i < 5; i++) {
      line(f.size*i/6, -f.size/6, f.size*i/6 + sin(f.wiggle + i)*3, f.size/6);
    }
    pop();
  }
}
// =============== CREATURES =================
function createTurtle(x, y) {
  return {x, y, vx: random(0.8, 1.8)*(random()>0.5?1:-1), size:45, wiggle:0, wiggleSpeed:0.06};
}
function createOctopus(x, y) {
  return {x, y, vx: random(0.4, 1)*(random()>0.5?1:-1), size:55, wiggle:0, wiggleSpeed:0.12};
}
function createStarfish(x, y) {
  return {x, y, vx:0, size:35, rotation:0, rotSpeed:0.008};
}
function updateCreatures() {
  for (let c of creatures) {
    if (c.vx) {
      c.x += c.vx;
      if (c.x < -50 || c.x > width + 50) c.vx *= -1;
      c.wiggle += c.wiggleSpeed;
    }
    if (c.rotSpeed) c.rotation += c.rotSpeed;
    if (random() < 0.008) {
      bubbles.push({x: c.x, y: c.y-20, size: random(8,14), vy: random(-1,-2), alpha:160});
    }
  }
}
function renderCreatures() {
  for (let c of creatures) {
    push();
    translate(c.x, c.y);
    if (c.vx) rotate(atan2(0, c.vx));
    if (c.size === 45) { // Turtle
      fill(34, 139, 34);
      ellipse(0, 0, c.size*1.2, c.size);
      fill(20, 100, 20);
      for (let a=0; a<TWO_PI; a+=PI/5) {
        ellipse(cos(a)*c.size/3, sin(a)*c.size/3, c.size/3, c.size/4);
      }
      fill(34, 139, 34);
      ellipse(0,0,c.size/1.5,c.size/1.8);
  
      ellipse(-c.size/1.8 + sin(c.wiggle)*3, 0, 20, 15);
      fill(0);
      ellipse(-c.size/1.8 + 8, -4, 5,5);
  
      ellipse(-c.size/3, -c.size/3 + cos(c.wiggle)*4, 15,25);
      ellipse(-c.size/3, c.size/3 - cos(c.wiggle)*4, 15,25);
      ellipse(c.size/4, -c.size/4 + sin(c.wiggle)*3, 12,20);
      ellipse(c.size/4, c.size/4 - sin(c.wiggle)*3, 12,20);
    }
    else if (c.size === 55) { // Octopus
      fill(200, 80, 160);
      ellipse(0, 0, c.size*0.8, c.size);
      fill(255);
      ellipse(-10, -10, 8,8); ellipse(10, -10, 8,8);
      fill(0);
      ellipse(-10, -10, 4,4); ellipse(10, -10, 4,4);
  
      stroke(200, 80, 160);
      strokeWeight(8);
      for (let i=0; i<8; i++) {
        let ang = TWO_PI/8 * i + sin(c.wiggle + i)*0.3;
        let tx = cos(ang) * c.size;
        let ty = sin(ang) * c.size;
        line(0, 0, tx, ty);
        line(tx, ty, tx*1.4 + cos(c.wiggle*2 + i)*10, ty*1.4 + sin(c.wiggle*2 + i)*10);
        noStroke();
        fill(255, 180, 220);
        for (let j=1; j<4; j++) {
          ellipse(tx*j/4, ty*j/4, 8,8);
        }
      }
    }
    else if (c.size === 35) { // Starfish
      rotate(c.rotation);
      fill(255, 140, 0);
      beginShape();
      for (let i=0; i<10; i++) {
        let a = i * PI/5;
        let r = i%2===0 ? c.size : c.size/2;
        vertex(cos(a)*r, sin(a)*r);
      }
      endShape(CLOSE);
      fill(255, 180, 60);
      for (let i=0; i<5; i++) {
        let a = TWO_PI/5 * i + PI/5;
        ellipse(cos(a)*c.size/3, sin(a)*c.size/3, 8,8);
      }
    }
    pop();
  }
}
// =============== RARE VISITORS =================
function updateWhale() {
  whaleTimer--;
  if (whaleTimer <= 0 && !whale) {
    // Spawn from the right, moving left (negative vx)
    whale = {x: width + 300, y: height/2, vx: -1.8, size:220, wiggle:0, wiggleSpeed:0.04};
    whaleTimer = floor(random(1800, 3600));
  }
  if (whale) {
    whale.x += whale.vx;
    whale.wiggle += whale.wiggleSpeed;
    if (random() < 0.15) {
      bubbles.push({x: whale.x + (whale.vx < 0 ? -whale.size/3 : whale.size/3), y: whale.y - whale.size/3, size: random(15,30), vy: random(-3,-5), alpha:200});
    }
    if (whale.x < -300) whale = null;
  }
}
function renderWhale() {
  if (!whale) return;
  push();
  translate(whale.x, whale.y);
  if (whale.vx < 0) scale(-1, 1);
  fill(80, 80, 160);
  noStroke();
  beginShape();
  vertex(-whale.size/2, 0);
  bezierVertex(-whale.size/2, -whale.size/3, 0, -whale.size/2 + sin(whale.wiggle)*15, whale.size/2, -whale.size/5);
  bezierVertex(whale.size/2, whale.size/5, 0, whale.size/2 - sin(whale.wiggle)*15, -whale.size/2, whale.size/3);
  endShape(CLOSE);
  triangle(0, -whale.size/4, whale.size/6, -whale.size/2.5 + cos(whale.wiggle)*12, whale.size/3, -whale.size/5);
  fill(60, 60, 140);
  beginShape();
  vertex(whale.size/2, 0);
  bezierVertex(whale.size/2 + 80 + cos(whale.wiggle*1.5)*20, -whale.size/3, whale.size/2 + 120, -whale.size/6, whale.size/2 + 80, 0);
  bezierVertex(whale.size/2 + 120, whale.size/6, whale.size/2 + 80 + cos(whale.wiggle*1.5)*20, whale.size/3, whale.size/2, 0);
  endShape(CLOSE);
  fill(255);
  ellipse(-whale.size/3.5, -whale.size/10, 15,15);
  fill(0);
  ellipse(-whale.size/3.5 + 4, -whale.size/10, 8,8);
  pop();
}
function updateShark() {
  sharkTimer--;
  if (sharkTimer <= 0 && !shark) {
    // Spawn from the right, moving left (negative vx)
    shark = {x: width + 250, y: height/2 + random(-150,150), vx: -random(3,5), size:180, wiggle:0, wiggleSpeed:0.1};
    sharkTimer = floor(random(2400, 4800));
  }
  if (shark) {
    shark.x += shark.vx;
    shark.wiggle += shark.wiggleSpeed;
    if (shark.x < -300) shark = null;
  }
}
function renderShark() {
  if (!shark) return;
  push();
  translate(shark.x, shark.y);
  rotate(atan2(0, shark.vx));
  fill(100, 100, 110);
  noStroke();
  beginShape();
  vertex(-shark.size/3, 0);
  bezierVertex(-shark.size/3, -shark.size/3, shark.size/2, -shark.size/4, shark.size, 0);
  bezierVertex(shark.size/2, shark.size/4, -shark.size/3, shark.size/3, -shark.size/3, 0);
  endShape(CLOSE);
  fill(80, 80, 90);
  triangle(0, -shark.size/5, shark.size/6, -shark.size/2.2 + sin(shark.wiggle)*10, shark.size/4, -shark.size/6);
  triangle(shark.size, 0, shark.size*1.4 + cos(shark.wiggle)*15, -shark.size/3, shark.size*1.4 + cos(shark.wiggle)*15, shark.size/3);
  fill(255);
  for (let i=0; i<8; i++) {
    triangle(shark.size - i*8, -8 + sin(i)*4, shark.size - i*8 - 6, 0, shark.size - i*8, 8 - sin(i)*4);
  }
  fill(255);
  ellipse(shark.size/3, -shark.size/10, 12,12);
  fill(0);
  ellipse(shark.size/3 + 3, -shark.size/10, 6,6);
  stroke(60);
  strokeWeight(3);
  for (let i=1; i<4; i++) {
    line(shark.size/5 - i*15, -shark.size/8, shark.size/5 - i*15, shark.size/8);
  }
  pop();
}
function updateDolphins() {
  dolphinTimer--;
  if (dolphinTimer <= 0 && dolphins.length === 0) {
    let count = floor(random(3,6));
    let baseY = height/2 + random(-100,100);
    for (let i = 0; i < count; i++) {
      // Spawn from the right, moving left (negative vx)
      dolphins.push({
        x: width + 200 + i*80,
        y: baseY + sin(i)*40,
        vx: -random(2.5, 4),
        size: random(80, 110),
        wiggle: i*0.5,
        wiggleSpeed: 0.08,
        offset: i,
        baseY: baseY
      });
    }
    dolphinTimer = floor(random(1800, 3000));
  }
  if (dolphins.length > 0) {
    dolphins.forEach(d => {
      d.x += d.vx;
      d.y = d.baseY + sin(frameCount*0.05 + d.offset)*50;
      d.wiggle += d.wiggleSpeed;
      if (random() < 0.08) {
        bubbles.push({x: d.x + d.size/3, y: d.y, size: random(8,16), vy: random(-2,-4), alpha:180});
      }
    });
    // Check the first dolphin (they are ordered from right to left)
    if (dolphins[dolphins.length-1].x < -200) dolphins = [];
  }
}
function renderDolphins() {
  dolphins.forEach(d => {
    push();
    translate(d.x, d.y);
    rotate(atan2(sin(frameCount*0.05 + d.offset)*0.5, d.vx));
    fill(180, 180, 200);
    noStroke();
    ellipse(0, 0, d.size*1.4, d.size*0.7);
    triangle(-d.size/2, 0, -d.size/2 - 30, -10, -d.size/2 - 30, 10);
    triangle(-d.size/8, 0, -d.size/12, -d.size/2.5 + sin(d.wiggle)*8, d.size/6, 0);
    triangle(d.size/2, 0, d.size/2 + 40 + cos(d.wiggle)*10, -d.size/4, d.size/2 + 40 + cos(d.wiggle)*10, d.size/4);
    fill(0);
    ellipse(-d.size/3, -d.size/12, 8,8);
    pop();
  });
}
// =============== EFFECTS & UI =================
function updateCaustics() {
  caustics.clear();
  caustics.noStroke();
  for (let i = 0; i < 25; i++) {
    let x = random(width);
    let y = random(height);
    let sz = random(60, 120);
    caustics.fill(255, 255, 255, random(6, 16));
    caustics.ellipse(
      x + sin(frameCount * 0.03 + i) * 12,
      y + cos(frameCount * 0.02 + i) * 8,
      sz, sz * 0.6
    );
  }
}
function updateBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.y += b.vy;
    b.alpha -= 0.8;
    b.size += 0.06;
    if (b.y < -20 || b.alpha <= 0) bubbles.splice(i, 1);
  }
}
function renderBubbles() {
  noStroke();
  for (let b of bubbles) {
    fill(255, 255, 255, b.alpha);
    ellipse(b.x, b.y, b.size, b.size);
  }
}
function updateFoodParticles() {
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    let fp = foodParticles[i];
    fp.y += fp.vy;
    fp.life--;
    if (fp.life <= 0 || fp.y > height - 30) {
      foodParticles.splice(i, 1);
      continue;
    }
    for (let f of fish) {
      if (dist(f.x, f.y, fp.x, fp.y) < f.size/2 + fp.size) {
        foodParticles.splice(i, 1);
        bubbles.push({x: f.x, y: f.y, size: random(10,15), vy: random(-2,-3), alpha:200});
        break;
      }
    }
  }
}
function renderFoodParticles() {
  fill(160, 82, 45, 220);
  noStroke();
  for (let fp of foodParticles) {
    ellipse(fp.x, fp.y, fp.size, fp.size);
  }
}
function updateMessages() {
  for (let i = messages.length - 1; i >= 0; i--) {
    let m = messages[i];
    m.alpha -= 2;
    m.scale += m.scaleSpeed;
    m.colorPhase += 0.06;
    if (m.alpha <= 0) messages.splice(i, 1);
  }
}
function renderMessages() {
  for (let m of messages) {
    push();
    translate(m.x, m.y);
    scale(m.scale);
    textAlign(CENTER, CENTER);
    textSize(40);
    let r = 255 * (sin(m.colorPhase)*0.5 + 0.5);
    let g = 255 * (sin(m.colorPhase + TWO_PI/3)*0.5 + 0.5);
    let b = 255 * (sin(m.colorPhase + 4*PI/3)*0.5 + 0.5);
    fill(r, g, b, m.alpha);
    text(m.text, 0, 0);
    pop();
  }
}
function renderPlants() {
  for (let p of plants) {
    stroke(p.color);
    strokeWeight(4);
    let curX = p.x;
    let curY = p.baseY;
    for (let i = 0; i < p.segments; i++) {
      let nextY = curY - p.height / p.segments;
      let sway = sin(frameCount * 0.04 + p.x * 0.01 + i) * p.swayAngle * (i+1)/p.segments;
      let nextX = curX + sway;
      line(curX, curY, nextX, nextY);
      curX = nextX;
      curY = nextY;
    }
  }
}
function renderRocks() {
  for (let r of rocks) {
    fill(r.color);
    noStroke();
    ellipse(r.x, r.y, r.size, r.size*0.7);
    fill(red(r.color)-30, green(r.color)-30, blue(r.color)-30);
    ellipse(r.x - r.size/5, r.y - r.size/8, r.size*0.6, r.size*0.4);
  }
}
function renderHUD() {
  fill(0);
  textSize(width/60);
  textAlign(LEFT);
  text(`Fish: ${fish.length} | Creatures: ${creatures.length + dolphins.length + (whale?1:0) + (shark?1:0)}`, 15, 25);
  text(`Mode: ${paused ? 'Paused (P)' : 'Running (P to pause)'}`, 15, 50);
}
// =============== INTERACTIONS =================
function mousePressed() {
  if (keyIsDown(SHIFT)) {
    if (fish.length > 0) {
      let idx = 0;
      let minD = dist(mouseX, mouseY, fish[0].x, fish[0].y);
      for (let i = 1; i < fish.length; i++) {
        let d = dist(mouseX, mouseY, fish[i].x, fish[i].y);
        if (d < minD) { minD = d; idx = i; }
      }
      fish.splice(idx, 1);
    }
  } else if (keyIsDown(CONTROL) || keyIsDown(91)) {
    for (let i = 0; i < 8; i++) {
      foodParticles.push({
        x: mouseX + random(-20,20),
        y: mouseY + random(-20,20),
        size: random(4,8),
        vy: random(0.8, 1.8),
        life: 400
      });
    }
  } else {
    spawnFish(mouseX, mouseY);
    messages.push({
      x: width/2, y: height/2,
      text: "I love you Mideva ♡",
      alpha: 255, scale: 0.8, scaleSpeed: 0.06, colorPhase: 0
    });
  }
}
function keyPressed() {
  if (key === 'p' || key === 'P') paused = !paused;
  if (key === 'r' || key === 'R') {
    resetAquarium();
    whale = null; shark = null; dolphins = [];
  }
}
function resetAquarium() {
  fish = [];
  bubbles = [];
  foodParticles = [];
  messages = [];
  for (let i = 0; i < 12; i++) {
    spawnFish(random(width), random(50, height-100));
  }
}
