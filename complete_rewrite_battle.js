/* Canvas variables */
var canvas, ctx, cw, ch ;

/* Game Elements */
var tank, enemy, tanks= [], murs, mur1, briques = [], tirs = [];
var inputStates = {};

/* Sons */
var laserSon, explosionSon, briqueCasseSon;

function Tank(_x,_y,_n){
	this.width = Tank.width;
	this.x = _x;
	this.y = _y;
	this.speed = 3;
	this.direction = 'N';
	this.tir = new Tir(this.x+Tank.width/2 - 5,this.y-Tir.width);
	this.detruit = false;
	this.hp = Number.POSITIVE_INFINITY;
	this.enemy = true;
	this.nom = _n;
}


Tank.prototype.dessine = function() {
	var width = this.width;
	ctx.save();
	if(this.direction) {
		ctx.translate(this.x + this.width/2,this.y + this.width/2);
		if(this.direction == 'E') ctx.rotate(Math.PI/2);
		if(this.direction == 'S') ctx.rotate(Math.PI);
		if(this.direction == 'W') ctx.rotate(-Math.PI/2);
		ctx.translate(-this.x - this.width/2,-this.y - this.width/2);
	} 
	ctx.translate(this.x,this.y);
	if(this.enemy) ctx.fillStyle = "violet";
	else ctx.fillStyle="green";
	ctx.fillRect(0,width/3,width/3,2*width/3);
	ctx.fillRect(width/3,0,width/3,2*width/3);
	ctx.fillRect(2*width/3,width/3,width/3,2*width/3);
	//ctx.fillRect(0,0,this.width,this.width);
	ctx.restore();
};

Tank.prototype.move = function() {		
	if(!this.enemy) {	
		if(inputStates.space && !this.tir.states.direction) { this.shoot(); }
		else if(inputStates.left) this.moveWest(); 
		else if(inputStates.right) this.moveEast();  
		else if (inputStates.up) this.moveNorth(); 
		else if (inputStates.down)this.moveSouth();
	} else {
		if(inputStates.j && !this.tir.states.direction) { console.log("enemy is going to shoot"); this.shoot(); }
		else if(inputStates.w) this.moveNorth();
		else if(inputStates.s) this.moveSouth();
		else if(inputStates.a) this.moveWest();
		else if (inputStates.d) this.moveEast();
	}
	//tir.move()
};

Tank.prototype.canMove = function(d) {
	//return in
};

Tank.prototype.collidesWith = function(obj) {
	/** http://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other */
	return this.x <= (obj.x + obj.width) && (this.x+this.width) >= obj.x && this.y <= (obj.y + (obj.height || obj.width)) && (this.y+this.width) >= obj.y;
};

Tank.prototype.collidesWithBriquesOrTanks = function() {
	var solidesIncludingThis = briques.concat(tanks);
	var monNom = this.nom;
	//console.log(nom);
	var solides = solidesIncludingThis.filter(function(elt) { /*console.log(elt.nom + " " +monNom);*/ var res =  !elt.nom || elt.nom != monNom; return res;/* console.log(res);*/});
	if(solidesIncludingThis.length == solides.length) { console.log("filter did not work oo filter did not workd");}
	else {/*console.log("filter workd : " + solides.length + "/" + solidesIncludingThis.length);*/ }
	for(var i = 0; i < solides.length; i++) {
		if(this.collidesWith(solides[i])) { console.log("collidesWith " + solides[i]); return true;}
	}
	return false;
};

Tank.prototype.sortDuCanvas = function() {
	return this.x < 0 || (this.x + this.width) > cw || this.y < 0 || (this.y + this.width) > ch;
};

Tank.prototype.moveNorth = function() {
	this.direction = 'N';
	this.y -= this.speed;
	if(this.sortDuCanvas()) {
		this.y += this.speed;
		return;
	}
	if(this.collidesWithBriquesOrTanks()) this.y+=this.speed;
};

Tank.prototype.moveSouth = function() {
	this.direction = 'S';
	this.y += this.speed;
	if(this.sortDuCanvas()) {
		this.y -= this.speed;
		return;
	}
	if(this.collidesWithBriquesOrTanks()) this.y-=this.speed;
};

