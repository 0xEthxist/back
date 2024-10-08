import { WebSocket } from 'ws';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

var subscribe = '{"type": "subscribe","product_ids": ["ETH-USD"],"channels": [{"name": "ticker","product_ids": ["ETH-USD"]}]}';



export default class ethUsdt {
    public baseUrl = 'wss://ws-feed.exchange.coinbase.com';
    public ws;
    public _handlers = new Map();
    public method = 'getPrice';

    constructor() {
        this._createSocket()
    }

    _createSocket() {
        var _this = this;
        this.ws = new WebSocket(this.baseUrl);
        this.ws.on('open', function open() {
            Logger.log('ws open')
            _this.ws.send('something');

            _this.ws.send(subscribe);
        });

        this.ws.on('pong', () => {
            // Logger.log('receieved pong from server');
        });
        
        this.ws.on('ping', () => {
            Logger.log('==========receieved ping from server');
            this.ws.pong();
        });

        this.ws.onclose = () => {
            Logger.error('ws closed');
            _this.check()
        };

        this.ws.onerror = (err) => {
            Logger.error('ws error');
        };

        this.ws.on('message', function message(data) {

            if (data) {
                var dataObject = JSON.parse(data.toString());
                if (dataObject) {
                    _this._handlers.get(_this.method).forEach(cb => {
                        cb(dataObject);
                    });

                }
            }

        });

        this.heartBeat()
    }

    async check(){
        await this.sleep(20000)
        if(!this.ws || this.ws.readyState == 3) this._createSocket();
    }

    heartBeat() {
        setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.ping();
                // Logger.debug("ping server");
            }
        }, 5000);
    }


    setHandler(method, callback) {
        this.method = method
        if (!this._handlers.has(method))
            this._handlers.set(method, []);
        this._handlers.get(method).push(callback);

    }

    sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
}



// export default 'run my websocket';