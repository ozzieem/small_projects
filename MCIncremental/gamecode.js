var automators = 0;
var quarries = 0;
var recyclers = 0;
var fabricators = 0;

var items = 0;
var scraps = 0;
var UUmatter = 0;
var gameTick = 10;

//var machines = { Automators: 0, Quarries: 0, Recyclers: 0, Fabricators: 0 };

function Machine(name, startCost, costIncFactor) {
	this.name = name;
	this.startCost = startCost;
	this.costIncFactor = costIncFactor;
	
	this.cost = function(machines) { return Math.floor(this.startCost * Math.pow(this.costIncFactor, machines)); };
	
	this.buy = function(quantity, machines) {
		for (i = 0; i < quantity; i++) { 
			if(items >= this.cost(machines)) {
				items -= this.cost(machines);
				machines++;
			}
		}
		return machines;
	};
};

var automator = new Machine("Automator", 10, 1.1);
automator.update = function () { items += automators / gameTick; }

var quarry = new Machine("Quarry", 1000, 1.15);
quarry.update = function () { items += quarries / gameTick; }

var recycler = new Machine("Recycler", 10000, 1.2);
recycler.update = function() { 
	var itemsPerScrap = (10 * recyclers) / gameTick;
	if(items - itemsPerScrap > 0) {
		scraps += recyclers / gameTick;
		items -= itemsPerScrap / gameTick;
	}
}

var fabricator = new Machine("Fabricator", 100000, 1.5);
fabricator.progress = 0;
fabricator.update = function() {
	var scrapsToMatter = (2 * fabricators) / gameTick;
	if(scraps - scrapsToMatter > 0) {
		scraps -= scrapsToMatter;
		fabricator.progress += parseFloat(0.1 * fabricators);
	}
	if(fabricator.progress >= 100) {
		UUmatter++;
		fabricator.progress = 0;
	}
}


function add(numb) {
	items += parseInt(numb);
}

function buyAutomator(number) {
	automators = automator.buy(number, automators);
}

function buyQuarry(number) {
	quarries = quarry.buy(number, quarries);
}

function buyRecycler(number) {
	recyclers = recycler.buy(number, recyclers);
}

function buyFabricator(number) {
	fabricators = fabricator.buy(number, fabricators);
}

function getAvailableMachines(machine, machines) {
		var totalCost = 0;
		var availableMachines = 0;
		var local_items = items;
		
		while(local_items >= totalCost) {
			totalCost += machine.cost(machines);
			if(totalCost >= machine.cost(machines)) {
				machines++;
				availableMachines++;
			}
		}
		if(availableMachines < 0) { return 0; }
		else { return availableMachines - 1;}
}

function resetGame() {
	items = 0;
	scraps = 0;
	UUmatter = 0;

	automators = 0;
	quarries = 0;
	recyclers = 0;
	fabricators = 0;
}

function gameLoop() {
	automator.update();
	quarry.update();
	recycler.update();
	fabricator.update();
}

function updateScreenValues() {
	document.getElementById("items").innerHTML = Math.floor(items);
	document.getElementById("scraps").innerHTML = Math.floor(scraps);;
	document.getElementById("UUmatter").innerHTML = UUmatter;
	
	document.getElementById("automators").innerHTML = automators;
	document.getElementById("quarries").innerHTML = quarries;
	document.getElementById("recyclers").innerHTML = recyclers;
	document.getElementById("fabricators").innerHTML = fabricators;
	
	document.getElementById("automatorCost").innerHTML = automator.cost(automators);
	document.getElementById("quarryCost").innerHTML = quarry.cost(quarries);
	document.getElementById("recyclerCost").innerHTML = recycler.cost(recyclers);
	document.getElementById("fabricatorCost").innerHTML = fabricator.cost(fabricators);
	
	document.getElementById("availableAutomators").innerHTML = getAvailableMachines(automator, automators);
	document.getElementById("availableQuarries").innerHTML = getAvailableMachines(quarry, quarries);
	document.getElementById("availableRecyclers").innerHTML = getAvailableMachines(recycler, recyclers);
	document.getElementById("availableFabricators").innerHTML = getAvailableMachines(fabricator, fabricators);
	
	document.getElementById("fabricatorProgress").innerHTML = Math.floor(fabricator.progress);
}

window.setInterval(function() {
	gameLoop();
	updateScreenValues();
}, 100);