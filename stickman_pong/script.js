function pong() {
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
window.webkitRequestAnimationFrame || 
window.mozRequestAnimationFrame    || 
window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     ||  
function( callback ){
return window.setTimeout(callback, 1000 / 60);
};
})();

window.cancelRequestAnimFrame = ( function() {
return window.cancelAnimationFrame          ||
window.webkitCancelRequestAnimationFrame    ||
window.mozCancelRequestAnimationFrame       ||
window.oCancelRequestAnimationFrame     ||
window.msCancelRequestAnimationFrame        ||
clearTimeout
} )();


var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  W = (window.innerWidth < 850 ? window.innerWidth : 850),
  H = window.innerHeight,
  ball = {},
  theo = {},
  paddle = {},
  mouse = {},
  health = 8,
  lives = 3,
  fps = 60,
  flag = 0,
  particlePos = {},
  startBtn = {},
  restartBtn = {},
  resumeBtn = {},
  botHit = false,
  over = 0,
  init;

canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", btnClick, true);

canvas.width = W;
canvas.height = H;

function paintCanvas() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, W, H);
}

function Paddle(pos) {
  this.h = 5;
  this.w = 150;
  this.x = W/2 - this.w/2;
  this.y = (pos == "top") ? 0 : H - this.h;
}

paddle = new Paddle("bottom");

ball = {
  x: Math.random() * W,
  y: H/2, 
  r: 5,
  color: "white",
  vx: 4,
  vy: 8,
  draw: function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
    ctx.fill();
  }
};

theo = {
  x: W/2 - 50,
  y: 20,
  w: 100,
  h: 38,
  draw: function() {
    ctx.lineWidth = "1";
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(W/2, 30, 5, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    
    ctx.moveTo(W/2, 35);
    ctx.lineTo(W/2, 45);
    ctx.stroke();
    
    ctx.moveTo(W/2, 40);
    ctx.lineTo(W/2 + 10, 45);
    ctx.stroke();
    
    ctx.moveTo(W/2, 40);
    ctx.lineTo(W/2 - 10, 45);
    ctx.stroke()
    
    ctx.moveTo(W/2, 45);
    ctx.lineTo(W/2 + 10, 55);
    ctx.stroke();
    
    ctx.moveTo(W/2, 45);
    ctx.lineTo(W/2 - 10, 55);
    ctx.stroke();
    
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
};

startBtn = {
  w: 100,
  h: 50,
  x: W/2 - 50,
  y: H/2 - 25,
  draw: function() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = "2";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStlye = "white";
    ctx.fillText("Hit the stick-figure to reduce health (top left)", W/2, H/2 - 100);
    ctx.fillText("When the ball hits the bottom, you lose a life (top right)", W/2, H/2 - 60);
    ctx.fillText("Start", W/2, H/2);
  }
};

restartBtn = {
  w: 100,
  h: 50,
  x: W/2 - 50,
  y: H/2 - 50,
  draw: function() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = "2";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStlye = "white";
    ctx.fillText("Restart", W/2, H/2 - 25 );
  }
};

resumeBtn = {
  w: 100,
  h: 50,
  x: W/2 - 50,
  y: H/2 - 50,
  draw: function() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = "2";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    ctx.font = "18px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStlye = "white";
    ctx.fillText("Resume", W/2, H/2 - 25 );
  }
};

function draw() {
  paintCanvas();
  
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  
  theo.draw();
  
  ball.draw();
  update();
}

function trackPosition(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
}

function update() {
 updateScore(); 
  
  if (health == 0)
    gameOver(0);
  
  if (mouse.x && mouse.y) {
      paddle.x = mouse.x - paddle.w/2;
  }
  ball.x += ball.vx;
  ball.y += ball.vy;
  
  if (collides(ball, paddle)) {
    collideAction(ball, paddle);
  }
  
  else if (ball.y <= theo.y + theo.h && (ball.x >= theo.x && ball.x <= theo.x + theo.w)) {
    ball.vy = -ball.vy;
    ball.y = theo.y + theo.h + ball.r;
    health--;
    increaseSpeed();
  }
  else {
    if (ball.y + ball.r > H) {
    bottomCollideAction();
  } 
  else if (ball.y < 0) {
    ball.vy = -ball.vy;
    ball.y = ball.r;
  }
  if (ball.x + ball.r > W) {
    ball.vx = -ball.vx;
    ball.x = W - ball.r;
  }
  else if (ball.x -ball.r < 0) {
    ball.vx = -ball.vx;
    ball.x = ball.r;
  }
  }
  flag = 0;
}

function collides(b, p) {
if (b.x + ball.r >= p.x && b.x - ball.r <=p.x + p.w) {
  if (b.y >= (p.y - p.h) && p.y > 0){
    return true;
  }
    else return false;
  }
}

function collideAction(ball, p) {
  ball.vy = -ball.vy;
  ball.y = p.y - p.h;
  flag = 1;
}

function bottomCollideAction() {
  botHit = true;
  lives--;
  
  if (lives == 0)
    gameOver(1);
  else {
    ctx.fillStlye = "white";
    ctx.font = "20px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("You lost a life!", W/2, H/2 + 25);
    ctx.fillText("You now have " + lives + " lives.", W/2, H/2 + 50);
    
    cancelRequestAnimFrame(init);
    
    resumeBtn.draw();
  }
}

function increaseSpeed() {
  if (Math.abs(ball.vx) < 15) {
		ball.vx += (ball.vx < 0) ? -0.8 : 0.8;
		ball.vy += (ball.vy < 0) ? -0.8 : 0.8;
	}
}

function updateScore() {
  ctx.fillStlye = "white";
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Health: " + health, 20, 20);
  ctx.textAlign = "right";
  ctx.fillText("Lives: " + lives, W - 20, 20);
}

function gameOver(reason) {
  ctx.fillStlye = "white";
  ctx.font = "20px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", W/2, H/2 + 25);
  ctx.fillText(reason == 0 ? "You win!" : "You lose - No lives.", W/2, H/2 + 50);
  cancelRequestAnimFrame(init);
  over = 1;
  
  health = 8;
  
  lives = 3;
  restartBtn.draw();
}

function animloop() {
  init = requestAnimFrame(animloop);
  draw();
}

function startScreen() {
  draw();
  startBtn.draw();
}

function btnClick(e) {
  var mx = e.pageX,
  my = e.pageY;
  if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
  animloop();
      
  startBtn = {};
}
  
  if (botHit && over == 0) {
    if (mx >= resumeBtn.x && mx <= resumeBtn.x + resumeBtn.w) {
      ball.x = Math.random() * W;
      ball.y = H/2;
      if (ball.vx > 4 && ball.vy > 8) {
        ball.vx -= (ball.vx < 0) ? -0.8 : 0.8;
		    ball.vy -= (ball.vy < 0) ? -0.8 : 0.8;
      }
      
      animloop();
      
      botHit = false;
    }  
  }
 if (over == 1) {
    if (mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
      ball.x = Math.random() * W;
      ball.y = H/2;
      ball.vx = 4;
      ball.vy = 8;
      
      animloop();
      
      over = 0;
    }
  }
}

startScreen();
}
