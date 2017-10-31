'use strict';

// Display text in a textArea console
function print(text) {
  // Get a reference to the console
  var con = document.getElementById('Console');

  // Get the current console text
  var conTxt = con.textContent;

  // Append the new text
  conTxt += text;

  // Set the console text
  con.textContent = conTxt;

  // Make sure the console is visible
  con.style.display = "block";
}

// Display text in a textArea console, followed by a newline
function println(text) {
  print(text + '\n');
}

// Display javascript errors in a slightly more friendly manner
function jserror(messageOrEvent, source, lineno, colno, error) {
    // If there is no source, create one with the given line number
    if (source === '') {
        source = ' at line ' + lineno;
    }
    // If the source shows up as notebook.js, hide that fact (this code is perfect! /s)
    else if (source.includes('notebook.js')) {
        source = '';
    }
    // Otherwise use the source file and line number
    else {
        source = ' in ' + source + ' at line ' + lineno;
    }
    
    // Print out the error message
    if (typeof error === 'string') {
        console.error(error + source);
    }
    else {
        console.error(error.message + source);
    }
}

// Redirect javascript console error, log, and warning messages to println
if (!("_notebooklog" in console)) {
    console._notebooklog = console.log;
    console._notebookerror = console.error;
    console._notebookwarn = console.warn;
    console._notebookinfo = console.info;
    
    console.log = function(x) {println(x); console._notebooklog(x);};
    console.error =  function(x) {println('\u26D4 ' + x); console._notebookerror(x);};
    console.warn =  function(x) {println('\u26A0 ' + x); console._notebookwarn(x);};
    console.info =  function(x) {println('\u2139 ' + x); console._notebookinfo(x);};
    
    window.onerror = jserror;
}

// Read a line of user input
function readLine(promptTxt) {
  // Prompt the user for input
  rval = prompt(promptTxt);

  // If the user clicks Cancel, throw an exception
  if (rval === null) {
    throw 'Exception: User Cancelled Input';
  }

  // Otherwise, return the input
  return rval;
}

// Ask the user for a number
function readInt(promptTxt) {
  // Store the user prompt
  var text = promptTxt;

  // Loop until we get our input
  while (true) {
    // Ask the user for the number
    var rval = prompt(text);

    // If the user clicks cancel, throw an exception
    if (rval === null) {
      throw 'Exception: User Cancelled Input';
    }

    // Parse out the number the user entered
    rval = parseInt(rval);

    // If the user didn't enter a number, ask again
    if (isNaN(rval)) {
      text = promptTxt + "\nPlease enter an integer.";
    } else {
      // If they did enter a number, return it
      return rval;
    }
  }
}

// Ask the user for a number
function readFloat(promptTxt) {
  // Store the user prompt
  var text = promptTxt;

  // Loop until we get our input
  while (true) {
    // Ask the user for the number
    var rval = prompt(text);

    // If the user clicks cancel, throw an exception
    if (rval === null) {
      throw 'Exception: User Cancelled Input';
    }

    // Parse out the number the user entered
    rval = parseFloat(rval);

    // If the user didn't enter a number, ask again
    if (isNaN(rval)) {
      text = promptTxt + "\nPlease enter a number.";
    } else {
      // If they did enter a number, return it
      return rval;
    }
  }
}

// Ask the user for a boolean
function readBoolean(promptTxt) {
  // Store the user prompt
  var text = promptTxt;

  // Loop until we get our input
  while (true) {
    // Ask the user for the boolean
    var rval = prompt(text).toLowerCase();

    // If the user clicks cancel, throw an exception
    if (rval === null) {
      throw 'Exception: User Cancelled Input';
    } else if (rval === 'true' || rval === 'yes') {
      return true;
    } else if (rval === 'false' || rval === 'no') {
      return false;
    } else {
      // If they did not enter a boolean, loop
      text = promptTxt + "\nPlease enter true or false.";
    }
  }
}

