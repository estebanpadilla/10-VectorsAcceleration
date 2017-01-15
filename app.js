window.addEventListener('load', init, false);

function init() {
    window.addEventListener('keydown', keydownHandler, false);
    window.addEventListener('keyup', keyupHandler, false);
    console.log('init');

    let canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let context = canvas.getContext('2d');

    let ball = SGVBall(Vector(window.innerWidth / 2, window.innerHeight / 2), 20, AppColors().red, -30);

    function update() {
        ball.update();

        context.beginPath();
        context.fillStyle = AppColors().lightblue;
        context.arc((ball.position.x + ball.radius), (ball.position.y + ball.radius), 20, 0, Math.PI * 2, true);
        context.fill();

        requestAnimationFrame(update);
    }
    update();

    function keydownHandler(e) {
        switch (e.keyCode) {
            case 37:
                ball.doLeft = true;
                break;
            case 38:
                ball.doAcceleration = true;
                break;
            case 39:
                ball.doRight = true;
                break;
            default:
                break;
        }
    }

    function keyupHandler(e) {
        switch (e.keyCode) {
            case 37:
                ball.doLeft = false;
                break;
            case 38:
                ball.doAcceleration = false;
                break;
            case 39:
                ball.doRight = false;
                break;
            default:
                break;
        }
    }
}

function SGVBall(position, radius, color, angle) {

    if (!(this instanceof SGVBall)) {
        return new SGVBall(position, radius, color, angle);
    }

    this.position = position;
    this.radius = radius;
    this.color = color;
    this.svg;
    this.circle;
    this.head;
    this.group;
    this.angle = angle;
    this.velocity = Vector();
    this.acceleration = Vector();
    this.friction = Vector();
    this.gravity = Vector();

    this.gravityForce = 0.2;
    this.gravityAngle = 90;

    this.force = 0.1;
    this.frictionForce = 0.05;

    this.doGravity = false;
    this.doFriction = true;
    this.doAcceleration = false;
    this.doLeft = false;
    this.doRight = false;

    this.render();
    this.update();

}

SGVBall.prototype.update = function () {

    let vmag = this.velocity.magnitude();

    if (this.doLeft) {
        this.angle += 4;
        this.rotate((this.angle));
        this.velocity.setComponents(this.angle, vmag);
    }

    if (this.doRight) {
        this.angle -= 4;
        this.rotate((this.angle));
        this.velocity.setComponents(this.angle, vmag);
    }

    if (this.doGravity) {
        this.gravity.setComponents(this.gravityAngle, this.gravityForce);
        this.velocity.setComponents(this.angle, vmag);
    }

    if (this.doAcceleration) {
        this.doFriction = true;
        this.acceleration.setComponents(this.angle, this.force);
    } else {
        this.doAcceleration = false;
        this.acceleration.zero();
        if (vmag > -1 && vmag < 1) {
            this.velocity.zero();
            this.friction.zero();
            this.doFriction = false;
        }
    }

    if (this.doFriction) {
        console.log('do');
        this.friction.setComponents(this.angle, this.frictionForce);
    }

    this.position.add(this.velocity.add(this.gravity).remove(this.friction).add(this.acceleration));

    this.svg.style.left = this.position.x;
    this.svg.style.top = this.position.y;
}

SGVBall.prototype.rotate = function (value) {
    this.group.setAttribute('transform', 'rotate(' + value + ' ' + this.radius + ' ' + this.radius + ')');
}

SGVBall.prototype.render = function () {
    let xmlns = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(xmlns, 'svg');
    this.svg.setAttribute('width', (this.radius * 2));
    this.svg.setAttribute('height', (this.radius * 2));
    this.svg.style.fill = this.color;
    document.body.appendChild(this.svg);

    this.group = document.createElementNS(xmlns, 'g');
    this.circle = document.createElementNS(xmlns, 'circle');
    this.circle.setAttribute('cx', this.radius);
    this.circle.setAttribute('cy', this.radius);
    this.circle.setAttribute('r', this.radius);
    this.group.appendChild(this.circle);
    this.svg.appendChild(this.group);

    this.head = document.createElementNS(xmlns, 'circle');
    this.head.setAttribute('cx', this.radius + (this.radius / 2));
    this.head.setAttribute('cy', this.radius);
    this.head.setAttribute('r', 4);
    this.head.style.fill = 'white';
    this.group.appendChild(this.head);
}
