import 'antd/dist/antd.css';

import { Button, Card, Col, Divider, Layout, PageHeader, Row, Skeleton, Spin, TimePicker } from 'antd';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const { Content } = Layout;

import { googleAuth, logOut } from '../api/auth';
import { Store, store } from './appStore';

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

const setAlarm = action((time: Store['alarm']) => (store.alarm = time));
const setTime = action((time: Store['alarm']) => (store.time = time || moment()));

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
                        LOG OUT
                    </Button>
                ) : (
                    <Button danger type="primary" onClick={googleAuth}>
                        LOG IN With google
                    </Button>
                )
            }
        >
            <Content>
                {store.user.name && (
                    <main>
                        <section>
                            <h3>Your devices</h3>
                            <Row>
                                {store.devices.list.map((id) => (
                                    <Device id={id} status={store.devices.status[id]} key={id} />
                                ))}
                            </Row>
                        </section>
                        <Divider />
                        <section>
                            <h3>Alarm</h3>
                            <Row>
                                <Col span={12}>
                                    Alarm <br />
                                    <TimePicker value={store.alarm} onChange={setAlarm} format={'HH:mm'} />
                                </Col>
                                <Col span={12}>
                                    World time override
                                    <br />
                                    <TimePicker value={store.time} onChange={setTime} format={'HH:mm'} />
                                </Col>
                            </Row>
                        </section>
                    </main>
                )}
            </Content>
        </PageHeader>
    );
});

ReactDOM.render(<App />, document.getElementById('app'));
