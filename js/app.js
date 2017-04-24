var qsa = q => document.querySelectorAll(q);
var qs = q => document.querySelector(q);


class Background {
	constructor(game){
		this.game = game;
		this.source = this.load('images/stadium.png');
		this.y = 0;
		this.x = 0;
	}

	load(path){
		let image = new Image();
		image.src = path;
		return image;
	}

	draw(){
		this.game.ctx.drawImage(this.source,this.x,this.y, this.game.width, this.game.height);
	}
}

class Hands {
	constructor(game){
		this.game = game;
		this.source = this.load('images/hands.png');
		this.y = this.game.canvas.height/2;
		this.x = this.game.canvas.width/2;
		this.rotate = 0;
		this.bindEvents();
	}

	load(path){
		let image = new Image();
		image.src = path;
		return image;
	}

	bindEvents(){
		document.addEventListener('mousemove', ev => {
			let w = this.game.canvas.width/2;
			let h = this.game.canvas.height/2;
			this.x = ev.clientX - this.source.width/2 - 30;
			this.y = ev.clientY - h;
		});
	}

	draw(){
		this.game.ctx.drawImage(this.source,this.x,this.y, this.source.width, this.source.height);
	} 
}

class Ball {
	constructor(game){
		this.game = game;
		this.size = 0;
		this.source = this.load('images/ball.png');
		this.y = this.game.canvas.height/2;
		this.x = this.game.canvas.width/2;
		this.direction = 1;
		this.energy = 0;
	}

	getRandomX(){
		return Math.floor(Math.random()*this.game.width);
	}

	getRandomY(){
		return Math.floor(Math.random()*this.game.height);
	}

	startFly() {
		this.x = this.getRandomX();
		this.y = this.getRandomY();
		this.size = 0;
		this.energy = 0;
	}

	movement(){
		if(this.energy < 100) {
			this.energy--;
			this.x++;
			this.y++;
		} else {
			if(this.energy == 100){
				this.direction*=-1;
				this.x++;
				this.y++;
			} else {
				this.x++;
				this.y--;
			}
		}
	}

	move(){
		// this.movement();
		if(this.size < 200){
			this.size+=0.5;
		} else {
			this.startFly()
		}
	}

	load(path){
		let image = new Image();
		image.src = path;
		return image;
	}
	draw(){
		this.game.ctx.drawImage(this.source,this.x,this.y, this.size, this.size);
	}
}

class Game {

	constructor(){
		this.canvas = qs("#game");
		this.ctx = this.canvas.getContext('2d');
		this.height = this.canvas.height;
		this.width = this.canvas.width;
		this.ball = new Ball(this);
		this.hands = new Hands(this);
		this.background = new Background(this);
		this.movement = false;
		this.saves = 0;
		this.draw();
	}

	draw(){
		setInterval(_=>{
			// Check draw
			this.ctx.clearRect(0,0,this.width, this.height);
			this.background.draw();
			if(this.movement) {
				this.ball.move();
			}
			this.ball.draw();
			this.hands.draw();
			this.collisions();	
		},60/1000);
	}

	collisions(){
		let handsX1 = this.hands.x;
		let handsX2 = this.hands.x+this.hands.source.width;

		let handsY1 = this.hands.y;
		let handsY2 = this.hands.y+this.hands.source.height;

		let ballX1 = this.ball.x;
		let ballX2 = this.ball.x+this.ball.size;

		let ballY1 = this.ball.y;
		let ballY2 = this.ball.y+this.ball.size;

		if(	//Check X
			handsX1 < ballX1 &&
			handsX1 < ballX2 &&
			handsX2 > ballX1 &&
			handsX2 > ballX2 &&
			//Check Y
			handsY1 < ballY1 &&
			handsY1 < ballY2 &&
			handsY2 > ballY1 &&
			handsY2 > ballY2 &&
			this.ball.size >= 120.5 &&
			this.ball.size < 121
		){
			// TODO: Счет +10
			this.saves++;
			this.ball.startFly();
			console.log(this.saves);
		}

		if(	//Check X
			handsX1 < ballX1 &&
			handsX1 < ballX2 &&
			handsX2 > ballX1 &&
			handsX2 > ballX2 &&
			//Check Y
			handsY1 < ballY1 &&
			handsY1 < ballY2 &&
			handsY2 > ballY1 &&
			handsY2 > ballY2 &&
			this.ball.size > 121
		){
			// TODO: Счет +5
			this.saves++;
			this.ball.startFly();
			console.log(this.saves);
		}
	}
}

let app = new Game();