# ANDIO PIANO - Arduino Integration Guide

## 📋 Hardware-Anforderungen

### Unterstützte Boards
- **Arduino Nano** (empfohlen für kleine Setups)
- **Arduino UNO/Mega** (für große Klaviere)
- **ESP32** (mit Bluetooth-Support)

### Komponenten
- **2× WS2812B LED-Strips** (Anzahl nach Tastatur)
- **5V Netzteil** (min. 2A für 88 Tasten, 4A+ für große Setups)
- **Widerstände:** 470Ω für Data-Lines (empfohlen)
- **Kondensator:** 1000µF am Netzteil (Schutz vor Spikes)
- **Kabel:** Mindestens 0.5mm² für Power-Lines

---

## 🔌 Verkabelung

### Grundschema

```
ARDUINO NANO/UNO:          LED-STRIPS:
┌───────────────┐          
│               │          WEIßE TASTEN (Strip 1):
│  D6 ◄─────────┼──────────► DATA IN
│  D7 ◄─────────┼──────┐    
│               │      │    SCHWARZE TASTEN (Strip 2):
│  5V ◄─────────┼──┬───┴────► DATA IN
│  GND ◄────────┼──┼────────► GND (beide Strips)
└───────────────┘  │
                   └────────► +5V (beide Strips)
                   
NETZTEIL (5V):
┌────────────┐
│  + ────────┼──────► Arduino 5V + LED 5V
│  - ────────┼──────► Arduino GND + LED GND
└────────────┘
```

### Wichtige Hinweise

1. **Separate Reihen:** Weiße und schwarze Tasten sind **zwei getrennte Strips**
2. **Reihenfolge:** LEDs **von LINKS nach RECHTS** verkabeln
3. **2 LEDs/Taste:** Bei 2 LEDs pro Taste einfach beide nacheinander im Strip einbauen
4. **Stromversorgung:** 
   - Bis 50 LEDs: USB-Power reicht meist
   - 50-100 LEDs: Externes 5V/2A Netzteil
   - 100+ LEDs: 5V/4A+ Netzteil, evtl. mehrere Einspeisepunkte

---

## 💾 Software-Setup

