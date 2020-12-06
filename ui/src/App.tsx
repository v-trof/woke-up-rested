import { observer } from 'mobx-react-lite';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { googleAuth, logOut } from './api/auth';
import { store } from './store/store';

export const App = observer(() => {
    return (
        <>
            {store.readyState.app || 'Loading'}
            <header>
                {store.user.name ? (
                    <button onClick={logOut}>LOG OUT</button>
                ) : (
                    <button onClick={googleAuth}>LOG IN With google</button>
                )}
            </header>
        </>
    );
});

ReactDOM.render(<App />, document.getElementById('app'));
