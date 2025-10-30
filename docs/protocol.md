# ANDIO PIANO - Kommunikationsprotokoll v3.6

Vollständige Referenz für die Kommunikation zwischen Android-App und Arduino-Controller.

---

## 📡 Verbindungsarten

### USB Serial (Standard)
- **Baudrate:** 115200
- **Datenbits:** 8
- **Parität:** None
- **Stoppbits:** 1
- **Flow Control:** None
- **Android:** USB-OTG Adapter erforderlich

### Bluetooth (Optional)
- **Hardware:** HC-05 Modul oder ESP32 BLE
- **Profile:** SPP (Serial Port Profile)
- **UUID:** Standard SPP UUID
- **Pairing:** Über Android Bluetooth-Settings

---

## 📤 Befehle: App → Arduino

### 1. Konfiguration (`CFG`)

#### Syntax
```
CFG [PARAMETER=WERT ...]
```

#### Parameter
| Parameter | Typ | Bereich | Beschreibung |
|-----------|-----|---------|--------------|
| `BRIGHT` | int | 0-255 | Globale LED-Helligkeit |
| `LEN_W` | int | 1-200 | Anzahl weiße Tasten |
| `LEN_B` | int | 0-200 | Anzahl schwarze Tasten |
| `LPKW` | int | 1-2 | LEDs pro weiße Taste |
| `LPKB` | int | 1-2 | LEDs pro schwarze Taste |
| `PINW` | int | 0-13 | Data-Pin für weiße LEDs |
| `PINB` | int | 0-13 | Data-Pin für schwarze LEDs |

#### Beispiele
```
CFG BRIGHT=200                         # Nur Helligkeit
CFG LEN_W=88 LEN_B=36                  # Tastenzahl
CFG BRIGHT=180 LEN_W=61 LEN_B=25       # Kombiniert
CFG LPKW=2 LPKB=1                      # 2 LEDs/weiße, 1 LED/schwarze
CFG PINW=6 PINB=7                      # Pin-Konfiguration
```

#### Antwort
```
OK_CFG
```

---

### 2. Note setzen (`N`)

#### Syntax
```
N <midi> <state>
```

#### Parameter
| Parameter | Typ | Bereich | Beschreibung |
|-----------|-----|---------|--------------|
| `midi` | int | 0-127 | MIDI-Notennummer (21=A0, 60=C4, 108=C8) |
| `state` | int | 0-5 | LED-Zustand (siehe unten) |

#### LED-Zustände
| State | Farbe | Hex | Bedeutung |
|-------|-------|-----|-----------|
| 0 | Aus | `#000000` | LED ausschalten |
| 1 | Gelb | `#FFC800` | Voranzeige (jetzt spielen) |
| 2 | Grün | `#00FF00` | Korrekt gespielt |
| 3 | Rot | `#FF0000` | Falsch gespielt |
| 4 | Blau | `#0064FF` | System-Status |
| 5 | Cyan | `#00FFFF` | Kalibrier-Marker |

#### Beispiele
```
N 60 1      # C4 (Mittel-C) gelb
N 60 2      # C4 grün (korrekt)
N 62 3      # D4 rot (falsch)
N 64 0      # E4 ausschalten
N 48 4      # C3 blau (System)
```

#### Antwort
```
OK_N
```

---

### 3. Alle löschen (`C`)

#### Syntax
```
C
```

#### Beschreibung
Schaltet alle LEDs beider Strips aus (schwarz).

#### Antwort
```
OK_C
```

---

### 4. Pause (`PAUSE`)

#### Syntax
```
PAUSE <on|off>
```

#### Beschreibung
- `PAUSE on`: Ignoriert alle Note-Befehle (außer State 4=System)
- `PAUSE off`: Normale Verarbeitung wird fortgesetzt

#### Beispiele
```
PAUSE on
PAUSE off
```

#### Antwort
```
OK_PAUSE_ON
OK_PAUSE_OFF
```

---

### 5. Hinweis-Blinken (`HINT`)

#### Syntax
```
HINT <midi>
```

#### Beschreibung
Lässt die angegebene Taste 3× gelb blinken (je 200ms an/aus).

#### Beispiele
```
HINT 60      # C4 blinkt
HINT 67      # G4 blinkt
```

#### Antwort
```
OK_HINT
```

---

### 6. Testsequenz (`TEST`)

#### Syntax
```
TEST
```

#### Beschreibung
Führt eine Test-Animation aus:
1. Alle Farben durchlaufen (Gelb → Grün → Rot → Blau → Cyan)
2. Je 500ms pro Farbe
3. Danach alles ausschalten

#### Antwort
```
OK_TEST
```

---

