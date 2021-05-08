import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type DeviceStatus = {pressure: boolean;}

admin.initializeApp();
export const setDeviceStatus = functions.https.onRequest(async (req, res) => {
  const {pressure, deviceId} = req.body as DeviceStatus & { deviceId: string };

  if (typeof deviceId === "undefined" || typeof pressure === "undefined") {
    res.status(400);
    res.json({error: "DeviceId & Pressure are required request params"});
    return;
  }

  functions.logger.log("Set pressure for", deviceId, ":", pressure);

  const status = admin.firestore().collection("deviceStatus");
  await status.doc(deviceId).set({pressure});

  res.json({result: "Update successful."});
});

export const getDeviceStatus = functions.https.onRequest(async (req, res) => {
  const deviceId = req.query.deviceId;
  functions.logger.log("Get pressure for", deviceId);

  if (typeof deviceId !== "string") {
    res.status(400);
    res.json({error: "DeviceId is a required query param"});
    return;
  }

  const status = admin.firestore().collection("deviceStatus");
  const doc = await status.doc(deviceId).get();

  if (!doc.exists) {
    res.status(400);
    res.json({error: `Device with id ${deviceId} not found`});
    return;
  }

  const data = doc.data() as DeviceStatus;


  res.json({status: {pressure: data.pressure}});
});
