var context;
var context2;
var canvas;
var canvas2;

var color1 = "#33AFFF";
var color2 = "red";
var color3 = "#38F344";
var color4 = "#8D0DBD";
var strokeWidth = 4;

//-------------Variables for Ball + Billiard----------------
var length = 0; //trajectory length
var sideLength = 130; //of table
var epsilon = 12;
var theta = Math.atan(0.5);
var startDetection = false;

var startX = 20;
var startY = 20;

corners = [
  [startX + 0, startY + 0],
  [startX + 0, startY + sideLength],
  [startX + sideLength, startY + 0],
  [startX + sideLength, startY + sideLength]
];
var x = startX;
var y = startY + sideLength;

var oldX = x;
var oldY = y;

var dx = 1;
// var dy = (dx * 1) / 1.6;
var dy;
var tanTheta;
// var dy= dx * 1/4.5;// var dy= dx * Math.tan(theta);

//-------------Variables for Four Square board ----------------
var fourSquareSideLength = 200; //of table
var fourSquareUnit = fourSquareSideLength / 2;
var fourSquareEpsilon = epsilon * (fourSquareUnit / sideLength);

var fourSquareStartX = 20;
var fourSquareStartY = 200;

var fourSquareX = fourSquareStartX;
var fourSquareY = fourSquareStartY + fourSquareSideLength;

var oldFourSquareX = fourSquareX;
var oldFourSquareY = fourSquareY;

var fourSquare_dx = dx * (fourSquareUnit / sideLength);
var fourSquare_dy;

//-------------Variables for Grid board----------------
var gridStartX = 320;
var gridStartY = 20;
var gridSideLength = 320;

var unit = 40;
var gridEpsilon = (epsilon / sideLength) * unit;

var gridx = gridStartX;
var gridy = gridStartY + gridSideLength;

var oldGridX = gridx;
var oldGridY = gridy;

var grid_dx = (dx / sideLength) * unit;
var grid_dy;

//-------------Variables for Torus ----------------
var c = 1.5; //c =  dist(center, tube center)
var a = 0.6; //a = radius of cube circle

//-------------Variables for curve on Torus ----------------
var torusMesh;
// curve should need scene,camera,light
// var pts;
var scene = null;
var camera;
var light;
var curveObject;

var stopLook = false;
var slider_rotateX;
var slider_rotateY;
//-------------Other Variables -----------------------
trace = false;
var interval;

function resetVariables() {
  console.log("LINE 66: entered  resetVariables ");
  x = startX;
  y = startY + sideLength;
  gridx = gridStartX;
  gridy = gridStartY + gridSideLength;
  fourSquareX = fourSquareStartX;
  fourSquareY = fourSquareStartY + fourSquareSideLength;

  speedInput = document.getElementById("speedInput");
  if (speedInput == null) dx = 1;
  else dx = parseFloat(speedInput.value);
  // dx = 2;
  console.log("LINE 75: dx = ", dx);

  dy = -dx * tanTheta;

  grid_dx = (dx / sideLength) * unit;
  grid_dy = (dy / sideLength) * unit;

  fourSquare_dx = dx * (fourSquareUnit / sideLength);
  fourSquare_dy = dy * (fourSquareUnit / sideLength);
}

function reset() {
  end();
  interval = null;
  resetVariables();

  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  context.setLineDash([]); //back to solid line

  cavas = null;
  scene = null;
  context = null;
  canvas2 = null;
  render = null;
  stopLook = false;

  // context.clearRect(0, 0, canvas.width, canvas.height);
  // while (scene.children.length > 0) {
  //   scene.remove(scene.children[0]);
  // }
  console.log("In reset: have cleared canvas and scene");

  init();
  console.log("In reset: have draw 2 boards and torus.");
}

function updateLength() {
  var trajectoryLength = document.getElementById("length");
  trajectoryLength.innerHTML = "Trajectory Length = " + length;
}

