import { autorun, toJS } from 'mobx';

export const log = (store: unknown) => autorun(() => console.log(toJS(store)));