Tank.prototype.moveEast = function() {
	this.direction = 'E';
	this.x += this.speed;
	if(this.sortDuCanvas()) {
		this.x -= this.speed;
		return;
	}
	if(this.collidesWithBriquesOrTanks()) this.x -= this.speed;
};

Tank.prototype.moveWest = function() {
	this.direction = 'W';
	this.x -= this.speed;
	if(this.sortDuCanvas()) {
		this.x += this.speed;
		return;
	}
	if(this.collidesWithBriquesOrTanks()) this.x += this.speed;
};
	
Tank.prototype.shoot = function() {
	console.log("shot");
	laserSon.play();
	var x = this.x, y = this.y, width = this.width, tir = this.tir;
	//console.log("tir new y : " + tir.y);
	switch(this.direction) {
		case 'N' : tir.y = y - Tir.width; tir.x = x+width/2-5; break;
		case 'S' : tir.y = y+width ; tir.x = x+width/2-5; break;
		case 'E' : tir.y = y+width/2 - 5; tir.x = x+width; break;
		case 'W' : tir.y = y+width/2 - 5; tir.x = x-Tir.width; break;
	}
	this.tir.states.direction = this.direction;
	tirs.push(tir);
};

Tank.prototype.getHit = function() {
	this.detruit = true;
	explosionSon.play();
	console.log("tank " + this.nom + " a ete detruit  en lui meme");
};


Tank.prototype.toString = function() {
	return "[x: "+this.x +", y: "+this.y+", width: "+this.width+"]";
};

Tank.width = 45;
Tank.invulnerability_cycles = 10;
Tank.lives = 3;





	

function mainLoop(time) {
	clearCanvas();
	for(var i = 0; i < briques.length; i++) {
		if(briques[i] && !briques[i].detruit) {
			briques[i].dessine();
		}
	}
	
	

	for(var k = 0; k < tanks.length; k++) {
		var t = tanks[k];
		t.move();
		t.dessine();
	}
		


	var tankIndicesToBeRemoved = [];

	var tirIndicesToBeRemoved = [];
	for(var kt = 0; kt < tirs.length; kt++) {
		var t = tirs[kt];
		t.dessine();
		t.move();
		if(t.states.direction) {

			/* verifier collisions tir - briques */
			var briqueIndicesToBeDeleted = [];
			for(var i =0; i < briques.length;i++) {

				if(!briques[i].detruit && t.collidesWith(briques[i])) {
					//console.log("tir : i collidesWith something that is " + briques[i] )
					t.hit(briques[i]);
					if(briques[i].detruit) {
						briqueIndicesToBeDeleted.unshift(i);
						console.log("for broken by tir : " + t.states.direction);
						break;
					}
				}
			}
			
			/* supprimer briques */
			for(var bd = briqueIndicesToBeDeleted.length -1; bd >= 0; bd--) {
				briques.splice(briqueIndicesToBeDeleted[bd],1);
			}

			/* Verifier collisions tir - tir */
			for(var ktt = 0;  ktt < tirs.length; ktt++) {
				if(kt != ktt && t.collidesWith(tirs[ktt])) {
					t.hit(tirs[ktt]);
				}
			}

			/* verifier collisions tir - tanks */ 
			for(var kp = 0; kp < tanks.length; kp++ ) {
				//else console.log("checking for" + tanks[kp].nom);
				//if(!tanks[kp].detruit && t.tir.collidesWith(tanks[kp])) {
				if(t.collidesWith(tanks[kp])) {
					t.hit(tanks[kp]);
					console.log(tanks[kp].detruit);
					console.log("yyyyyyyyyyyyyyyyyyy   " + tanks[kp] + " destroyed yyyyyyyyyyyyyyyyyyy at " + tanks[kp].x+ " " + tanks[kp].y);
					tankIndicesToBeRemoved.unshift(kp);
					//console.log("tank " + kp + " marked to be removed");
					//tirIndicesToBeRemoved.unshift()
					//break;
				}
			}

			for(var kd = tankIndicesToBeRemoved.length - 1; kd >= 0; kd--) {
				tanks.splice(tankIndicesToBeRemoved[kd],1);
			}

			if(t.sortDuCanvas() || !t.states.direction) {
				t.states.direction = false;
				tirIndicesToBeRemoved.unshift(kt);
			}


		} else {
			tirIndicesToBeRemoved.unshift(kt);
		}

	}
	for(var ktd = tirIndicesToBeRemoved.length - 1; ktd >= 0; ktd--) {
		tirs.splice(tirIndicesToBeRemoved[ktd],1);
	}
	requestAnimationFrame(mainLoop);
};


	
function Tir(_x,_y) {
	//Tank.call(this,_x,_y,"n");
	//var pos = {x:x, y:y}
	this.width = 10;
	this.speed = 4;
	this.states = {};
	//console.log("tir created with x: " + this.x + ",y : " + this.y);
}

