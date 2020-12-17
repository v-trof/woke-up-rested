import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { googleAuth, logOut } from '../api/auth';
import { app, db, FirebaseUser } from '../api/firebase';

export const PairApp = () => {
    const [deviceId, setDeviceId] = React.useState('');
    const [user, setUser] = React.useState<FirebaseUser>(null);
    const [pairStatus, setPairStatus] = React.useState('');

    React.useEffect(() => {
        app.auth().onAuthStateChanged(setUser);
    });

    const pair = async () => {
        const email = user && user.email;

        if (!email) {
            setPairStatus('Logging in required');
            return;
        }

        try {
            const doc = await db.collection('pair-user-device').doc(email).get();
            const pairs = doc.exists ? (doc.data() as { devices: string[] }) : { devices: [] };
            if (!pairs.devices.includes(deviceId)) {
                pairs.devices.push(deviceId);
                await db.collection('pair-user-device').doc(email).set(pairs);
            }

            await db.collection('pair-device-user').doc(deviceId).set({ email: email });

            setPairStatus('Pairing successful');
        } catch (error) {
            console.error(error);
            setPairStatus(String(error));
        }
    };

    return (
        <>
            <header>
                {user && user.displayName ? (
                    <button onClick={logOut}>LOG OUT</button>
                ) : (
                    <button onClick={googleAuth}>LOG IN With google</button>
                )}
            </header>
            <main>
                {user && user.displayName && (
                    <div>
                        <label htmlFor="deviceId">Device id:</label>
                        <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} id="deviceId"></input>
                        <button onClick={pair}>Pair</button>
                    </div>
                )}
                {pairStatus && (
                    <div>
                        {pairStatus}
                        <button onClick={() => setPairStatus('')}>ok</button>
                    </div>
                )}
            </main>
        </>
    );
};

ReactDOM.render(<PairApp />, document.getElementById('app'));