function init() {
  updateLength();
  resetVariables();

  //process sliders
  var slider_theta = document.getElementById("slider1");
  var slider_epsilon = document.getElementById("slider2");
  var slider_speed = document.getElementById("slider3");

  slider_rotateX = document.getElementById("rotateSlider1");
  slider_rotateY = document.getElementById("rotateSlider2");
  // Update the current slider value (each time you drag the slider handle)
  slider_rotateX.oninput = function () {
    if (stopLook) scene.rotation.x = this.value
  };
  slider_rotateY.oninput = function () {
    if (stopLook) scene.rotation.y = this.value
  };


  thetaInput = document.getElementById("thetaInput");
  epsilonInput = document.getElementById("epsilonInput");
  speedInput = document.getElementById("speedInput");

  theta.value = (this.value / 100) * (Math.PI / 2); // Display the default slider value
  // dx = speedInput.value;
  console.log("LINE 120: speedInput.value = ", speedInput.value);

  // Update the current slider value (each time you drag the slider handle)
  slider_theta.oninput = function () {
    thetaInput.value = (this.value / 100) * (Math.PI / 2);
  };

  slider_epsilon.oninput = function () {
    epsilonInput.value = this.value / 100;
    epsilon = sideLength * epsilonInput.value;
    gridEpsilon = (epsilon / sideLength) * unit;
    reset();
    drawBilliardBoard();
    drawGridBoard();
  };

  slider_speed.oninput = function () {
    speedInput.value = this.value;
    // dx = speedInput.value;
    console.log("LINE 136: change speedInput.value to = ", speedInput.value);
  };

  // Draw the billiard board
  startDetection = false;

  canvas = document.getElementById("mycanvas");
  canvas.height = 420;
  canvas.width = 700;
  console.log(canvas.width, canvas.height);

  context = canvas.getContext("2d");

  // Draw the corresponding grid

  drawBilliardBoard();
  drawFourSquareBoard();
  drawGridBoard();
  drawTorus();

  window.removeEventListener("click", onMouseClick);
  window.addEventListener("resize", onWindowResize, false);
}

function end() {
  clearInterval(interval); // Needed for Chrome to end game
}

function modeChosen() {
  reset();
  init();
  console.log("--Mode Chosen!");
  var shootStyleChosen = document.getElementsByName("shootStyle");
  var chosenShootByMouse = shootStyleChosen[1].checked;
  console.log("use mouse to shoot?", chosenShootByMouse);

  if (chosenShootByMouse) mouseMode();
  else inputMode();
}

function stopLookAt() {
  var checkBox = document.getElementById("checkStop");
  // console.log("Stop look at? this.checked =", checkBox.checked);
  stopLook = checkBox.checked;
}


// ===========Input Mode===============

function inputMode() {
  console.log("Entered input mode.");
  window.removeEventListener("click", onMouseClick);
}

function mouseMode() {
  console.log("Entered mouse mode.");
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onMouseClick);
}

//for btn: Shoot
function shootByInput() {
  reset();
  init();
  console.log("user has clicked Shoot button");
  thetaInput = document.getElementById("thetaInput");
  tanTheta = Math.tan(thetaInput.value);

  context.clearRect(startX, startY, sideLength, sideLength);
  drawBilliardBoard();

  dy = -dx * tanTheta;
  grid_dy = (dy / sideLength) * unit;
  fourSquare_dy = dy * (fourSquareUnit / sideLength);

  interval = setInterval(draw, 10);
}

function onMouseMove(event) {
  context.clearRect(startX, startY, sideLength, sideLength);
  drawBilliardBoard();

  var mouse = [event.clientX, event.clientY];
  context.setLineDash([5, 3]); // dashed line: dashes 5px and spaces 3px
  context.beginPath();
  context.moveTo(startX, startY + sideLength);

  var canvasStartX = canvas.getBoundingClientRect().x;
  var canvasStartY = canvas.getBoundingClientRect().y;

  var movex = mouse[0];
  var movey = mouse[1];
  // if (movex > canvasStartX)
  movex -= canvasStartX;
  // if (movey > canvasStartY)
  movey -= canvasStartY;

  tanTheta = (startY + sideLength - movey) / (movex - startX);

  if (movex > startX + sideLength) {
    movex = startX + sideLength;
    movey = startY + sideLength - sideLength * tanTheta;
  }
  if (movey < startY) {
    movey = startY;
    movex = startX + sideLength / tanTheta;
  }
  if (movex < startX) movex = startX;
  if (movey > startY + sideLength) movey = startY + sideLength;

  context.lineTo(movex, movey);
  context.strokeStyle = "red";
  context.stroke();
  context.closePath();
  context.setLineDash([]); // set back to solid line
}

