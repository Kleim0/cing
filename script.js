const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const cw = canvas.width;
const ch = canvas.height;

let game = {
	paused: false,
	spawnrate: 1000,
	score: 0,
	deaths: 0,

	over: function() {
		this.deaths += 1;
		this.score = 0;
		this.paused = true;
		player.health = player.maxHealth;
		bullets = [];
		enemies = [];
	},

	drawText: function() {
		c.fillStyle = 'white';
		c.font = '50px consolas';
		c.fillText(this.score, 10, 50);
		c.fillText(this.deaths, cw - 40, 50);
	}
}

let mouse = {
	x: 0,
	y: 0
}

let player = {
	x: cw/2,
	y: ch/2,
	radius: 20,
	barrelWidth: 10,
	barrelLength: 10,
	rotation: 0,
	color: 'pink',
	damage: 25,
	maxHealth: 100,
	health: 100,

	draw: function() {
		c.save();
		c.translate(this.x, this.y);
		c.rotate(this.rotation);
		c.strokeStyle = this.color;
		c.beginPath();
		c.rect(20, -this.barrelWidth/2, this.barrelLength, this.barrelWidth);
		c.stroke();
		c.closePath();
		c.beginPath();
		c.arc(0, 0, this.radius, Math.PI * 2, 0);
		c.stroke();
		c.closePath();
		c.restore();
	},

	update: function() {
		for (let i = 0; i < enemies.length; i++) {
			if (getCollision(this, enemies[i])) {
				enemies.splice(enemies.indexOf(enemies[i]), 1)
				this.health -= 10;
				if (this.health <= 0) {
					game.over();
				}
			}
		}
		displayHealth(this.x, this.y, this.maxHealth, this.health, this.radius);
		this.draw();
	},

	shoot: function() {
		let angle = this.rotation;
		let dx = Math.cos(angle);
		let dy = Math.sin(angle);
		bullets.unshift(new Bullet(this.x + dx * this.radius, this.y + dy * this.radius, dx, dy));
	},
};

let bullets = []
function Bullet(x, y, dx, dy) {
	let death = setTimeout(() => bullets.splice(bullets.indexOf(this)), 10000);
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.speed = 10;
	this.radius = 4;
	this.color = 'white';

	this.draw = function() {
		c.beginPath();
		c.fillStyle = this.color;
		c.arc(this.x + this.dx * this.radius, this.y + this.dy * this.radius, this.radius, Math.PI * 2, 0);
		c.fill();
		c.closePath();
	};

	this.update = function() {
		this.x += this.dx * this.speed;
		this.y += this.dy * this.speed;
		for (let i = 0; i < enemies.length; i++) {
			if (getCollision(this, enemies[i])) {
				enemies[i].hit();
				bullets.splice(bullets.indexOf(this), 1)
				clearTimeout(death);
			}
		}
		this.draw();
	};
}

let enemies = []
function Enemy(x, y, dx, dy) {
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.radius = 30;
	this.speed = 3;
	this.maxHealth = 100;
	this.health = 100;
	this.color = 'red'

	this.draw = function() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, Math.PI * 2, 0);
		c.strokeStyle = this.color;
		c.stroke();
		c.closePath();
	};

	this.update = function() {
		let angle = Math.atan2(player.y - this.y, player.x - this.x);
		this.dx = Math.cos(angle);
		this.dy = Math.sin(angle);
		this.x += this.dx * this.speed;
		this.y += this.dy * this.speed;
		this.draw();
		displayHealth(this.x, this.y, this.maxHealth, this.health, this.radius);
	};

	this.hit = function() {
		this.health -= player.damage;
		if (this.health <= 0) {
			enemies.splice(enemies.indexOf(this), 1)
			game.score += 1;
		}
	}
}

function displayHealth(x, y, maxHealth, curHealth, radius) {
	c.beginPath();
	c.rect(x-15, y+radius+15, 30, 5);
	c.fillStyle = 'red';
	c.fill();
	c.closePath();
	c.beginPath();
	c.rect(x-15, y+radius+15, curHealth/maxHealth * 30, 5);
	c.fillStyle = 'lightgreen';
	c.fill();
	c.closePath();
}

function getCollision(one, two) {
	let a = one.x - two.x;
	let b = one.y - two.y;
	let distance = Math.sqrt(a*a + b*b);
	if (distance < one.radius + two.radius) {
		return true;
	}
	else {
		return false;
	}
}

function spawn() {
	let k = 0;
	let x = Math.random() * cw;
	let y = Math.random() * ch;
	let angle = Math.atan2(player.y - y, player.x - x);
	let dx = Math.cos(angle);
	let dy = Math.sin(angle);

	enemies.push(new Enemy(x, y, dx, dy));
}

function start() {
	let l = setInterval('spawn()', 1000);
	requestAnimationFrame(update);
};

function update() {
	if (game.paused == false) {
	c.clearRect(0, 0, cw, ch);
	player.update();
	game.drawText();
	for (i of bullets) {
		i.update();
	}
	for (i of enemies) {
		i.update();
	}
	}
	requestAnimationFrame(update);
};


addEventListener('mousemove', function(event) {
	mouse.x = event.x;
	mouse.y = event.y;
	player.rotation = Math.atan2(mouse.y - player.y, mouse.x - player.x);
});

addEventListener('mousedown', function() {
	player.shoot();
})
start();