var canvas = new class {
    constructor () {
        this._setup = false;
                       
        this._shapes = [];
        this._background = "#fff";
    }
    
    setBackground(color) { this._background = color; }
    
    add(shape) {         
        this.remove(shape);
        this._shapes.push(shape);
        $(this._canvas).show();
    }
    
    remove(shape) { this._shapes = this._shapes.filter(s => s !== shape); }
    
    draw() {     
        if (!this._setup) {
            this.prepare();
        }
        
        let ctx = this._canvas.getContext("2d");
        
        ctx.fillStyle = this._background;
        ctx.fillRect(0, 0, this._width, this._height);
        
        this._shapes.forEach(s => s.draw(ctx));
    }
    
    prepare() {   
        this._shapes = [];
        this._setup = true;
        
        let canvas = $("canvas#Drawing");
        this._canvas = canvas[0];
        
        this._width = $("body").width();
        this._height = this._width / 2;
        
        canvas.attr('width', this._width);
        canvas.attr('height', this._height);
    }
    
    getWidth() { return this._width; }
    
    getHeight() { return this._height; }
};

class Shape {
    constructor (centerX, centerY) {
        this._centerX = centerX;
        this._centerY = centerY;
        this._x = centerX;
        this._y = centerY;
        this._labelColor  = "white";
        this._labelFont = "sans-serif";
        this._fontHeight = 20;
        this._fillColor = "#000";
        this._text = "";
        this._measureLabel();
    }
    
    setX(x) {
        this._x = x;
        this._centerX = x;
    }
    
    getX() { return this._x; }
    
    setY(y) {
        this._y = y;
        this._centerY = y;
    }
    
    getY() { return this._y; }
    
    setLabel (text) {
        this._text = text;
        this._measureLabel();
    }
    
    setLabelColor (color) { this._labelColor = color; }
    
    setLabelOutline (color) { this._labelOutline = color; }
    
    setLabelFont (font) { this._labelFont = font; }
    
    setLabelFontSize (pixels) {this._fontHeight = pixels; }
    
    setColor (color) { this._fillColor = color; }
    
    setOutline (color) { this._outlineColor = color; }
       
    draw (drawContext) {
        drawContext.save();
        
        if (this.text !== "") {
            this._setupText(drawContext);

            drawContext.fillText(this._text, this._centerX, this._centerY);
            
            if (this._labelOutline) {            
                drawContext.strokeStyle = this._labelOutline;
                drawContext.strokeText(this._text, this._centerX, this._centerY);
            }
        }
        
        drawContext.restore();
    }
        
    _setupText(drawContext) {
        drawContext.fillStyle = this._labelColor;
        drawContext.textBaseline = "middle";
        drawContext.textAlign = "center";
        drawContext.font = this._fontHeight + "px " + this._labelFont;
    }
    
    _measureLabel() {
        let drawContext = canvas._canvas.getContext("2d");
        
        drawContext.save();
        this._setupText(drawContext);
        let measurements = drawContext.measureText(this._text);
        drawContext.restore();
        
        let numLines = 1 + (this._text.match(new RegExp("\n", "g")) || []).length;
        
        this._textWidth = measurements.width;
        this._textHeight = this._fontHeight * numLines;
    }
}

class Rect extends Shape {
    constructor (x, y, width, height) {
        let centerX = x + (width/2);
        let centerY = y + (height/2);
        super (centerX, centerY);
        
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }
    
    setX(x) {
        this._x = x;
        this._centerX = x + (this._width / 2);
    }
    
    setY(y) {
        this._y = y;
        this._centerY = y + (this._height / 2);
    }
    
    setWidth(width) {
        this._width = width;
    }
    
    getWidth() { return this._width; }
    
    setHeight(height) {
        this._height = height;
    }
    
    getHeight() { return this._height; }
    
    contains(x, y) {
        if ((x >= this._x) && (x <= (this._x + this._width)) &&
            (y >= this._y) && (y <= (this._y + this._width))) {
            return true;
        }
        
        return false;
    }
    
    draw(drawContext) {
        drawContext.save();

        if (this._fillColor) {
            drawContext.fillStyle = this._fillColor;
            drawContext.fillRect(this._x, this._y, this._width, this._height);
        }
        
        if (this._outlineColor) {
            drawContext.strokeStyle = this._outlineColor;
            drawContext.strokeRect(this._x, this._y, this._width, this._height);
        }
        
        super.draw(drawContext);
        
        drawContext.restore();
    }
}

class Circle extends Shape {
    constructor(x, y, radius) {
        radius = radius | 5;
        super(x, y);
        this._radius = radius;
    }
    
    setRadius(radius) {
        this._radius = radius;
    }
    