/*Tir.prototype = Object.create(Tank.prototype);
Tir.prototype.constructor = Tir;*/

Tir.prototype.dessine = function() {
	if(!this.states.direction) return;

	ctx.save();
	ctx.translate(this.x,this.y);
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,this.width,this.width);
	ctx.restore();
};

Tir.prototype.move = function() {
	if(this.states.direction) {
		switch(this.states.direction) {
			case 'N' : /*console.log("tir : moved north from " + y + " with speed " + speed );*/ this.y -= this.speed; /*console.log(this.y);*/break;
			case 'S' : this.y += this.speed; break;
			case 'W' : this.x -= this.speed; break;
			case 'E' : this.x += this.speed; break;
		}
		if(this.y < 0 || this.y > ch || this.x < 0 || this.x > cw) { /*x=originX; y=originY;*/this.states.direction = false; console.log("put to false"); }
	} else {
	}
};


Tir.prototype.collidesWith = function(obj) {
	/** http://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other */
	return this.x <= (obj.x + obj.width) && (this.x+this.width) >= obj.x && this.y <= (obj.y + (obj.height || obj.width)) && (this.y+this.width) >= obj.y;
};

Tir.prototype.sortDuCanvas = function() {
	return this.x < 0 || (this.x + this.width) > cw || this.y < 0 || (this.y + this.width) > ch;
};


Tir.prototype.hit = function(obj) {
	obj.getHit();
	this.getHit();
	console.log("yippee i hit something");
};

Tir.prototype.getHit = function() {
	this.states.direction = false;
};


Tir.prototype.toString = function() {
	return "x: " + this.x + ", y: "+this.y+", direction: " + this.states.direction;
}; 

Tir.width = 10;

function Brique (x,y, milieu) {
	this.x = x;
	this.y = y;
	this.width = 50;
	this.height = 20;
	this.milieu = milieu;
	this.detruit = false;
}

Brique.prototype.dessine = function() {
	if(this.detruit) return;
	ctx.save();
	ctx.translate(this.x,this.y);
	ctx.fillStyle="red";
	ctx.fillRect(0,0,this.width,this.height);
	ctx.strokeStyle="black";
	ctx.strokeRect(0,0,this.width,this.height);
	ctx.restore();
};

Brique.prototype.getHit = function() {
	//console.log("oo la la i got hit");
	ctx.clearRect(this.x,this.y,this.width,this.height);
	this.detruit = true;
	briqueCasseSon.play();
};

Brique.width = 50;
Brique.height = 20;

function Pierre(x,y,milieu) {
	Brique.call(this,x,y,milieu);
	this.detruit = false;
}

Pierre.prototype = Object.create(Brique.prototype);
Pierre.prototype.constructor = Pierre;

Pierre.prototype.dessine = function() {
	ctx.save();
	ctx.strokeStyle = "black";
	ctx.strokeRect(this.x, this.y, this.width,this.height);
	ctx.fillStyle = "#444444";
	ctx.fillRect(this.x, this.y, this.width,this.height);
	ctx.restore();
};

Pierre.prototype.getHit = function(){};

