# om-service-mesh-client
om-service-mesh-client

#use

```javascript
const OmServiceMeshClient = require('om-service-mesh-client')({
    MASTER_SERVICE_ADDRESS: 'ws://localhost:3000',
    serviceId: 'serviceId',
    serviceName: 'serviceName',
    serviceAddress: 'http://localhost:8080',
});
OmServiceMeshClient.on('config.update', () => console.log('on:config.update'));
OmServiceMeshClient.emit('config.update');
```
