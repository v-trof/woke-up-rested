import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { deviceStore } from './deviceStore';

const Status = observer(() => {
    const status = deviceStore.status;

    return (
        <div>
            Status: ${JSON.stringify(status)}
            <br />
            {status && <button onClick={action(() => (status.pressure = !status.pressure))}>Toggle pressure</button>}
        </div>
    );
});

export const DeviceEmultator = observer(() => {
    const [deviceId, setDeviceId] = React.useState('');
    const commitId = action(() => (deviceStore.deviceId = deviceId));

    return (
        <>
            <main>
                <label htmlFor="deviceId">Device id:</label>
                <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} id="deviceId"></input>
                <button onClick={commitId}>Emulate</button>

                {deviceStore.deviceId && <Status />}
            </main>
        </>
    );
});

ReactDOM.render(<DeviceEmultator />, document.getElementById('app'));
