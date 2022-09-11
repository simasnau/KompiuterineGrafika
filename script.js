var dx = 2;
var WIDTH;
var HEIGHT;
var ctx;
var canvas;
var atstumasTarpRatu = 20;
var ratoR1 = 30;
var ratoR2 = 15;
var distance = 0;
var ratoPozicijaX = 150;
var zemesAukstisY = 150;
var stipinuKiekis1 = 6;
var stipinuKiekis2 = 4;

function init() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	return setInterval(draw, 40);
}

function circle(x, y, r, full = false) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2, true);
	ctx.closePath();

	if (full) {
		ctx.fill();
	} else {
		ctx.stroke();
	}
}

function rect(x, y, w, h) {
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.closePath();
	ctx.fill();
}

function line(x0, y0, x1, y1) {
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();
}

function clear() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}


function ratas(xc, yc, r, stipinuKiekis) {
	var apsisukimaiRadianais = distance / r;

	circle(xc, yc, r);

	var atstumasTarpStipinu = (2 * Math.PI) / (stipinuKiekis * 2);

	for (let i = 1; i <= stipinuKiekis; i++) {
		var xKoord = Math.cos(apsisukimaiRadianais + atstumasTarpStipinu * i) * r;
		var yKoord = Math.sin(apsisukimaiRadianais + atstumasTarpStipinu * i) * r;
		line(xc - xKoord, yc - yKoord, xc + xKoord, yc + yKoord);
	}
}

function draw() {
	clear();
	ratas(ratoPozicijaX, zemesAukstisY - ratoR1, ratoR1, stipinuKiekis1);

	var atstumasTarpRatuCentru = ratoR1 + ratoR2 + atstumasTarpRatu;

	ratas(ratoPozicijaX + atstumasTarpRatuCentru, zemesAukstisY - ratoR2, ratoR2, stipinuKiekis2);
	line(0, zemesAukstisY, WIDTH, zemesAukstisY); // zeme

	var ratoVirsus1 = zemesAukstisY - ratoR1 * 2;
	var ratoVirsus2 = zemesAukstisY - ratoR2 * 2;

	var remoAukstis = zemesAukstisY - ratoR1 - 50;

	line(ratoPozicijaX, ratoVirsus1, ratoPozicijaX, remoAukstis);
	line(ratoPozicijaX, remoAukstis, ratoPozicijaX + atstumasTarpRatuCentru, remoAukstis);
	line(ratoPozicijaX + atstumasTarpRatuCentru, remoAukstis, ratoPozicijaX + atstumasTarpRatuCentru, ratoVirsus2);

	distance += dx;
	ratoPozicijaX += dx;
}

init();
