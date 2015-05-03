if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([ 'rsignals' ], function(rsignals) {
	var Signal = rsignals.Signal;
	
	function Widget() {
		throw new Error('A Widget is an abstract entity and may not be constructed. Please inherit from its prototype.');
	}
	
	function WidgetFactory(elementFactory) {
		var definedSignals = [];
		
		function actualFactory() {
			var factoryArguments = Array.prototype.slice.call(arguments);
			
			// Guard clause: detect constructor calls without "new".
			if (!(this instanceof actualFactory)) {
				// The caller has omitted the "new" operator. We have to call the constructor properly using "new", passing it the same arguments that we got.
				// To this end, we must construct a bound factory function by calling actualFactory.bind(undefined, arg1, arg2, ...).
				// Since the number of arguments required for bind() is variadic, it is necessary to apply() the bind().
				var bindArguments = [ undefined ].concat(factoryArguments);
				var boundFactory = actualFactory.bind.apply(actualFactory, bindArguments);
				return new boundFactory();
			}
			
			// First, for each signal that has been defined, instantiate the said signal as a callable property of the constructed widget:
			definedSignals.forEach(function instantiateSignal(signalName) {
				this[signalName] = Signal(signalName);
			}, this);
			
			// Now, obtain a DOM element which is to represent this widget:
			var element = elementFactory.apply(this, factoryArguments);
			
			// Expose the element as a public property:
			Object.defineProperty(this, 'element', {
				configurable: false,
				enumerable: true,
				get: function() {
					return element;
				},
				set: function() {
					throw new Error('A widget\'s element may not be overwritten.');
				}
			});
		}
		
		actualFactory.emits = function emits(signalName) {
			if (definedSignals.indexOf(signalName) < 0) {
				definedSignals.push(signalName);
			}
		};
		
		actualFactory.inherits = function inherits(otherWidgetFactory) {
			otherWidgetFactory.signals.forEach(function copySignal(signalName) {
				this.emits(signalName);
			}, this);
		};
		
		Object.defineProperty(actualFactory, 'signals', {
			configurable: false,
			enumerable: false,
			get: function() {
				// Return a flat copy of signal names, so that they may not be tampered with.
				return definedSignals.slice();
			},
			set: function(value) {
				throw new Error('The defined signals can not be modified from the outside.');
			}
		});
		
		return actualFactory;
	}
	
	return WidgetFactory;
});
