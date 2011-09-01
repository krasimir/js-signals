/*global signals:false, SignalBinding:false, inheritPrototype:false*/

    // AsyncSignal

    (function(){

        var _signalProto = signals.Signal.prototype;


        function AsyncSignal(){
            signals.Signal.call(this);
            this._prevParams = null;
        }
        AsyncSignal.prototype = new signals.Signal();

        function getProxiedAdd(fnName){
            //to avoid code duplication generate function dynamically
            //since `add` and `addOnce` are so similar
            return function(listener, scope, priority){
                 var binding = _signalProto[fnName].call(this, listener, scope, priority);
                 if(this._prevParams){
                    binding.execute(this._prevParams);
                 }
                 return binding;
            };
        }

        AsyncSignal.prototype.add = getProxiedAdd('add');

        AsyncSignal.prototype.addOnce = getProxiedAdd('addOnce');

        AsyncSignal.prototype.dispatch = function(params){
            this._prevParams = Array.prototype.slice.call(arguments);
            _signalProto.dispatch.apply(this, this._prevParams);
        };

        AsyncSignal.prototype.toString = function(){
            return '[AsyncSignal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        };


        /**
         * The AsyncSignal is a special kind of Signal which will save
         * a reference to previously dispatched messages and will execute
         * binding during add/addOnce if Signal was previously dispatched.
         * It will pass the latest dispatched value to the listener.
         * @constructor
         * @extends signals.Signal
         */
        signals.AsyncSignal = AsyncSignal;

    }());
