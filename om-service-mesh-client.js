const WebSocket = require('ws');

class OmServiceMeshClient {
    constructor(config) {
        this.MASTER_SERVICE_ADDRESS = config.MASTER_SERVICE_ADDRESS;
        this.serviceId = config.serviceId;
        this.serviceName = config.serviceName;
        this.serviceAddress = config.serviceAddress;
        this.serviceHostname = require('os').hostname();
        this.tempMessages = [];
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.MASTER_SERVICE_ADDRESS);
        console.log('\x1B[33m[OmServiceMeshClient] service master connecting\x1B[0m', this.MASTER_SERVICE_ADDRESS)

        this.ws.on('open', () => {
            console.log('\x1B[32m[OmServiceMeshClient] service master connected\x1B[0m')
            this.register();
            this.tempMessages.forEach(msg => this.ws.send(msg));
        });

        this.ws.on('message', data => {
            data = data.toString();
            if (data === 'ping') {
                this.ws.send('pong');
                return;
            }
            try {
                data = JSON.parse(data);
                if ('emit' === data.type) {
                    this.ws.emit(data.eventName, data.eventData);
                }
            } catch (e) {
                console.error('[OmServiceMeshClient] received no json data:', data);
            }
        });

        this.ws.on('error', error => {
            console.error('[OmServiceMeshClient] service master connection error:', error);
        });

        this.ws.on('close', error => {
            console.error('[OmServiceMeshClient] service master connection close:', error);
            setTimeout(() => this.connect(), 3000);
        });
    }

    register() {
        let params = {
            type: 'register',
            serviceId: this.serviceId,
            serviceName: this.serviceName,
            serviceAddress: this.serviceAddress,
            serviceHostname: this.serviceHostname,
        };
        this.ws.send(JSON.stringify(params));
    }

    on(eventName, callback) {
        if (!eventName) throw Error('need event name');
        if (typeof callback !== 'function') throw Error('need event callback');
        this.ws.on(eventName, callback);
    }

    emit(eventName, eventData) {
        if (!eventName) throw Error('need event name');
        let params = {type: 'emit', eventName, eventData};
        this.send(JSON.stringify(params));
    }

    send(message) {
        if (this.ws.readyState) {
            this.ws.send(message);
        } else {
            this.tempMessages.push(message);
        }
    }
}

module.exports = config => new OmServiceMeshClient(config);
