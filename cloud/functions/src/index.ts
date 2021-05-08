import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type DeviceStatus = {pressure: boolean; timestamp: number}

admin.initializeApp();
const getTimestamp = () => admin.firestore.Timestamp.now().seconds;

export const setDeviceStatus = functions.https.onRequest(async (req, res) => {
  const {pressure, deviceId} = req.body as DeviceStatus & { deviceId: string };

  if (typeof deviceId === "undefined" || typeof pressure === "undefined") {
    res.status(400);
    res.json({error: "DeviceId & Pressure are required request params"});
    return;
  }

  functions.logger.log("Set pressure for", deviceId, ":", pressure);

  const status = admin.firestore().collection("deviceStatus");
  const timestamp = getTimestamp();
  await status.doc(deviceId).set({pressure, timestamp});

  res.json({result: "Update successful."});
});

export const getUserStatus = functions.https.onRequest(async (req, res) => {
  const token = req.query.token;
  functions.logger.log("Get status for the user", token);

  if (typeof token !== "string") {
    res.status(400);
    res.json({error: "token is a required query param"});
    return;
  }

  const token2device = admin.firestore().collection("userToken2deviceId");
  const token2sleepTime = admin.firestore().collection("userToken2sleepTime");
  const status = admin.firestore().collection("deviceStatus");

  const userDevicesDoc = await token2device.doc(token).get();
  if (!userDevicesDoc.exists) {
    res.status(400);
    res.json({error: "User has no devices"});
    return;
  }

  const bedId = (userDevicesDoc.data() as {bed: string}).bed;
  const bedDoc = await status.doc(bedId).get();
  if (!bedDoc.exists) {
    res.status(400);
    res.json({error: `Device with id ${bedId} not found`});
    return;
  }

  const sleepDoc = await token2sleepTime.doc(token).get();
  if (!sleepDoc.exists) {
    res.status(400);
    res.json({error: "User has no sleep schedule"});
    return;
  }

  const {pressure, timestamp} = bedDoc.data() as DeviceStatus;

  res.json({
    bedStatus: {
      pressure,
      age: getTimestamp() - timestamp,
    },
    sleepTime: sleepDoc.data(),
  });
});
