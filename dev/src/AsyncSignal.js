/*global signals:false, SignalBinding:false, inheritPrototype:false*/

    // AsyncSignal

    (function(){

        //create a local reference to be used as super (since we need to call
        //methods on signals.Signal.prototype)
        var _super = signals.Signal.prototype;

        function AsyncSignal(){
            signals.Signal.call(this);
            this._prevParams = null;
        }
        //create a new instance to avoid overwritting Signal prototype
        AsyncSignal.prototype = new signals.Signal();

        function executeBinding(binding, params){
            if(! params){
                return;
            }
            binding.execute(params);
        }

        AsyncSignal.prototype.add = function(listener, scope, priority){
            var b = _super.add.call(this, listener, scope, priority);
            executeBinding(b, this._prevParams);
            return b;
        };

        AsyncSignal.prototype.addOnce = function(listener, scope, priority){
            var b = _super.addOnce.call(this, listener, scope, priority);
            executeBinding(b, this._prevParams);
            return b;
        };

        AsyncSignal.prototype.dispatch = function(params){
            this._prevParams = Array.prototype.slice.call(arguments);
            _super.dispatch.apply(this, this._prevParams);
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