function onMouseClick(event) {
  // event.preventDefault();
  reset();
  init();

  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("click", onMouseClick);
  context.clearRect(startX, startY, sideLength, sideLength);
  drawBilliardBoard();

  console.log("SHOOT!!! tanTheta = ", tanTheta);

  dy = -dx * tanTheta;
  grid_dy = (dy / sideLength) * unit;
  console.log(
    "onMouseClick: dx, dy, grid_dx, grid_dy = ",
    dx,
    dy,
    grid_dx,
    grid_dy
  );
  interval = setInterval(draw, 10);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function captured(xpos, ypos) {
  for (var i = 0; i < corners.length; i++) {
    currx = corners[i][0];
    curry = corners[i][1];
    if (distance(xpos, ypos, currx, curry) < epsilon) {
      return true;
    }
  }
  return false;
}

function drawFilledCircle(xpos, ypos, radius) {
  context.beginPath();
  context.fillStyle = "orange";
  context.arc(xpos, ypos, radius, 0, Math.PI * 2, true);
  context.closePath();
  context.fill();
}

function drawCorners() {
  for (var i = 0; i < corners.length; i++) {
    currx = corners[i][0];
    curry = corners[i][1];

    drawFilledCircle(currx, curry, epsilon);
  }
}

function draw(trace) {
  //Now draw the trajectory(a small ball is running)

  oldX = x;
  oldY = y;
  // Boundary Logic
  if (!(x == startX && y == startY + sideLength)) {
    if (x <= startX || x > startX + sideLength - dx) dx = -dx;
    if (y <= startY - dy || y >= startY + sideLength) dy = -dy;
  }
  x += dx;
  y += dy;

  drawLineTo(oldX, oldY, x, y, "#0095DD", 2);

  console.log("Dashed? ", context.getLineDash());

  //-----------------------------Four Square Path Draw-----------------------:
  oldFSX = fourSquareX;
  oldFSY = fourSquareY;

  if (!(fourSquareX == fourSquareStartX && fourSquareY == fourSquareStartY + fourSquareSideLength)) {
    if (oldFSX >= fourSquareStartX + fourSquareSideLength) {
      oldFSX -= fourSquareSideLength;
      fourSquareX -= fourSquareSideLength;
    }
    if (oldFSY <= fourSquareStartY) {
      oldFSY += fourSquareSideLength;
      fourSquareY += fourSquareSideLength;
    }
  }

  fourSquareX += fourSquare_dx;
  fourSquareY += fourSquare_dy;

  console.log("fourSquareX, fourSquareY, fourSquare_dx, fourSquare_dy =", fourSquareX, fourSquareY, fourSquare_dx, fourSquare_dy)
  // if (oldFSX > fourSquareUnit):

  drawLineTo(oldFSX, oldFSY, fourSquareX, fourSquareY, "#0095DD", 2);

  //-----------------------------Grid Path Draw --------------------------------------:
  oldGridX = gridx;
  oldGridY = gridy;
  gridx += grid_dx;
  gridy += grid_dy;

  drawLineTo(oldGridX, oldGridY, gridx, gridy, "#0095DD", 2);

  var xIncrement = Math.abs((gridx - gridStartX) / unit);
  var yIncrement = Math.abs((gridy - (gridStartY + gridSideLength)) / unit);
  console.log("normed x y =", xIncrement, yIncrement);

  length = Math.sqrt(xIncrement * xIncrement + yIncrement * yIncrement);
  updateLength();

  //---------------------------------------draw torus path------------------------------
  rotate(); //now curve posx,y,z are incremented!

  drawTorusCurve();
  //---------------------------------------IF captured, then End---------------------------------:

  if (distance(x, y, startX, startY + sideLength) > epsilon)
    startDetection = true;

  if (startDetection && captured(x, y)) end();
} //end draw(trace)

function drawLineTo(x1, y1, x2, y2, color, width) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.strokeStyle = "black";
  context.closePath();
}

