
// Create Circle: SHIFT + Drag mouse to desired size
// Select Circle: Double click on circle
// Deselect Circle: Double click outside circle
// Delete Circle: Press Mouse + BACKSPACE
// Move Circle: Click and drag

const SELECT_COLOR = 'black';
const BENEFIT_COLOR = '#FFDBBB';
const DRAWBACK_COLOR = '#B8E2F2';
const TEXT_COLOR = '#3c0008'
const MIN_TEXT_SIZE = 11;
let background_image;
let font;

let inputBox;
let downloadButton;
let loadButton;
let clearButton;

let startX;
let startY;
let drawingNew;
let adjusting;
let currSelectedCircle;
let circles = []
let title = "Bubble Think"

function resetFields() {
  inputBox.value("");
  startX = null;
  startY = null;
  drawingNew = false;
  adjusting = false;
  currSelectedCircle = null;
  circles = [];
  title = "Bubble Think";
  console.log("reset fields");
}

const getCircle = function(x, y, d, textValue) {
  return(
    {
      x: x,
      y: y,
      r: Math.floor(d / 2),
      textValue: textValue,
      isClicked: false,
      
      offset: {
        offx: 0,
        offy: 0
      },
      
      display: function() {
        push();
        circle(this.x, this.y, this.r * 2);
        textAlign(CENTER, CENTER);
        fill(TEXT_COLOR);
        strokeWeight(0.5);
        
        let maxTextSize = this.r*2 / 5; // Initial maximum text size

        // Adjust text size to fit within the circle
        textSize(maxTextSize);
        while (textWidth(this.textValue) > this.r*2 * 0.9 && maxTextSize > MIN_TEXT_SIZE) {
          maxTextSize -= 1;
          textSize(maxTextSize);
        }
        textWrap(WORD);
        text(this.textValue, this.x - this.r + 10, this.y - this.r + 10, this.r*2 - 20, this.r*2-20);
        pop();
      },
      
      update: function() {

        // First time clicked
        if(dist(this.x, this.y, mouseX, mouseY) < this.r && 
           mouseIsPressed && !this.isClicked && !keyIsPressed) {
          this.isClicked = true;

          // Record distance from mouse to center
          this.offset = {
            offx: mouseX - this.x,
            offy: mouseY - this.y
          }

        } else if(this.isClicked && mouseIsPressed && !keyIsPressed){

          // Update coordinates to follow mouse
          this.x = mouseX - this.offset.offx;
          this.y = mouseY - this.offset.offy;
        } else {
          this.isClicked = false
        }
      }
    }
  );
}

function preload() {
  //  Image by rawpixel.com on Freepik
  background_image = loadImage('spring.jpg');
  font = loadFont('suse.ttf');
}

function setup() {
  // createCanvas(400, 400);
  
  createCanvas(windowWidth, windowHeight);
  
  // TEXT INPUT
  inputBox = createInput();
  inputBox.id("inputfield");
  inputBox.position(width - 330, 110);
  inputBox.size(200);
  inputBox.input(handleInput);
  inputBox.addClass('inputBox');
  
  // ENTER BUTTON
  saveInput = createButton('Save');
  saveInput.position(width - 110, 110);
  saveInput.mousePressed(handleSave);
  saveInput.addClass('button');
  
  // SAVE BUTTON
  downloadButton = createButton('Download');
  downloadButton.position(50, 50);
  downloadButton.mousePressed(handleDownload);
  downloadButton.addClass('button');
  
  // LOAD BUTTON
  loadButton = createFileInput(handleLoad)
  loadButton.attribute('accept', '.json');
  loadButton.position(50, 100);
  loadButton.addClass('button');
  
  // CLEAR BUTTON
  clearButton = createButton('Clear');
  clearButton.position(50, 155);
  clearButton.mousePressed(handleClear);
  clearButton.addClass('button');

  textFont(font);
}

function handleClear() {
  loadButton.value(null);
  resetFields();
}

function handleInput() {
  if(currSelectedCircle) {
    console.log(this.value());
    currSelectedCircle.textValue = this.value();
  }
}

function handleSave() {
  // Clear field
  inputBox.value("");
  currSelectedCircle = null;
}

function handleDownload() {
  circles.push(title);
  save(circles, title + '.json');
  circles.pop();
}

function handleLoad(file) {
  resetFields();
  // for (let c of file.data) {
  for (let i = 0; i < file.data.length - 1; i++) {
    let c = file.data[i];
    console.log(c)
    // Get x,y from position
    let cx = c.x;
    let cy = c.y;

    // Get radius and name
    let crad = c.r;
    let t = c.textValue;
    console.log(cx, cy, crad, t);

    // Put object in array
    circles.push(getCircle(cx, cy, crad*2, t));
  }
  // Last item is the title
  title = file.data[file.data.length-1];
}

function keyPressed() {
  console.log("keycode: " + keyCode);
  // let currText = document.getElementById('inputfield').value
  if(keyCode === ENTER) {
    handleSave();
  } else if(keyCode === BACKSPACE && currSelectedCircle && mouseIsPressed) {
    let deleteIndex = circles.indexOf(currSelectedCircle);
    let name = circles[deleteIndex].textValue;
    print("Delete index: " + deleteIndex);
    circles.splice(deleteIndex, 1);
    currSelectedCircle = null;
    inputBox.value("");
    print("Deleted circle " + name);
  }
}