## 📥 Antworten: Arduino → App

### Startup-Message
```
ANDIO_READY
```
Wird beim Arduino-Start gesendet. App wartet auf diese Message, bevor sie Befehle sendet.

### Erfolgs-Bestätigungen
| Message | Bedeutung |
|---------|-----------|
| `OK_CFG` | Konfiguration empfangen & angewendet |
| `OK_N` | Note gesetzt |
| `OK_C` | LEDs gelöscht |
| `OK_PAUSE_ON` | Pause aktiviert |
| `OK_PAUSE_OFF` | Pause deaktiviert |
| `OK_HINT` | Hinweis-Blinken ausgeführt |
| `OK_TEST` | Testsequenz abgeschlossen |

### Fehlermeldungen
| Message | Bedeutung |
|---------|-----------|
| `ERR_UNKNOWN_CMD` | Unbekannter Befehl |
| `ERR_INVALID_MIDI` | MIDI-Nummer außerhalb Bereich |
| `ERR_INVALID_STATE` | State-Wert ungültig |
| `ERR_PARSE` | Parsing-Fehler (falsche Syntax) |

---

## 🔄 Typische Kommunikations-Flows

### 1. Startup & Initialisierung
```
Arduino: ANDIO_READY

App: CFG BRIGHT=200 LEN_W=88 LEN_B=36 LPKW=1 LPKB=1
Arduino: OK_CFG

App: TEST
Arduino: OK_TEST
```

### 2. Karaoke-Session
```
# Song startet, Note 60 steht bevor
App: N 60 1
Arduino: OK_N

# Nutzer spielt Note 60 (korrekt)
App: N 60 2
Arduino: OK_N

# 300ms später: LED aus
App: N 60 0
Arduino: OK_N

# Nächste Note 62
App: N 62 1
Arduino: OK_N

# Nutzer spielt Note 64 (falsch!)
App: N 64 3
Arduino: OK_N

App: PAUSE on
Arduino: OK_PAUSE_ON

# Hinweis: Richtige Taste blinken
App: HINT 62
Arduino: OK_HINT

# Nutzer korrigiert
App: PAUSE off
Arduino: OK_PAUSE_OFF

App: N 62 2
Arduino: OK_N
```

### 3. Kalibrierungs-Prozess
```
# Vorbereitung
App: C
Arduino: OK_C

# LED 0 (erste weiße Taste) blinken
App: N 21 5
Arduino: OK_N
# (100ms warten)
App: N 21 0
Arduino: OK_N

# LED 1 (zweite weiße Taste) blinken
App: N 23 5
Arduino: OK_N
# (100ms warten)
App: N 23 0
Arduino: OK_N

# ... für alle Tasten wiederholen

# Abschluss
App: C
Arduino: OK_C
```

### 4. Fehlerbehandlung
```
App: INVALID_COMMAND
Arduino: ERR_UNKNOWN_CMD

App: N 200 1
Arduino: ERR_INVALID_MIDI

App: N 60 9
Arduino: ERR_INVALID_STATE

# App wiederholt mit korrektem Befehl
App: N 60 1
Arduino: OK_N
```

---

## 🎹 MIDI-Noten-Referenz

### Standard-Klaviatur (88 Tasten)
```
┌────────┬─────────┬──────────┐
│ Oktave │ Bereich │ MIDI     │
├────────┼─────────┼──────────┤
│ A0     │ A       │ 21       │
│ C1     │ C-B     │ 24-35    │
│ C2     │ C-B     │ 36-47    │
│ C3     │ C-B     │ 48-59    │
│ C4     │ C-B     │ 60-71    │  ← Mittel-C = 60
│ C5     │ C-B     │ 72-83    │
│ C6     │ C-B     │ 84-95    │
│ C7     │ C-B     │ 96-107   │
│ C8     │ C       │ 108      │
└────────┴─────────┴──────────┘
```

### Noten-Namen
```
C  C# D  D# E  F  F# G  G# A  A# B
0  1  2  3  4  5  6  7  8  9  10 11  (Modulo 12)
```

### Beispiele
| Note | MIDI | Frequenz | Verwendung |
|------|------|----------|------------|
| A0 | 21 | 27.5 Hz | Tiefste Taste Standard-Klavier |
| C1 | 24 | 32.7 Hz | - |
| C4 | 60 | 261.6 Hz | Mittel-C, Referenz |
| A4 | 69 | 440 Hz | Kammerton, Stimmgabel |
| C8 | 108 | 4186 Hz | Höchste Taste Standard-Klavier |

---

## ⚙️ Implementierungs-Details

### LED-Mapping (Arduino-seitig)