function drawBilliardBoard(trace) {
  //---------Billiard Ball Draw--------:
  if (trace == false) context.clearRect(0, 0, sideLength, sideLength);

  drawLineTo(startX, startY + sideLength, startX, startY, color1, strokeWidth);
  drawLineTo(startX, startY, startX + sideLength, startY, color2, strokeWidth);
  drawLineTo(
    startX + sideLength,
    startY,
    startX + sideLength,
    startY + sideLength,
    color3,
    strokeWidth
  );
  drawLineTo(
    startX + sideLength,
    startY + sideLength,
    startX,
    startY + sideLength,
    color4,
    strokeWidth
  );

  drawCorners();
}

// ===============Draw Four Square================
function drawFourSquareBoard() {
  drawLineTo(
    fourSquareStartX,
    fourSquareStartY,
    fourSquareStartX,
    fourSquareStartY + fourSquareSideLength,
    color1,
    strokeWidth
  );

  drawLineTo(
    fourSquareStartX + fourSquareSideLength,
    fourSquareStartY,
    fourSquareStartX + fourSquareSideLength,
    fourSquareStartY + fourSquareSideLength,
    color1,
    strokeWidth
  );

  drawLineTo(
    fourSquareStartX,
    fourSquareStartY,
    fourSquareStartX + fourSquareSideLength,
    fourSquareStartY,
    color4,
    strokeWidth
  );
  drawLineTo(
    fourSquareStartX,
    fourSquareStartY + fourSquareSideLength,
    fourSquareStartX + fourSquareSideLength,
    fourSquareStartY + fourSquareSideLength,
    color4,
    strokeWidth
  );

  //middle two lines
  drawLineTo(
    fourSquareStartX,
    fourSquareStartY + fourSquareSideLength / 2,
    fourSquareStartX + fourSquareSideLength,
    fourSquareStartY + fourSquareSideLength / 2,
    color2,
    strokeWidth
  );

  drawLineTo(
    fourSquareStartX + fourSquareSideLength / 2,
    fourSquareStartY,
    fourSquareStartX + fourSquareSideLength / 2,
    fourSquareStartY + fourSquareSideLength,
    color3,
    strokeWidth
  );

  var currx;
  var curry;
  //draw corners (pockets)
  for (var i = 0; i <= fourSquareSideLength; i += fourSquareSideLength / 2) {
    for (var j = 0; j <= fourSquareSideLength; j += fourSquareSideLength / 2) {
      currx = fourSquareStartX + i;
      curry = fourSquareStartY + j;
      context.moveTo(currx, curry);
      drawFilledCircle(currx, curry, fourSquareEpsilon);
    }
  }
}

// ===============Draw Grid================
function drawGridBoard() {
  var isColor1 = true;
  var isColor2 = false;
  var tempColor;

  for (var i = 0; i <= gridSideLength; i += unit) {
    //horizontal

    if (isColor1) tempColor = color1;
    else tempColor = color3;
    drawLineTo(
      gridStartX + i,
      gridStartY,
      gridStartX + i,
      gridStartY + gridSideLength,
      tempColor,
      strokeWidth
    );
    isColor1 = !isColor1;
  }

  for (var i = gridSideLength; i >= 0; i -= unit) {
    //vertical

    if (isColor2) tempColor = color2;
    else tempColor = color4;
    drawLineTo(
      gridStartX,
      gridStartY + i,
      gridStartX + gridSideLength,
      gridStartY + i,
      tempColor,
      strokeWidth
    );
    isColor2 = !isColor2;
  }

  //Draw all lattice filled circles
  for (var i = 0; i <= gridSideLength; i += unit) {
    for (var j = 0; j <= gridSideLength; j += unit) {
      currx = gridStartX + i;
      curry = gridStartY + j;
      context.moveTo(currx, curry);
      drawFilledCircle(currx, curry, gridEpsilon);
    }
  }
}

//=================RotateTorus==================
function rotate() {
  scene.rotation.x += 0.002;
  scene.rotation.y += 0.002;
}

// ===============Draw Torus+Curve================

