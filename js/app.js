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
		this.game.ctx.save();
		this.game.ctx.translate(this.x, this.y);
		this.game.ctx.rotate(((this.x-this.game.canvas.width/2)/20)*(Math.PI/100));
		this.game.ctx.drawImage(this.source,-this.source.width/2,-this.source.height/2, this.source.width, this.source.height);
		this.game.ctx.restore();
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
		this.speed = 0.5;
		this.rotate = 0;
	}

	getRandomX(){
		return Math.floor(Math.random()*this.game.width-100);
	}

	showFirstScreen(){
		
	}

	getRandomY(){
		return Math.floor(Math.random()*this.game.height-100);
	}

	startFly() {
		this.x = this.getRandomX();
		this.y = this.getRandomY();
		this.size = 0;
		this.energy = 0;
	}

	checkGameLevel(){
		switch(this.game.level) {
			case "easy":
				this.speed = 0.5;
				break;
			case "meduim":
				this.speed = 1;
				break;

			case "hard":
				this.speed = 2;
				break;
		}
	}

	move(){
		this.checkGameLevel();
		// this.movement();
		if(this.size < 200){
			this.size+=this.speed;
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
		this.game.ctx.save();
		this.game.ctx.translate(this.x, this.y);
		this.game.ctx.rotate(this.size*(Math.PI/100));
		this.game.ctx.drawImage(this.source,-this.size/2,-this.size/2, this.size, this.size);
		this.game.ctx.restore();
	}
}

class Message {
	constructor(game){
		this.game = game;
		this.x = game.ball.x;
		this.y = game.ball.y;
		this.source = this.load('images/10.png');
		this.opacity = 0.5;
		// this.game.ctx.globalAlpha = 0.2;
	}

	load(path){
		let image = new Image();
		image.src = path;
		return image;
	}

	draw(){
		this.opacity-=0.1;
		this.game.ctx.globalAlpha = this.opacity;
		this.game.ctx.drawImage(this.source,this.x,this.y, this.source.width, this.source.height);
		this.game.ctx.globalAlpha = 1.0;
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
		this.message = new Message(this);
		this.movement = false;
		this.saves = 0;
		this.saveStatus = false;
		this.maxTime = 15;
		this.level = 'easy';
		this.player = "Test name";		
		this.storage = localStorage;
		if(this.storage.players == undefined) {
			this.storage.players = JSON.stringify([]);
		}
		this.players = JSON.parse(this.storage.players);
		this.draw();
		this.bindEvents();
		this.setBackgroundSound();
	}

	setBackgroundSound(){
		this.backgroundSound = new Audio();
		this.backgroundSound.src = "audio/background.mp3";

		this.backgroundSound.addEventListener('ended', ev=>{
			this.backgroundSound.currentTime = 0;
			this.backgroundSound.play();
		});
	}

	playBackground(){
		this.backgroundSound.currentTime = 3;
		this.backgroundSound.play();
	}

	stopBackground(){
		this.backgroundSound.pause();	
	}

	playChute(){
		let audio = new Audio();
		audio.src = "audio/chute.wav";
		audio.play();
	}
	playGoal(){
		let audio = new Audio();
		audio.src = "audio/goal.mp3";
		audio.play();
	}
	playFinal(){
		let audio = new Audio();
		audio.src = "audio/final.wav";
		audio.play();
	}	

	draw(){
		setInterval(_=>{
			// Check draw
			this.ctx.clearRect(0,0,this.width, this.height);
			this.background.draw();
			if(this.movement) {
				this.ball.move();
				this.ball.draw();

				// if(this.saveStatus) {
				// 	let message = new Message(this);
				// 	message.draw();
				// 	if(message.opacity < 0){
				// 		this.saveStatus = false;
				// 		message = {};
				// 	}
				// }
			}
			this.hands.draw();
			this.collisions();	
		},60/1000);
	}

	startTimer(){
		let time = qs(".time");
		this.timer = setInterval(_=>{
			if(this.maxTime > 0){
				this.maxTime--;
				time.innerHTML = `Time: 0:${this.maxTime}s`;	
			} else {
				statScreen.classList.toggle("hidden");
				this.stopMovements();
			}
		}, 1000);
	}

	sortUsers(a,b){
		return b.score-a.score;
	}

	savePlayersInStorage(){
		this.storage.players = JSON.stringify(this.players);
	}

	savePlayer(){
		let createNew = true;
		this.players.forEach(obj=>{
			if(obj.name == this.player){
				createNew = false;
				obj.score = this.saves,
				obj.level = this.level
			}
		});
		if(createNew){
			let user = {
				name: this.player,
				score: this.saves,
				level : this.level
			}
			this.players.push(user);
		}
		this.players.sort(this.sortUsers);
		this.savePlayersInStorage(this.players);
	}

	changePoints(){
		this.saveStatus = true;
		let score = qs('.score');
		score.innerHTML = `${this.saves}/200`;
	}

	showTableScore(){
		let res = qs(".results");
		res.innerHTML = "";
		for(let player of this.players){
			res.innerHTML += `<p>${player.name} - ${player.score}</p>`;
		}
	}

	bindEvents(){
		qs("#firstScreen .start img").addEventListener('click', ev=>{
			firstScreen.classList.toggle("hidden");
			secondScreen.classList.toggle("hidden");
		});

		qsa("#secondScreen .level").forEach(level=>{
			level.addEventListener('click', ev=>{
				if(qs("#secondScreen input").value != ""){
					this.player = qs("#secondScreen input").value;
					console.log(ev.target.dataset.level, this.player);
					this.level = ev.target.dataset.level;
					qs(".name").innerHTML = this.player;
					secondScreen.classList.toggle("hidden");
					this.startMovements();	
				} else {
					alert("Enter your name");
				}
			});	
		});

		restart.addEventListener('click', ev=>{
			statScreen.classList.toggle("hidden");
			firstScreen.classList.toggle("hidden");
			this.ball.size = 0;
			this.changePoints();
		});
	}

	startMovements(){
		this.playBackground();
		this.startTimer();
		this.movement = true;
	}

	saveAnimation5points(){

	}

	saveAnimation10points(){
		
	}

	stopMovements(){
		this.stopBackground();
		this.playFinal();
		this.savePlayer();
		this.showTableScore();
		clearInterval(this.timer);
		this.maxTime = 15;
		this.saves = 0;
		this.movement = false;
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

		let goal = true;

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
			goal = false;
			this.playChute();
			this.saves+=10;
			this.changePoints();
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
			goal = false;
			this.playChute();
			this.saves+=5;
			this.changePoints();
			this.ball.startFly();
			console.log(this.saves);
		}


		if(this.level == 'easy') {
			if(goal && this.ball.size > 121 && this.ball.size < 122){
				console.log(this.level);
				this.playGoal();	
			}
		}

		if(this.level == 'meduim') {
			if(goal && this.ball.size > 121 && this.ball.size < 123){
				console.log(this.level);
				this.playGoal();	
			}
		}

		if(this.level == 'hard') {
			if(goal && this.ball.size > 121 && this.ball.size < 125){
				console.log(this.level);
				this.playGoal();	
			}
		}

	}
}

let app = new Game();