    getRadius() {
        return this._radius;
    }
    
    contains(x, y) {
        let distx = Math.abs(x - this._x);
        let disty = Math.abs(y - this._y);
        
        let dist = Math.sqrt((distx * distx) + (disty * disty));
        
        if (dist <= this._radius) {
            return true;
        }
        
        return false;
    }
    
    draw(drawContext) {
        drawContext.save();
        
        if (this._fillColor) {
            drawContext.fillStyle = this._fillColor;
        }
        
        if (this._outlineColor) {
            drawContext.strokeStyle = this._outlineColor;           
        }
        
        drawContext.beginPath();
        drawContext.arc(this._x, this._y,  this._radius, 0, 2*Math.PI);
        
        if (this._fillColor) {
            drawContext.fill(); 
        }
        
        if (this._outlineColor) {
            drawContext.stroke();
        }
        drawContext.closePath();
        
        super.draw(drawContext);
        
        drawContext.restore();
    }
}

class Line extends Shape {
    constructor (x, y, x2, y2) {
        let centerX = (x + x2) /2;
        let centerY = (y + y2) /2;
        super (centerX, centerY);
        
        this._x = x;
        this._y = y;
        this._x2 = x2;
        this._y2 = y2;
        this._width = 1;
    }
    
    setX(x) {
        this._x = x;
        this._centerX = x + (this._width / 2);
    }
    
    setY(y) {
        this._y = y;
        this._centerY = y + (this._height / 2);
    }
    
    setEndX(x) { this._x2 = x; };
    
    getEndX() { return this._x2; };
    
    setEndY(y) { this._y2 = y; };
    
    getEndY() { return this._y2; };
        
    setColor (color) { this._outlineColor = color; }
    
    setOutline (color) { this._outlineColor = color; }
    
    setWeight(weight) { this._weight = weight; }
    
    contains(x, y) {
        let a1 = this._x - x;
        let b1 = this._y - y;
        let a2 = this._x2 - x;
        let b2 = this._y2 - y;
        let a3 = this._x - this._x2;
        let b3 = this._y - this._y2;
        
        let d1 = Math.sqrt((a1 * a1) + (b1 * b1));
        let d2 = Math.sqrt((a2 * a2) + (b2 * b2));
        let d3 = Math.sqrt((a3 * a3) + (b3 * b3));
        
        return Math.abs((d1 + d2) - d3) < 0.005;
    }
        
    draw(drawContext) {
        drawContext.save();

        drawContext.strokeStyle = this._outlineColor;           

        drawContext.lineWidth = this._width;
        
        drawContext.beginPath();
        drawContext.moveTo(this._x, this._y);
        drawContext.lineTo(this._x2, this._y2);
        
        drawContext.stroke();
                
        super.draw(drawContext);
        
        drawContext.restore();
    }

}

class Text extends Shape {
    constructor (text, x, y) {
        super(x, y);        
        super.setLabel(text);
        this._labelColor = "#000";
        this._fillColor = null;
    }
    
    setText(text) {
        super.setLabel(text);
    }
    
    setFont (font) { this._labelFont = font; }
    
    setFontSize (pixels) {this._fontHeight = pixels; }
    
    getWidth() { return this._textWidth; }
    
    getHeight() { return this._textHeight; }
    
    setTextColor (color) { this._labelColor = color; }
    
    setTextOutline (color) { this._labelOutline = color; }
        
    contains(x, y) {
        this._measureLabel();
        
        let w = this._textWidth / 2;
        let h = this._textHeight / 2;
        
        if ((x >= this._x - w) && (x <= (this._x + w)) &&
            (y >= this._y - h) && (y <= (this._y + h))) {
            return true;
        }
        
        return false;
    }
    
    draw(drawContext) {
        this._measureLabel();
        
        let w = this._textWidth;
        let h = this._textHeight ;
        
        drawContext.save();
        
        if (this._fillColor) {
            drawContext.fillStyle = this._fillColor;
            drawContext.fillRect(this._x - w / 2, this._y - h / 2, w, h);
        }
       
        if (this._outlineColor) {
            drawContext.strokeStyle = this._outlineColor;
            drawContext.strokeRect(this._x - w / 2, this._y - h / 2, w, h);
        }
        
        super.draw(drawContext);
        
        drawContext.restore();
    }
}