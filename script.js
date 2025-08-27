const pi = Math.PI;
const stroke_width = 40;
const g = 9800;
const damp = 0.3;
let canvas = document.getElementById("canvas");
canvas.style.background = "black"

var window_height = window.innerHeight;
var window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;

let ctx = canvas.getContext("2d");

class pendulumClass {
    constructor(length, angle, radius){
        this.max_length = canvas.height/2-radius-stroke_width
        this.length = Math.min(length, this.max_length);
        this.angle = angle;
        this.radius = radius;
        this.updatePosition();
        this.velocity = 0;
        this.previousTime = performance.now();
    }

    updatePosition () {
        this.x = this.length*Math.sin(this.angle)+canvas.width/2;
        this.y = this.length*Math.cos(this.angle)+canvas.height/2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw(ctx);
    }
    draw(ctx){
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = stroke_width*0.75
        ctx.fillStyle = "lightblue";
        ctx.arc(canvas.width/2, canvas.height/2, 15, 0, 2*pi);
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = stroke_width
        ctx.arc(this.x, this.y, this.radius, 0, 2*pi);
        ctx.stroke();
        ctx.fill();
    }
    isMouseOver(mx, my){
        const dx = mx-this.x - canvas.offsetLeft;
        const dy = my-this.y-canvas.offsetTop;
        return dx**2+dy**2<(this.radius+stroke_width/2)**2
    }
    setPositionByMouse (mx, my) {
        const dx = mx-canvas.width/2 - canvas.offsetLeft;
        const dy = my-canvas.height/2-canvas.offsetTop;
        this.angle = Math.atan2(dx, dy);
        const currentAngle = Math.atan2(this.y-canvas.height/2, this.x-canvas.width/2);
        this.updatePosition();
        this.velocity = Math.min(
            (Math.atan2(this.y-canvas.height/2, this.x-canvas.width/2)-currentAngle)/this.getDelta(),
            30
        );
    }
    move(){
        let dt = this.getDelta();
        this.velocity += (g*Math.sin(this.angle)/this.length-damp*this.velocity)*dt;
        this.angle -= this.velocity*dt;
        this.updatePosition();
    }
    getDelta(){
        let currentTime = performance.now();
        let dt = (currentTime-this.previousTime)/1000;
        this.previousTime = currentTime;
        return Math.min(dt, 0.05)
    }
}

let pendulum = new pendulumClass(canvas.height, 0, 50);

function updatePendulum(){
    if (!dragging) pendulum.move();
    requestAnimationFrame(updatePendulum);
}
requestAnimationFrame(updatePendulum);

let dragging = false;
canvas.addEventListener("mousedown", (e)=>{
    if (pendulum.isMouseOver(e.clientX, e.clientY)){
        dragging=true;
        canvas.style.cursor = "grabbing";
    }
})
canvas.addEventListener("mousemove", (e)=>{
    if (pendulum.isMouseOver(e.clientX, e.clientY)){
        canvas.style.cursor = "pointer"
    } else {
        canvas.style.cursor = "default"
    }
    if(dragging){
        pendulum.setPositionByMouse(e.clientX, e.clientY);
    }
})
canvas.addEventListener("mouseup", () => {
    dragging = false;
    canvas.style.cursor = "default";
    pendulum.previousTime = performance.now();
});
canvas.addEventListener("mouseleave", ()=>{
    dragging=false;
    canvas.style.cursor = "default";
    pendulum.previousTime = performance.now();
})

canvas.addEventListener("touchstart", (e)=>{
    let touch = e.touches[0]
    if (pendulum.isMouseOver(touch.clientX, touch.clientY)){
        dragging=true;
    }
    e.preventDefault();
}, {passive:false})
canvas.addEventListener("touchmove", (e)=>{
    let touch = e.touches[0]
    if(dragging){
        pendulum.setPositionByMouse(touch.clientX, touch.clientY);
    }
    e.preventDefault();
}, {passive:false})
canvas.addEventListener("touchend", () => {
    dragging = false;
    pendulum.previousTime = performance.now();
});
canvas.addEventListener("touchcancel", ()=>{
    dragging=false;
    pendulum.previousTime = performance.now();
})
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        previousTime = null;
    }
});