#### Weiße Tasten
```cpp
bool isWhite = !isBlackKey(midi);
int octave = (midi - 12) / 12;
int noteInOctave = (midi - 12) % 12;

// Mapping: C=0, D=1, E=2, F=3, G=4, A=5, B=6
int whiteIndex = octave * 7 + whiteNote[noteInOctave];
int ledIndex = whiteIndex * ledsPerWhiteKey;
```

#### Schwarze Tasten
```cpp
bool isBlack = isBlackKey(midi);
int octave = (midi - 13) / 12;
int noteInOctave = (midi - 13) % 12;

// Mapping: C#=0, D#=1, F#=2, G#=3, A#=4
int blackIndex = octave * 5 + blackNote[noteInOctave];
int ledIndex = blackIndex * ledsPerBlackKey;
```

### Timing-Empfehlungen

| Operation | Max. Frequenz | Empfohlene Verzögerung |
|-----------|---------------|------------------------|
| `CFG` | 1x beim Start | - |
| `N` | 100 Hz | 10ms zwischen Befehlen |
| `C` | 10 Hz | 100ms |
| `PAUSE` | 10 Hz | 100ms |
| `HINT` | 1 Hz | 1000ms (blocking) |
| `TEST` | 0.1 Hz | 10s (blocking) |

### Buffer-Größen
- **Arduino RX-Buffer:** 64 Bytes (Standard Serial)
- **App TX-Buffer:** 256 Bytes
- **Max. Command-Länge:** 50 Zeichen

---

## 🔐 Fehlerbehandlung (Best Practices)

### App-seitig
```javascript
async function sendCommand(cmd) {
  try {
    await serial.write(cmd + '\n');
    const response = await serial.readUntil('\n', 1000); // 1s timeout
    
    if (response.startsWith('ERR_')) {
      console.error('Arduino Error:', response);
      // Retry oder User benachrichtigen
    } else if (response.startsWith('OK_')) {
      return true;
    }
  } catch (error) {
    console.error('Communication Error:', error);
    // Verbindung prüfen, ggf. neu verbinden
  }
  return false;
}
```

### Arduino-seitig
```cpp
void processCommand(String cmd) {
  cmd.trim();
  
  if (cmd.length() == 0) return;
  if (cmd.length() > 50) {
    Serial.println("ERR_TOO_LONG");
    return;
  }
  
  // Command parsing & validation
  if (isValidCommand(cmd)) {
    executeCommand(cmd);
  } else {
    Serial.println("ERR_PARSE");
  }
}
```

---

## 📊 Performance-Metriken

### Latenz (typisch)
- **USB Serial:** 5-10ms
- **Bluetooth:** 20-50ms
- **LED-Update:** 1-2ms

### Durchsatz
- **Befehle/Sekunde:** ~100 (USB), ~50 (BT)
- **Bytes/Sekunde:** ~11520 (115200 Baud ÷ 10)

---

## 🧪 Debugging & Testing

### Serial Monitor Tests
```
# Öffne Arduino IDE Serial Monitor (115200 Baud)

# Test 1: Startup
→ Erwarte: ANDIO_READY

# Test 2: Config
TEST
→ Erwarte: OK_TEST (+ LEDs zeigen Farben)

# Test 3: Einzelne Note
N 60 1
→ Erwarte: OK_N (+ C4 leuchtet gelb)

N 60 0
→ Erwarte: OK_N (+ C4 aus)

# Test 4: Clear
C
→ Erwarte: OK_C (+ alle LEDs aus)

# Test 5: Fehler
INVALID
→ Erwarte: ERR_UNKNOWN_CMD
```

### App-seitiges Logging
```javascript
// Enable Debug-Mode in App
Settings → Erweitert → Debug-Modus → An

// Logs zeigen:
[SEND] CFG BRIGHT=200 LEN_W=88 LEN_B=36
[RECV] OK_CFG
[SEND] N 60 1
[RECV] OK_N
```

---

## 📖 Versionierung

### Protokoll-Version: 3.6
- **Breaking Changes gegenüber 3.5:** Keine
- **Neue Features:** `LPKW/LPKB` Parameter in `CFG`
- **Abwärtskompatibel:** Ja (bis v3.0)

### Änderungshistorie
| Version | Datum | Änderungen |
|---------|-------|------------|
| 3.6 | 2025-01 | LEDs pro Taste konfigurierbar |
| 3.5 | 2024-12 | `HINT` Befehl hinzugefügt |
| 3.4 | 2024-11 | `PAUSE` Befehl hinzugefügt |
| 3.0 | 2024-10 | Erstes stabiles Protokoll |

---

**Bei Fragen zum Protokoll:** protocol@andio-piano.com (Beispiel)

© 2025 ANDIO PIANO