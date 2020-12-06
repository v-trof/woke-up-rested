import { observable, reaction } from 'mobx';

import { app } from '../api/firebase';
import { fireSync } from '../util/fireSync';
import { log } from '../util/log';

type DeviceStore = {
    deviceId: string;
    status: null | {
        pressure: boolean;
    };
};

export const deviceStore: DeviceStore = observable({
    deviceId: '',
    status: null,
});

let disposeOld = () => {
    /*noop */
};

reaction(
    () => deviceStore.deviceId,
    async (id) => {
        disposeOld();
        deviceStore.status = null;
        disposeOld = await fireSync('status', deviceStore, app.firestore().collection('status').doc(id), {
            pressure: false,
        });
    },
);

log(deviceStore);
