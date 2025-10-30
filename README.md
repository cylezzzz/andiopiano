# 🎹 ANDIO PIANO - Intelligentes LED-Lernsystem

**Core v3.6** • Hardware + Software • Multi-Profile • KI-Download • Offline

Ein universelles, modulares Lernsystem für Klavier, Keyboard, Orgel oder jede andere Tastatur. Kombiniert Arduino-gesteuerte LED-Beleuchtung mit einer leistungsstarken Android-App für interaktives Lernen.

---

## ✨ Features im Überblick

### 🎨 Hardware
- **2-Reihen LED-System** (weiße + schwarze Tasten separat)
- **Flexible Tastenzahl** (von Mini-Keyboards bis Flügel)
- **1-2 LEDs pro Taste** konfigurierbar
- **Arduino-basiert** (Nano/UNO/Mega/ESP32)
- **USB oder Bluetooth** Kommunikation

### 📱 Android-App
- **Automapping** per Kamera (erkennt LED-Anzahl automatisch)
- **Ton-Kalibrierung** über Mikrofon (ordnet jede LED einer Tonhöhe zu)
- **KI-Notenerkennung** (OMR: Basic + Advanced TFLite)
- **Karaoke-Modus** mit Live-Feedback und Scoring
- **Multi-Profile** (verschiedene Instrumente/Setups)
- **Komplett offline** (keine Cloud, keine Registrierung)

### 🤖 KI-Integration
- **Basic-OMR:** Immer verfügbar, klassische Bildverarbeitung
- **Advanced-OMR:** TensorFlow Lite, ~8 MB Download, höhere Genauigkeit
- **On-Device:** Alle Verarbeitung lokal auf dem Gerät
- **Zero-Click-Install:** Ein Klick, Download mit Fortschritt, fertig

### 🎵 Lernen & Spielen
- **Echtzeit-Feedback:** Gelb = jetzt spielen, Grün = korrekt, Rot = falsch
- **Fehler-Stop:** Pausiert bei falscher Taste, zeigt die richtige
- **Scoring-System:** Timing, Trefferquote, Streaks, Statistiken
- **Bibliothek:** Public Domain Songs vorinstalliert
- **Import:** Kamera-Scan, MusicXML, MIDI, Screenshots

---

## 🚀 Quick Start

### 1️⃣ Hardware aufbauen
```
1. LED-Strips an Arduino anschließen
   - Weiße Tasten → Pin D6
   - Schwarze Tasten → Pin D7
   - Beide: 5V + GND gemeinsam

2. Arduino-Sketch hochladen
   - Datei: arduino/AndioPiano_LED_Controller.ino
   - Bibliothek: FastLED (über Library Manager)

3. Mit Android-Gerät verbinden
   - USB-OTG Kabel ODER
   - Bluetooth (HC-05/ESP32)
```

**Detaillierte Anleitung:** `arduino/README.md`

### 2️⃣ App installieren & konfigurieren
```
1. APK installieren (Android 8.0+)
2. App starten → Profil erstellen
3. Kalibrierungs-Wizard durchlaufen:
   - Automapping (Kamera)
   - Ton-Kalibrierung (Mikrofon)
4. Optional: KI-Paket installieren
5. Fertig! → Karaoke starten
```

---

## 📂 Projektstruktur

```
andio-piano/
│
├── app/                          # Android-App (React Native)
│   ├── screens/
│   │   ├── ProfileScreen.js      # Profil-Übersicht
│   │   ├── CalibrationWizard.js  # Automapping + Ton-Kalibration
│   │   ├── KaraokePlayer.js      # Lernen & Spielen
│   │   ├── OMRScanner.js         # Noten-Scanner
│   │   ├── MusicLibrary.js       # Song-Verwaltung
│   │   ├── AddonManager.js       # Themes & Erweiterungen
│   │   └── SettingsPanel.js      # Konfiguration
│   │
│   └── utils/
│       ├── ArduinoController.js  # Serial/BT-Kommunikation
│       ├── OMREngine.js          # Notenerkennung
│       └── StorageManager.js     # Lokaler Dateispeicher
│
├── arduino/                      # Arduino-Code
│   ├── AndioPiano_LED_Controller.ino
│   └── README.md                 # Hardware-Setup & Protokoll
│
├── docs/                         # Dokumentation
│   ├── led_mapping.png           # Verkabelungsdiagramm
│   ├── protocol.md               # Kommunikationsprotokoll
│   └── calibration.md            # Kalibrierungs-Guide
│
├── assets/                       # Vorinstallierte Inhalte
│   └── songs/                    # Public Domain MusicXML
│       ├── alle_meine_entchen.xml
│       ├── haenschen_klein.xml
│       └── ode_an_die_freude.xml
│
└── README.md                     # Diese Datei
```