### 1. Arduino IDE installieren
- Download: [arduino.cc](https://www.arduino.cc/en/software)
- Installiere die IDE (Version 2.x empfohlen)

### 2. FastLED-Bibliothek hinzufügen
```
Arduino IDE → Tools → Manage Libraries
Suche: "FastLED"
Installiere: FastLED by Daniel Garcia
```

### 3. Sketch hochladen
1. Öffne `AndioPiano_LED_Controller.ino`
2. Board auswählen: `Tools → Board → Arduino Nano/UNO`
3. Port auswählen: `Tools → Port → COMx / /dev/ttyUSBx`
4. **Konfiguration anpassen** (siehe unten)
5. Upload: `Sketch → Upload`

### 4. Grundkonfiguration im Code

```cpp
// Am Anfang der .ino-Datei:

#define PIN_WHITE 6        // Data-Pin für weiße Tasten
#define PIN_BLACK 7        // Data-Pin für schwarze Tasten
#define MAX_LEDS 200       // Maximum LEDs pro Strip (anpassen!)

int numWhite = 88;         // Anzahl weiße Tasten (Standard 88-Tasten)
int numBlack = 36;         // Anzahl schwarze Tasten
int ledsPerWhiteKey = 1;   // 1 oder 2 LEDs pro Taste
int ledsPerBlackKey = 1;
uint8_t brightness = 200;  // 0-255 (Standard: 200)
```

---

## 📡 Kommunikation

### USB (Serial)
- **Standard-Methode** über USB-Kabel
- Baudrate: **115200**
- Android-App nutzt USB-OTG

### Bluetooth (optional)
#### Hardware: HC-05 oder ESP32
```
HC-05 Modul:
  TX → Arduino RX
  RX → Arduino TX (über Spannungsteiler 5V→3.3V!)
  VCC → 5V
  GND → GND
```

Für ESP32: BLE ist nativ integriert, keine Zusatzhardware nötig.

---

## 🎹 Protokoll-Referenz

### App → Arduino

| Befehl | Parameter | Beschreibung | Beispiel |
|--------|-----------|--------------|----------|
| `CFG` | `BRIGHT=<0-255>` | Helligkeit setzen | `CFG BRIGHT=180` |
| | `LEN_W=<n>` | Anzahl weiße Tasten | `CFG LEN_W=88` |
| | `LEN_B=<m>` | Anzahl schwarze Tasten | `CFG LEN_B=36` |
| | `LPKW=<1\|2>` | LEDs pro weiße Taste | `CFG LPKW=2` |
| | `LPKB=<1\|2>` | LEDs pro schwarze Taste | `CFG LPKB=1` |
| `N` | `<midi> <state>` | Note setzen | `N 60 1` |
| | State: 0=aus, 1=gelb, 2=grün, 3=rot, 4=blau, 5=cyan | | |
| `C` | - | Alle LEDs löschen | `C` |
| `PAUSE` | `on\|off` | Pause aktivieren/deaktivieren | `PAUSE on` |
| `HINT` | `<midi>` | Taste blinken lassen | `HINT 62` |
| `TEST` | - | Test-Sequenz starten | `TEST` |

### Arduino → App

| Nachricht | Bedeutung |
|-----------|-----------|
| `ANDIO_READY` | Arduino betriebsbereit (beim Start) |
| `OK_CFG` | Config empfangen |
| `OK_N` | Note gesetzt |
| `OK_C` | LEDs gelöscht |
| `OK_PAUSE_ON` | Pause aktiviert |
| `OK_PAUSE_OFF` | Pause deaktiviert |
| `OK_HINT` | Hinweis-Blink ausgeführt |
| `OK_TEST` | Test abgeschlossen |
| `ERR_UNKNOWN_CMD` | Unbekannter Befehl |

---

## 🎨 LED-Farben

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| **Gelb** | `#FFC800` | Voranzeige (diese Taste jetzt drücken) |
| **Grün** | `#00FF00` | Korrekt gespielt |
| **Rot** | `#FF0000` | Falsch / zu früh / zu spät |
| **Blau** | `#0064FF` | System-/Kalibrierzustand |
| **Cyan** | `#00FFFF` | Kalibrier-Marker |
| **Schwarz** | `#000000` | LED aus |

Farben können im Code angepasst werden:
```cpp
const CRGB COLOR_YELLOW = CRGB(255, 200, 0);
const CRGB COLOR_GREEN = CRGB(0, 255, 0);
// ... etc.
```

---

## 🔧 Troubleshooting

### LEDs leuchten nicht
1. ✅ Stromversorgung prüfen (5V, ausreichend Ampere)
2. ✅ Data-Pin korrekt verbunden?
3. ✅ LED-Strip richtig herum? (DATA IN → DATA OUT Richtung)
4. ✅ `MAX_LEDS` im Code groß genug?
5. ✅ Testsequenz ausführen: Sende `TEST` über Serial Monitor

### Falsche Farben/Flackern
1. ✅ Kondensator (1000µF) am Netzteil
2. ✅ Widerstände (470Ω) in Data-Lines
3. ✅ Kurze Kabel verwenden oder Signal auffrischen
4. ✅ FastLED-Chip-Typ korrekt? Standard: `WS2812B`

### Verbindung bricht ab
1. ✅ USB-Kabel testen (Datenleitungen intakt?)
2. ✅ Serial Monitor während Betrieb **geschlossen** halten
3. ✅ Keine anderen Programme greifen auf COM-Port zu
4. ✅ Bei Bluetooth: HC-05 richtig gepaired?

### Mapping stimmt nicht
1. ✅ In der App: **Automapping durchführen**
2. ✅ `numWhite` und `numBlack` im Arduino-Code prüfen
3. ✅ LED-Reihenfolge: wirklich von links nach rechts?
4. ✅ Schwarze und weiße Strips nicht vertauscht?

---

## ⚡ Performance-Tipps

### Stromversorgung optimieren
- **Mehrere Einspeisepunkte:** Bei >150 LEDs alle 50 LEDs 5V/GND einspeisen
- **Dicke Kabel:** Mindestens 0.5mm² für Power-Lines
- **Kurze Wege:** Netzteil nah an LEDs platzieren

### Code optimieren
- `FastLED.setBrightness()` nur einmal beim Start
- `FastLED.show()` nicht öfter als 50x/Sekunde
- Bei vielen LEDs: `FastLED.setMaxRefreshRate(60)`

### LED-Anzahl reduzieren
- Statt 2 LEDs/Taste: nur 1 LED verwenden
- Spart Strom und erhöht Performance
- In App: Einstellung "LEDs pro Taste" anpassen

---

## 📚 Weiterführende Links

- **FastLED Dokumentation:** [fastled.io](http://fastled.io)
- **WS2812B Datenblatt:** [Worldsemi](https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf)
- **Arduino Serial:** [arduino.cc/reference](https://www.arduino.cc/reference/en/language/functions/communication/serial/)
- **ANDIO GitHub:** (Link zum Repository)

---

## 🆘 Support

Bei Problemen:
1. Serial Monitor öffnen (Tools → Serial Monitor, 115200 Baud)
2. Teste mit manuellen Befehlen: `TEST`, `N 60 1`, `C`
3. Prüfe Fehlermeldungen (`ERR_...`)
4. Dokumentiere Setup (Boardtyp, LED-Anzahl, Verkabelung)

**Kontakt:** support@andio-piano.com (Beispiel)

---

© 2025 ANDIO PIANO - Open Source Hardware Project