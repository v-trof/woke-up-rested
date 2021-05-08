# full-time-sleep

Trofimov Vsevolod. Saint-Petersburg State University. Study group 17Б-11ПУ. 2021.

---

### Building the project:
#### Cloud
- `cd cloud`
- `npm i -g firebase`
- `firebase login`
- `cd functions`
- `npm ci`
- `firebase deploy`

#### Desktop
- `cd desktop`
- `yarn`
- `yarn dev:app` in parallel with `yarn start`
- Press `Sign in`

#### IoT Device
- Prepare ESP32, a few load cells and HX711
- Connect HX711 to ESP32: `DT->D4, SCK->D5`
- Install platform io extestion for Visual Studio code
- Update DeviceId and wifi credentials in `device/src/main.cpp` (proper pairing in progress)
- Flash ESP32 using PlatformUI GUI

