import 'antd/dist/antd.css';

import { Button, Card, Col, Divider, Layout, PageHeader, Row, Skeleton, Spin, TimePicker } from 'antd';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const { Content } = Layout;

import { googleAuth, logOut } from '../api/auth';
import { store } from './appStore';

const Device = observer((props: { id: string; status: { pressure: boolean } }) => {
    return (
        <Card>
            <Skeleton loading={store.devices.loading} avatar active>
                <Card.Meta
                    title={`Sensor ${props.id}`}
                    description={props.status.pressure ? `😴 You are falling asleep` : `🛌 Empty bed`}
                />
            </Skeleton>
        </Card>
    );
});

const hhmm2moment = (hhmmStr: string) => {
    const date = moment();
    const [hours, minutes] = hhmmStr.split(':').map((x) => parseInt(x));
    date.hour(hours);
    date.minute(minutes);
    return date;
};
const moment2hhmm = (date: moment.Moment | null) => {
    if (!date) {
        return '00:00';
    }
    return `${date.hours()}:${date.minutes()}`;
};

const setBedtime = action((date: moment.Moment | null) => {
    store.sleepTime.bedtime = moment2hhmm(date);
});
const setAlarm = action((date: moment.Moment | null) => {
    store.sleepTime.alarm = moment2hhmm(date);
});

export const App = observer(() => {
    if (!store.readyState.app) {
        return <Spin />;
    }

    return (
        <PageHeader
            title="Full time sleep"
            extra={
                store.user.name ? (
                    <Button danger onClick={logOut}>
                        Sign out
                    </Button>
                ) : (
                    <Button danger type="primary" onClick={googleAuth}>
                        Sign in with google
                    </Button>
                )
            }
        >
            <Content>
                {store.user.name && (
                    <main>
                        <section>
                            <h3>Alarm</h3>
                            <Row>
                                <Col span={12}>
                                    Bedtime <br />
                                    <TimePicker
                                        value={hhmm2moment(store.sleepTime.bedtime)}
                                        onChange={setBedtime}
                                        format={'HH:mm'}
                                    />
                                </Col>
                                <Col span={12}>
                                    Alarm
                                    <br />
                                    <TimePicker
                                        value={hhmm2moment(store.sleepTime.alarm)}
                                        onChange={setAlarm}
                                        format={'HH:mm'}
                                    />
                                </Col>
                            </Row>
                        </section>
                        <Divider />
                        <section>
                            <h3>Your devices</h3>
                            <Row>
                                {store.devices.list.map((id) => (
                                    <Device id={id} status={store.devices.status[id]} key={id} />
                                ))}
                            </Row>
                        </section>
                    </main>
                )}
            </Content>
        </PageHeader>
    );
});

ReactDOM.render(<App />, document.getElementById('app'));