// CIRCLE BOUNDARIES
function mousePressed() {
  if(isWithinTitle(mouseX, mouseY)) {
    editTitle();
  } else if(keyIsPressed && !currSelectedCircle) {
    startX = mouseX;
    startY = mouseY;
    drawingNew = true;
  } else if(keyIsPressed && 
            currSelectedCircle && 
            isWithinCircle(currSelectedCircle, mouseX, mouseY)) {
    startX = currSelectedCircle.x;
    startY = currSelectedCircle.y;
    adjusting = true;
  }
}

function mouseReleased() {
  if(drawingNew) {
    drawingNew = false;
    
    endX = mouseX;
    endY = mouseY;
    diameter = dist(startX, startY, endX, endY);
    let newCircle = getCircle(startX, startY, diameter, "")
    circles.push(newCircle);
    currSelectedCircle = newCircle;
    console.log("created new circle " + endX + " " + endY);
  } else if(adjusting) {
    adjusting = false;
  }
}

function doubleClicked() {
  console.log("double");
  startX = null;
  startY = null;
  clickedX = mouseX;
  clickedY = mouseY;
  
  // Identify if clicked on an existing circle
  let hitCircle = false;
  for (c in circles) {
    if(isWithinCircle(circles[c], clickedX, clickedY)) {
      hitCircle = true;
      currSelectedCircle = circles[c]
      console.log("curr circle found: " + currSelectedCircle.textValue);
      
      // Populate text field to make text editable
      if (currSelectedCircle.textValue != "") {
        inputBox.value(currSelectedCircle.textValue);
      }
      break;
    }
  }
  
  // If not selected after loop, unselect because we clicked empty space
  if(!hitCircle) {
    currSelectedCircle = null;
    inputBox.value("");
  }
}

function isWithinCircle(c, currX, currY) {
  return dist(c.x, c.y, currX, currY) < c.r;
}

function isWithinTitle(currX, currY) {
  // Boundaries are text width distance in the middle of the screen
  // and within the textheight distance
  const twidth = textWidth(title);
  const theight = 100;
  
  // // Debug rectangle to see responsive area
  // push();
  // noFill();
  // rect(width/2 - 0.5*twidth, 50, twidth, 60);
  // pop();
  if(mouseX >= width/2 - 0.5*twidth && 
     mouseX <= width/2 + 0.5*twidth &&
     mouseY >= 50 && mouseY <= 110
    ) {
    // console.log("Mouse on title")
    cursor(HAND);
    return true;
  }
  cursor(ARROW);
  return false;
}

function editTitle() {
  // Allow change
  console.log("Edit title");
  let newTitle = prompt("Please enter a project title", "");
  if(newTitle) {
    title = newTitle;
  }
}

function draw() {
  // GRADIENT ATTEMPT 1: (only worked on fill)
  // createCanvas(windowWidth, windowHeight);
  // let gradient = drawingContext.createLinearGradient(
  //   0, 0, width, height
  // );
  // colorMode(HSB, 360, 100, 100, 100);
  // gradient.addColorStop(0, color(310, 100, 100, 100));
  // gradient.addColorStop(1, color(250, 100, 100, 100));
  // drawingContext.fillStyle = gradient;
  // rect(0, 0, width, height);
  
  // GRADIENT ATTEMPT 2: Too computationally expensive
//   let startColor = color(63, 191, 191);
//   let endColor = color("orange");
  
//   for(let y = 0; y < height; y++) {
//     let n = map(y, 0, height, 0, 1);
//     let newColor = lerpColor(startColor, endColor, n);
//     stroke(newColor);
//     line(0, y, width, y);
//   }
  
  // GRADIENT ATTEMPT 3: Background image (very nice + responsive!)
  background(background_image);
  // background(220);
  
  
  // HEADER
  push();
  textSize(70);
  fill(TEXT_COLOR);
  textAlign(CENTER);
  isWithinTitle();
  text(title, windowWidth/2, 120);
  pop();
  
  
  if(drawingNew) {
    let diameter = dist(startX, startY, mouseX, mouseY);
    circle(startX, startY, diameter);
  } else if(currSelectedCircle && 
            keyIsPressed && 
            adjusting) {
      currSelectedCircle.r = dist(startX, startY, mouseX, mouseY);
  }
  
  let benefitTotal = 0;
  let drawbackTotal = 0;
  for (c in circles) {
    curr = circles[c]
    push();
    if(curr.x < width / 2) {
      benefitTotal += Math.floor(curr.r*2);
      fill(BENEFIT_COLOR);
    } else {
      drawbackTotal += Math.floor(curr.r*2);
      fill(DRAWBACK_COLOR);
    }
    if(curr === currSelectedCircle) {
      strokeWeight(4);
      stroke(SELECT_COLOR)
      // fill(SELECT_COLOR);
    }
    curr.display();
    fill('white');
    curr.update();
    pop();
  }
  
  push();
    fill(TEXT_COLOR);
    textSize(35);
    let btext = "Benefits: " + benefitTotal;
    let dtext = "Drawbacks: " + drawbackTotal
    text(btext, windowWidth / 4 - (textWidth(btext)/2), windowHeight - 100);
    text(dtext, windowWidth / 4 * 3 - (textWidth(dtext)/2), windowHeight - 100);
  pop();
  
  if(circles.length > 5) {
    print(circles);
  }
}