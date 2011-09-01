/*global signals:false, SignalBinding:false, inheritPrototype:false*/

    // AsyncSignal ---------------------------------------------------
    //================================================================

    (function(){

        var _signalProto = signals.Signal.prototype,
            _asyncProto = new signals.Signal();

        //delete _bindings since it isn't used and would "break" dispose
        delete _asyncProto._bindings;

        function AsyncSignal(){
            signals.Signal.call(this);
            this._prevParams = null;
        }
        AsyncSignal.prototype = _asyncProto;

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

        _asyncProto.add = getProxiedAdd('add');

        _asyncProto.addOnce = getProxiedAdd('addOnce');

        _asyncProto.dispatch = function(params){
            this._prevParams = Array.prototype.slice.call(arguments);
            _signalProto.dispatch.apply(this, this._prevParams);
        };

        _asyncProto.dispose = function(){
            _signalProto.dispose.call(this);
            delete this._prevParams;
        };

        _asyncProto.toString = function(){
            return '[AsyncSignal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        };

        /**
         * The AsyncSignal is a special kind of Signal which will save
         * a reference to previously dispatched messages and will execute
         * binding during add/addOnce if Signal was previously dispatched.
         * The API is exactly the same of a regular Signal.
         * @constructor
         * @extends signals.Signal
         */
        signals.AsyncSignal = AsyncSignal;

    }());