function drawTorus() {
  //---------Set up scene & camera & light -------------
  canvas2 = document.getElementById("mycanvas2");

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    80, //field of view
    canvas2.clientWidth / canvas2.clientHeight, //aspect ratio
    // window.innerWidth / window.innerHeight, //aspect ratio //XIaomin: problem about asp ratio!!
    0.1, //near plane
    1000 //far plane
  );

  camera.position.z = 4;
  var threejsWidth = 360;
  var threejsHeight = 360; //changed from 500 to 100 for debugging

  var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas2 });

  renderer.setClearColor("#e5e5e5");
  renderer.setSize(threejsWidth, threejsHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    renderer.setSize(threejsWidth, threejsHeight);
    camera.aspect = threejsWidth / threejsHeight;
    camera.updateProjectionMatrix();
  });

  //var raycaster = new THREE.Raycaster();
  //var mouse = new THREE.Vector2();

  light = new THREE.PointLight(0xffffff, 1, 500);
  light.position.set(10, 0, 25); //x,y,z
  scene.add(light);

  //---------Torus-------------
  var geometry = new THREE.ParametricGeometry(
    function (u, v, res) {
      tempx = (c + a * Math.cos(v * 2 * Math.PI)) * Math.cos(u * 2 * Math.PI);
      tempy = (c + a * Math.cos(v * 2 * Math.PI)) * Math.sin(u * 2 * Math.PI);
      tempz = a * Math.sin(v * 2 * Math.PI);
      res.set(tempx, tempy, tempz);
    },
    60, //slices
    150 //stacks
  );

  var material = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.4
  });
  torusMesh = new THREE.Mesh(geometry, material);
  scene.add(torusMesh);

  // ----------modeChosen look At Mouse----------
  function onMouseMove(event) {
    // event.preventDefault();
    if (stopLook) return;

    var mouse3D = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    scene.lookAt(mouse3D);
  }
  window.addEventListener("mousemove", onMouseMove);




  //---------Torus Pocket 1-------------

  var torusEpsilon = 1 * (fourSquareEpsilon / fourSquareSideLength);

  var pocketGeometry = new THREE.ParametricGeometry(
    function (u, v, res) {
      //u,v range is from 0 to 1
      //the pocket on the torus should be distorted to an ellipse!
      //we have u,v range as (0, 1) but on torus they corresponds to (-torusE, torusE)


      //uu and vv are in (0,torusE) U (1-torusE, 1)
      var uu;
      if (u < 1 / 2) {
        uu = (2 * torusEpsilon * u) + 1 - torusEpsilon
      } else {
        uu = (u - 1 / 2) * 2 * torusEpsilon
      }

      var vv;
      if (v < 1 / 2) {
        vv = (2 * torusEpsilon * v) + 1 - torusEpsilon
      } else {
        vv = (v - 1 / 2) * 2 * torusEpsilon
      }

      // console.log("2019.11.30: torusEpsilon, uu, vv = ", torusEpsilon, uu, vv);


      var uuDist = uu < 1 / 2 ? uu : (1 - uu); // distant of u from the closest integer point: either 0 or 1
      var vvDist = vv < 1 / 2 ? vv : (1 - vv); // distant of v from the closest integer point: either 0 or 1

      var vvDistMax = Math.sqrt(torusEpsilon * torusEpsilon - uuDist * uuDist);
      // console.log("vvDistMax =", vvDistMax);
      if (vvDist <= Math.abs(vvDistMax)) {
        // if (true) {
        aa = a + 0.01 // in order to shift pocket out a bit of torus surface  
        tempx = (c + aa * Math.cos(vv * 2 * Math.PI)) * Math.cos(uu * 2 * Math.PI);
        tempy = (c + aa * Math.cos(vv * 2 * Math.PI)) * Math.sin(uu * 2 * Math.PI);
        tempz = aa * Math.sin(vv * 2 * Math.PI);
        res.set(tempx, tempy, tempz);
      }
    },
    80, //slices
    80 //stacks
  );

  var pocketMaterial = new THREE.MeshBasicMaterial({
    color: "orange",
    transparent: true,
    opacity: 0.7
  });
  pocketMesh = new THREE.Mesh(pocketGeometry, pocketMaterial);

  scene.add(pocketMesh);


  //---------Torus Pocket 2 - only change u-------------

  var pocketGeometry2 = new THREE.ParametricGeometry(
    function (u, v, res) {
      //u,v range is from 0 to 1
      //For pocket 2,  uu in (1/2-torusE, 1/2+torusE)
      // vv in (0,torusE) U (1-torusE, 1)
      var uu = 2 * torusEpsilon * u - torusEpsilon + 1 / 2;

      var vv;
      if (v < 1 / 2) {
        vv = (2 * torusEpsilon * v) + 1 - torusEpsilon
      } else {
        vv = (v - 1 / 2) * 2 * torusEpsilon
      }


      // console.log("2019.11.30: torusEpsilon, uu, vv = ", torusEpsilon, uu, vv);


      var uuDist = Math.abs(uu - 1 / 2)
      var vvDist = vv < 1 / 2 ? vv : (1 - vv); // distant of v from the closest integer point: either 0 or 1

      // console.log("2019.11.30: torusEpsilon,uuDist, vvDist = ", torusEpsilon, uuDist, vvDist);

      var vvDistMax = Math.sqrt(torusEpsilon * torusEpsilon - uuDist * uuDist);
      // console.log("vvDistMax =", vvDistMax);
      if (vvDist <= Math.abs(vvDistMax)) {
        // if (true) {
        aa = a + 0.01 // in order to shift pocket out a bit of torus surface  
        tempx = (c + aa * Math.cos(vv * 2 * Math.PI)) * Math.cos(uu * 2 * Math.PI);
        tempy = (c + aa * Math.cos(vv * 2 * Math.PI)) * Math.sin(uu * 2 * Math.PI);
        tempz = aa * Math.sin(vv * 2 * Math.PI);
        res.set(tempx, tempy, tempz);
      }
    },
    80, //slices
    80 //stacks
  );


  var pocketMaterial2 = new THREE.MeshBasicMaterial({
    color: "#0FD3FE",
    transparent: true,
    opacity: 0.7
  });
  var pocketMesh2 = new THREE.Mesh(pocketGeometry2, pocketMaterial2);

  scene.add(pocketMesh2);



  //---------Render-------------
  torusMesh.rotation.x = 1;
  pocketMesh.rotation.x = 1;
  pocketMesh2.rotation.x = 1;
  torusMesh.rotation.z = 1.6;
  pocketMesh.rotation.z = 1.6;
  pocketMesh2.rotation.z = 1.6;
  //Debug: use this line to adjust the initial view of the whole scene:
  // scene.rotation.x += 3.6

  var render = function () {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    //draw renderer at every refresh,
    // thus when scale the window, the sphere is not distored
  };
  render();
}