function Mur(x,y,lig,col) {
	this.x = x;
	this.y = y;
	this.lignes = lig;
	this.colonnes = col;
	//var briques = [];
	for(var i = 0;  i < this.lignes; i++) {
		var milieu = i%2 ;
		this.colonnes = (milieu)? (col + 1): col;
		for(j=0; j < this.colonnes; j++) {
			var b;
			if(!milieu) {
				b = new Brique(this.x + j*Brique.width, this.y + i*Brique.height, milieu);
				//if(Math.round(Math.random()*10)%2 == 0) b = new Pierre(this.x + j*Brique.width, this.y + i*Brique.height, milieu);
			} else {
				b = new Brique(this.x + (j-1) *Brique.width + Brique.width/2, this.y + i*Brique.height, milieu);
				if(j == 0) {
					b = new Brique(this.x, this.y + i*Brique.height, milieu); 
					b.width = Brique.width/2;
				} else if(j == this.colonnes - 1) {
					b.width = Brique.width/2;
				}
			}

			//else console.log(b);
			briques.push(b);
		}
	}
}

function MurPierre(x,y,lig, col) {
	this.x = x;
	this.y = y;
	this.lignes = lig;
	this.colonnes = col;

	for(var j = 0; j < this.lignes; j++) {
		for(var i = 0; i < this.colonnes; i++) {
			var p = new Pierre(this.x + j*Brique.width, this.y + i*Brique.height, false);
			briques.push(p);
		}
	}
}

/*Mur.prototype.dessine = function() {
	for(var i = 0; i < briques.length; i++ ) {
		briques[i].dessine();
	}
};*/

function Niveau() {

}

function clearCanvas() {
	ctx.clearRect(0,0,cw,ch);
}

function start() {
	console.log("started");
	// init canvas
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	cw = canvas.width;
	ch = canvas.height;
	tank = new Tank(cw/2, ch-42-3, "Sharpie");
	tank.enemy = false;
	//tank.setNom("FuFu");
	enemy = new Tank(cw/2, 0,"Alcatel");
	//enemy.setNom("Alcatel");
	console.log(tank);
	tanks = [tank,enemy];
	console.log(tank.nom);
	console.log(enemy.nom);
	//return;
	
	mur1 = new Mur(100,100,5,3);
	var mur2 = new Mur(300,200,3,1);
	var mur3 = new Mur(400 , 50 , 4 , 5);
	var mur4 = new Mur(0 , 200 , 3 , 1 );
	var mur5 = new Mur(0, 400 , 3 , 3);
	var mur6 = new Mur(300 , 400 , 3 ,2 );
	var mur7 = new Mur(280 , 280 , 2 ,2 );
	murs = [mur1,mur2];

	/* Initialisaiton Sons */
	laserSon = new Audio("sons/laser.wav");
	explosionSon = new Audio("sons/explosion.wav");
	briqueCasseSon = new Audio("sons/briqueCasse.wav");

	window.addEventListener('keydown', function(event) {
		switch(event.keyCode) {
			case 37 : inputStates.left = true; break;
			case 38 : inputStates.up = true; break;
			case 39 : inputStates.right = true; break;
			case 40 : inputStates.down = true; break;
			case 32 : inputStates.space = true; break;
			case 65 : inputStates.a = true; break;
			case 68 : inputStates.d = true; break;
			case 87 : inputStates.w = true; break;
			case 83 : inputStates.s = true; break;
			case 74 : inputStates.j = true; console.log("j put to true"); break;
		}
	}, false);

	window.addEventListener('keyup', function(event) {
		switch(event.keyCode) {
			case 37 : inputStates.left = false; break;
			case 38 : inputStates.up = false; /*console.log("up pressed");*/ break;
			case 39 : inputStates.right = false; break;
			case 40 : inputStates.down = false; break;
			case 32 : inputStates.space = false; break;
			case 65 : inputStates.a = false; break;
			case 68 : inputStates.d = false; break;
			case 74 : inputStates.j = false; break;
			case 83 : inputStates.s = false; break;
			case 87 : inputStates.w = false; break;
		}
	}, false);
	
	// boucler l'animation
	requestAnimationFrame(mainLoop);
};




window.onload = function init() {
	start();
}