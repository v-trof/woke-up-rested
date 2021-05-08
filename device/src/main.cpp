#include <WiFi.h>
#include <Arduino.h>
#include <HTTPClient.h>
#include "HX711.h"

/* <Board> */
// info LED
#define LED_BUILTIN 2

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 4;
const int LOADCELL_SCK_PIN = 5;

HX711 scale;

void initBoard()
{
    pinMode(LED_BUILTIN, OUTPUT);
    scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
}

long readScale()
{
    long reading = scale.read();
    auto raw = reading;

    reading = reading / 100;
    reading = reading + 3370;

    Serial.print(raw);
    Serial.print("\t");
    Serial.println(reading);

    if (reading > -30 && reading < 30)
    {
        return 0;
    }

    return reading;
}
/* </Board> */

/* <WIFI> */
const char *ssid = "51n";
const char *password = "vuexredux";

unsigned long wifiInterval = 30000;
unsigned long wifiLastMillis = 0;

void initWiFi()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi ..");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print('.');
        delay(1000);
    }
    Serial.println(WiFi.localIP());
}

void ensureWifi()
{
    auto currentMillis = millis();

    if ((WiFi.status() != WL_CONNECTED) && (currentMillis - wifiLastMillis >= wifiInterval))
    {
        Serial.print(millis());
        Serial.println("Reconnecting to WiFi...");
        WiFi.disconnect();
        WiFi.reconnect();
        wifiLastMillis = currentMillis;
    }
}
/* </WIFI> */

/* <Config> */
String deviceId = "8i9T1rtAK8QWunNhNXfK";
/* </Config> */

/* </Status report> */
unsigned long statusInterval = 1000;
unsigned long statusLastMillis = -statusInterval;
bool lastHasPressure = false;
bool initial = true;

void uploadDeviceStatus(bool hasPressure)
{
    String serverPath = "https://us-central1-full-time-sleep.cloudfunctions.net/setDeviceStatus";
    String pressureValue = hasPressure ? "true" : "false";
    String deviceIdProp = "\"deviceId\":\"" + deviceId + "\"";
    String pressureProp = "\"pressure\":" + pressureValue;
    auto body = "{" + deviceIdProp + "," + pressureProp + "}";

    Serial.println("Reporting to firebase" + body);

    HTTPClient http;
    http.begin(serverPath.c_str());
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(body);
    if (httpResponseCode > 0)
    {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.println(payload);
    }
    else
    {
        Serial.print("HTTP Error code: ");
        Serial.println(httpResponseCode);
    }

    http.end();

    lastHasPressure = hasPressure;
    statusLastMillis = millis();
}

void reportDeviceStatus(bool hasPressure)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        return;
    }

    if (initial)
    {
        uploadDeviceStatus(hasPressure);
        initial = false;
    }

    if (millis() - statusLastMillis <= statusInterval)
    {
        return;
    }

    if (lastHasPressure == hasPressure)
    {
        return;
    }

    uploadDeviceStatus(hasPressure);
}
/* </Status report> */

void setup()
{
    Serial.begin(115200);
    initWiFi();
    initBoard();
}

void loop()
{
    ensureWifi();
    if (scale.wait_ready_timeout(1000))
    {
        auto load = readScale();
        digitalWrite(LED_BUILTIN, load == 0 ? LOW : HIGH);
        reportDeviceStatus(load != 0);
    }
    else
    {
        Serial.println("HX711 not found.");
    }
}