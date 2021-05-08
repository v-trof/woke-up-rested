/* eslint-disable @typescript-eslint/no-var-requires */
const got = require('got');
const notifier = require('node-notifier');
const INTERVAL = 10000;

const hhmmStr2seconds = (hhmmStr) => {
    const [hours, minutes] = hhmmStr.split(':').map((x) => parseInt(x));
    return hours * 3600 + minutes * 60;
};

const currentTime2seconds = () => {
    const date = new Date();
    return date.getHours() * 3600 + date.getMinutes() * 60;
};

const getDesiredUserState = (sleepTime, currentTimeSeconds) => {
    const bedtime = hhmmStr2seconds(sleepTime.bedtime);
    const alarm = hhmmStr2seconds(sleepTime.alarm);
    const now = currentTimeSeconds;

    console.log(bedtime, now, alarm);

    // bedtime and alarm on the same day
    if (alarm > bedtime) {
        if (now > bedtime && now < alarm) {
            return 'sleep';
        }
    }

    // betime before 00:00, alarm after 00:00 next day
    if (alarm < bedtime) {
        if (now > bedtime || now < alarm) {
            return 'sleep';
        }
    }

    return 'wake';
};

const pressure2UserState = (bedStatus) => {
    return bedStatus.pressure ? 'sleep' : 'wake';
};

const getUserStatus = async (token) => {
    const status = await got(
        `https://us-central1-full-time-sleep.cloudfunctions.net/getUserStatus?token=${token}`,
    ).json();

    return status;
};

const reactToUserState = async (token) => {
    const status = await getUserStatus(token);
    const desiredState = getDesiredUserState(status.sleepTime, currentTime2seconds());
    const actualState = pressure2UserState(status.bedStatus);

    console.log(actualState, '=>', desiredState);

    if (actualState !== desiredState) {
        console.log('NOTIFY');
        notifier.notify({
            title: 'You shold be' + desiredState,
            message: 'DO IT',
        });
    }
};

const startAlarmInterval = (token) => {
    reactToUserState(token);
    const interval = setInterval(() => reactToUserState(token), INTERVAL);
    return () => clearInterval(interval);
};

module.exports = {
    startAlarmInterval,
};