---

## 🎨 Farbschema (Standard)

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| 🟡 **Gelb** | `#FFC800` | Voranzeige: „Diese Taste jetzt drücken" |
| 🟢 **Grün** | `#00FF00` | Korrekt gespielt (Ton & Timing stimmen) |
| 🔴 **Rot** | `#FF0000` | Falsch / zu früh / zu spät |
| 🔵 **Blau** | `#0064FF` | System-/Kalibrierzustand |
| 🔷 **Cyan** | `#00FFFF` | Kalibrier-Marker |

Änderbar über Themes (Settings → Add-ons)

---

## 🧩 Automapping-Prozess

### Wie funktioniert es?

1. **Kamera-Setup:** App öffnet Kamera, Nutzer richtet sie auf Tastatur
2. **LED-Sequenz:**
   - Erst **weiße Tasten**: LEDs blinken nacheinander von links nach rechts
   - Dann **schwarze Tasten**: Gleicher Prozess
3. **Erkennung:** Kamera erfasst Helligkeits-Peaks → ermittelt Anzahl & Reihenfolge
4. **Speicherung:** Ergebnis wird im aktiven Profil gespeichert
5. **Fallback:** Manuelle Eingabe möglich (z.B. "88 weiße, 36 schwarze")

**Vorteile:**
- Funktioniert mit **jeder Tastenzahl**
- Keine fixe Tastatur-Konfiguration nötig
- Erkennt auch ungewöhnliche Layouts (z.B. Orgeln)

---

## 🎤 Ton-Kalibrierung

Nach dem Automapping folgt die **Ton-Kalibrierung**:

1. App gibt vor: "Spiele Taste 1"
2. Nutzer drückt die Taste
3. Mikrofon misst die **reale Frequenz**
4. App ordnet diese Frequenz der entsprechenden LED zu
5. Wiederholt für alle Tasten

**Ergebnis:** Jede LED kennt ihre exakte Tonhöhe (MIDI-Note) → perfektes Mapping für Karaoke

**Tipp:** Bei MIDI-Keyboards kann die Kalibrierung übersprungen werden (Standard-Mapping)

---

## 📊 Karaoke & Scoring

### Spielmodi
- **Lernen:** Fehler-Stop, Hinweise, kein Zeitdruck
- **Üben:** Fehler werden markiert, Musik läuft weiter
- **Herausforderung:** Strenge Timing-Bewertung, Streaks

### Scoring-Metriken
- **Trefferquote:** % korrekt gespielte Noten
- **Timing-Genauigkeit:** Wie präzise war der Anschlag?
- **Streak:** Längste Serie ohne Fehler
- **Session-Statistik:** Fortschritt über mehrere Durchgänge

### LED-Feedback
- **Vor dem Anschlag:** Gelb (Voranzeige)
- **Beim Anschlag:**
  - Grün = korrekt
  - Rot = falsch
- **Bei Fehlern:** Richtige Taste blinkt als Hinweis

---

## 🤖 KI-Notenerkennung (OMR)

### Basic-OMR (immer verfügbar)
- Klassische Computer-Vision
- Robust für saubere Drucke
- Keine Installation nötig
- ~70-80% Genauigkeit

### Advanced-OMR (TFLite)
- TensorFlow Lite Modelle (offline)
- ~8 MB Download (einmalig pro Profil)
- ~90-95% Genauigkeit
- Handschrift-Support (in Entwicklung)

### Download-Prozess
1. App fragt: "KI-Paket installieren?"
2. Ein Klick → Download startet
3. **Fortschritt:** Prozent + ETA in Echtzeit
4. **Quelle:** Standard-Server oder LAN-URL (konfigurierbar)
5. **Speicherort:** `files/profiles/<id>/models/`

---

## 💾 Datenschutz & Offline-First

### Keine Cloud, keine Registrierung
- **Alle Daten lokal** auf dem Android-Gerät
- **Keine Internetverbindung** für Kernfunktionen nötig
- **Optional:** Download von KI-Modellen & Add-ons

### Datenstruktur
```
files/
 └─ profiles/
    └─ <ProfileId>/
       ├─ calibration_profile.andioCalib.json  # Ton-Mapping
       ├─ automap_meta.json                    # LED-Anzahl & Reihenfolge
       ├─ models/                              # KI-Modelle (optional)
       │  ├─ omr_symbols.tflite
       │  └─ omr_staff.tflite
       ├─ lyrics/                              # Song-Texte (optional)
       └─ user_prefs.json                      # Helligkeit, Themes, etc.
```

### Nutzer-Uploads
- Nutzer ist verantwortlich für importierte Inhalte
- AGB beim ersten Start zu akzeptieren
- Vorinstalliert: nur Public Domain

---

## 🎨 Add-ons & Themes