function drawTorusCurve() {
  scene.remove(curveObject); //Need to remove the old curve

  // //---------Curve-------------

  gridShootX = gridStartX;
  maxU = (gridx - gridShootX) / (2 * unit);

  gridShootY = gridStartY + gridSideLength;
  maxV = (gridShootY - gridy) / (2 * unit);

  var pts = [];
  resolution = gridx;
  var u = 0;
  var v = 0;
  for (
    var i = 0;
    i <= resolution;
    i++ , u += maxU / resolution, v += maxV / resolution
  ) {
    tempx = (c + a * Math.cos(v * 2 * Math.PI)) * Math.cos(u * 2 * Math.PI);
    tempy = (c + a * Math.cos(v * 2 * Math.PI)) * Math.sin(u * 2 * Math.PI);
    tempz = a * Math.sin(v * 2 * Math.PI);
    tempVec = new THREE.Vector3(tempx, tempy, tempz);
    pts.push(tempVec);
    // console.log("Pushed:", tempx,tempy,tempz);
    // console.log("pts.length:", pts.length);
  }
  // console.log("pts.length = ", pts.length);

  var curve = new THREE.CatmullRomCurve3(pts);
  var finalPoints = curve.getPoints(pts.length);
  var geometry = new THREE.BufferGeometry().setFromPoints(finalPoints);
  var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  // Create the final object to add to the scene
  curveObject = new THREE.Line(geometry, material);

  scene.add(curveObject);
  curveObject.rotation.x = 1;
  curveObject.rotation.z = 1.6;
}

function onWindowResize() {
  // camera.aspect = (window.innerWidth - 1000) / window.innerHeight;
  // camera.updateProjectionMatrix();
}





