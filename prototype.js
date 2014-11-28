function Signal(name){
	
	var connectedSlots = [];
	
	var signalFunction = function emit(data){
		connectedSlots.forEach(function callConnectedFunction(slot){
			slot(data);
		});
	};
	signalFunction.signalName = name;
	signalFunction.connect = function connect(slot){
		connectedSlots.push(slot);
	};
	
	return signalFunction;
}

function SignalProvider(){}
SignalProvider.prototype.emit = function emit(signalName, data){
	if(!this._signals || !this._signals[signalName]){
		throw new UnknownSignalError(signalName);
	}
	this._signals[signalName](data);
};
SignalProvider.prototype.signal = function signal(signalName){
	if(!this._signals){
		this._signals = {};
	}
	if(!this._signals[signalName]){
		this._signals[signalName] = new Signal(signalName);
	}
	return this._signals[signalName];
};


function Slot(name, handler){
	return handler;
}

function prepareSlotConfig(){
	if(!this.slots){
		this._slots = {};
	}
}

function SlotProvider(){}
SlotProvider.prototype.expose = function expose(slotName, handler){
	if(!this._slots){
		this._slots = {};
	}
	this._slots[slotName] = new Slot(slotName, handler);
};
SlotProvider.prototype.slot = function slot(slotName){
	if(!this._slots || !this._slots[slotName]){
		throw new UnknownSlotError(slot);
	}
	return this._slots[slotName].bind(this);
};


//TODO: Refactor the error types used by the message system.
function UnknownSignalError(signalName){
	Error.captureStackTrace(this, UnknownSignalError);
};
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

Widget.connect = function connect(signal, slot){
	return signal.connect(slot);
};

function MutableElement(element, mutationFunction){
	this.element = element;
	this.update = function update(){
		mutationFunction.call(element);
	};
}