### Typen
- **APP_THEME:** UI-Farben (z.B. Neon, Minimal, Dark)
- **KARAOKE_SKIN:** Visueller Stil für Lernen (z.B. Retro, Modern)
- **LED_SEQUENCE:** LED-Animationen (z.B. Rainbow, Pulse)
- **SCORING_PRESET:** Bewertungssysteme (z.B. Strict, Casual)

### Installation
- Download als `.zip` (keine Code-Ausführung!)
- **Transparenz:** Fortschritt + ETA bei jedem Download
- Verwaltung in: Settings → Add-ons

### Themes zurücksetzen
Settings → Allgemein → "Theme zurücksetzen" → Standard Andio-Farben (Anthrazit/Rot/Weiß)

---

## 🔧 Entwicklung & Erweiterung

### Technologien
- **App:** React Native (Android, iOS geplant)
- **Arduino:** C++ mit FastLED-Bibliothek
- **KI:** TensorFlow Lite (on-device)
- **Dateiformate:** MusicXML, MIDI, JSON

### Kommunikations-Protokoll
```
App → Arduino:
  CFG BRIGHT=<0-255> LEN_W=<n> LEN_B=<m>  # Konfiguration
  N <midi> <state>                        # Note setzen (0-5)
  C                                       # Clear all
  PAUSE on|off                            # Pause
  HINT <midi>                             # Taste blinken

Arduino → App:
  ANDIO_READY     # Startup
  OK_CFG / OK_N   # Bestätigungen
  ERR_...         # Fehler
```

**Vollständige Referenz:** `arduino/README.md`

### Eigene Features hinzufügen
1. **Neue LED-Animationen:** `LEDController.js` erweitern
2. **Custom Scoring:** `ScoringEngine.js` anpassen
3. **Neue Themes:** Add-on als `.zip` packen (Assets + `theme.json`)
4. **OMR-Verbesserungen:** `OMREngine.js` trainieren

---

## 🗺️ Roadmap

### v3.7 (Q2 2025)
- [ ] iOS-App (React Native)
- [ ] Web-Version (Bluetooth Web API)
- [ ] Erweiterte Statistiken (Progress-Tracking)

### v3.8 (Q3 2025)
- [ ] Polyphone OMR (Mehrstimmigkeit)
- [ ] Handschrift-Support (Advanced-OMR)
- [ ] LRC-Lyrics-Sync (Echtzeit-Texte)

### v4.0 (Q4 2025)
- [ ] Multiplayer-Modus (LAN)
- [ ] Add-on-Store im Heimnetz
- [ ] QR-Code-Sync zwischen Geräten
- [ ] Spiele-Modus (Noten-Tetris, Rhythm-Challenges)

---

## 📝 Lizenz & Nutzung

### Open Source
- **Code:** MIT-Lizenz (Arduino + App)
- **Hardware:** Open Hardware (Schaltpläne frei verfügbar)
- **Songs:** Nur Public Domain vorinstalliert

### Kommerzielle Nutzung
- **Erlaubt** für private & gewerbliche Zwecke
- **Bedingung:** Quellenangabe "Powered by ANDIO PIANO"
- **Verkauf von Komplettsets:** Kontaktiere uns für Partnership

---

## 🆘 Support & Community

### Hilfe bekommen
1. **Dokumentation:** Lies `arduino/README.md` und `docs/`
2. **FAQ:** [andio-piano.com/faq](https://andio-piano.com/faq) (Beispiel)
3. **Issues:** GitHub Issues für Bugs & Feature-Requests
4. **E-Mail:** support@andio-piano.com (Beispiel)

### Beitragen
- **Pull Requests** willkommen!
- **Neue Songs:** Public Domain MusicXML einsenden
- **Übersetzungen:** Sprachdateien in `app/locales/`
- **Hardware-Varianten:** Teile deine Builds (Forum)

---

## 👥 Credits

**Konzept & Entwicklung:** Andi  
**Hardware-Design:** Andi  
**App-Entwicklung:** Andi  
**Arduino-Code:** Andi  
**Dokumentation:** Andi  

**Bibliotheken:**
- FastLED (Daniel Garcia)
- TensorFlow Lite (Google)
- React Native (Meta)

**Community:**
- Danke an alle Tester & Contributors!
- Besonderer Dank an die Open-Source-Community

---

## 📧 Kontakt

- **Website:** [andio-piano.com](https://andio-piano.com) (Beispiel)
- **GitHub:** [github.com/andio-piano](https://github.com/andio-piano) (Beispiel)
- **Discord:** [discord.gg/andio](https://discord.gg/andio) (Beispiel)
- **E-Mail:** hello@andio-piano.com (Beispiel)

---

**Made with ❤️ for musicians everywhere**

© 2025 ANDIO - Open Hardware & Software Project