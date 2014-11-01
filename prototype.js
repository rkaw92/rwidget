function Signal(name, outputStructure){
	this._name = name;
	this._outputStructure = outputStructure;
	this._connections = [];
}
Signal.prototype.connect = function connect(slot){
	this._connections.push(slot);
};
Signal.prototype.emit = function emit(data){
	// TODO: Check the output structure against our specification.
	this._connections.forEach(function(slot){
		slot.run(data);
	});
};

function prepareSignalConfig(){
	if(!this._signals){
		this._signals = {};
	}
}

function SignalProvider(){}
SignalProvider.prototype.emits = function emits(signalName, outputStructure){
	prepareSignalConfig.call(this);
	//TODO: Actually place the output structure info in _signals.
	this._signals[signalName] = new Signal(signalName, outputStructure);
};
SignalProvider.prototype.emit = function emit(signalName, data){
	if(!this._signals || !this._signals[signalName]){
		throw new UnknownSignalError(emit);
	}
	this._signals[signalName].emit(data);
};
SignalProvider.prototype.signal = function signal(signalName){
	if(!this._signals || !this._signals[signalName]){
		throw new UnknownSignalError(signal);
	}
	return this._signals[signalName];
};


function Slot(name, inputStructure, owner){
	this._name = name;
	this._inputStructure = inputStructure;
	this._provider = null;
	this._owner = owner;
}
Slot.prototype.run = function run(inputData){
	//TODO: Verify the input data against the structure.
	this._provider.call(this._owner, inputData);
};
Slot.prototype.setProvider = function setProvider(providerFunction){
	this._provider = providerFunction;
}

function prepareSlotConfig(){
	if(!this.slots){
		this._slots = {};
	}
}

function SlotProvider(){}
SlotProvider.prototype.provides = function provides(slotName, inputStructure){
	prepareSlotConfig.call(this);
	//TODO: Actually place the output structure info in _slots.
	this._slots[slotName] = new Slot(inputStructure, inputStructure, this);
};
SlotProvider.prototype.provide = function provide(slotName, providerFunction){
	if(!this._slots || !this._slots[slotName]){
		throw new UnknownSlotError(provide);
	}
	this._slots[slotName].setProvider(providerFunction);
};
SlotProvider.prototype.slot = function slot(slotName){
	if(!this._slots || !this._slots[slotName]){
		throw new UnknownSlotError(slot);
	}
	return this._slots[slotName];
};

var UnknownSignalError = Error;
var UnknownSlotError = Error;

function mixin(source, destination){
	Object.keys(source).forEach(function(memberName){
		// If the member has already been copied to the destination and the source member is non-empty, generate an error.
		if(typeof(destination[memberName]) !== 'undefined' && typeof(source[memberName]) !== 'undefined'){
			throw new Error('mixin: member ' + memberName + ' already exists in the destination; cannot copy from source');
		}
		destination[memberName] = source[memberName];
	});
}

function Widget(){
	
}

mixin(SignalProvider.prototype, Widget.prototype);
mixin(SlotProvider.prototype, Widget.prototype);