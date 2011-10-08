/*global signals:false, SignalBinding:false, inheritPrototype:false*/

    // AsyncSignal ---------------------------------------------------
    //================================================================

    (function(){

        var _signalProto = signals.Signal.prototype,
            _asyncProto = new signals.Signal();

        //delete _bindings since it isn't used and would "break" dispose
        delete _asyncProto._bindings;

        /**
         * The AsyncSignal is a special kind of Signal which will save
         * a reference to previously dispatched messages and will execute
         * binding during add/addOnce if Signal was previously dispatched.
         * @name signals.AsyncSignal
         * @constructor
         * @extends signals.Signal
         */
        function AsyncSignal(){
            signals.Signal.call(this);
            this._prevParams = null;
        }

        AsyncSignal.prototype = _asyncProto;

        function getProxiedAdd(fnName){
            //to avoid code duplication generate function dynamically
            //since `add` and `addOnce` are so similar
            return function(){
                var binding = _signalProto[fnName].apply(this, arguments);
                //_prevParams becomes an Array after first dispatch
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

        /**
         * Reset AsyncSignal to state before first dispatch, so it won't be
         * automatically dispatched on the next add/addOnce.
         * @name signals.AsyncSignal.prototype.reset
         */
        _asyncProto.reset = function(){
            this._prevParams = null;
        };

        _asyncProto.dispose = function(){
            _signalProto.dispose.call(this);
            delete this._prevParams;
        };

        _asyncProto.toString = function(){
            return '[AsyncSignal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        };

        signals.AsyncSignal = AsyncSignal;

    }());
