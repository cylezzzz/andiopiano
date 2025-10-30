# 🚀 ANDIO PIANO - Quick Setup Guide

**Von Null zum ersten Song in 30 Minuten!**

---

## 📦 Was du brauchst

### Hardware (Mindestanforderungen)
- ✅ **1× Arduino Nano/UNO** (~5-10€)
- ✅ **2× WS2812B LED-Strips** (Anzahl nach deinem Instrument)
- ✅ **1× USB-Kabel** (Arduino ↔ Computer)
- ✅ **1× USB-OTG-Adapter** (Android ↔ Arduino)
- ✅ **1× 5V Netzteil** (2A für bis zu 100 LEDs)
- ✅ **Kabel & Lötzeug** (oder Steckverbinder)

### Software
- ✅ **Arduino IDE** (kostenlos, arduino.cc)
- ✅ **Android-Gerät** (8.0+, USB-OTG fähig)
- ✅ **ANDIO APK** (Download-Link)

---

## ⚡ Setup in 5 Schritten

### Schritt 1: LED-Strips vorbereiten (10 Min)

#### 1.1 Tasten zählen
```
Beispiel 61-Tasten-Keyboard:
- Weiße Tasten: 36
- Schwarze Tasten: 25
```

#### 1.2 Strips zuschneiden/verbinden
```
Weiße Tasten:  36 LEDs in EINER Reihe (links → rechts)
Schwarze Tasten: 25 LEDs in EINER Reihe (links → rechts)
```

**Wichtig:** Achte auf die **Pfeil-Richtung** auf dem Strip (DATA IN → DATA OUT)

#### 1.3 Befestigen
- **Klebestreifen** auf der Rückseite der LEDs nutzen
- **Positionierung:** Direkt hinter/unter den Tasten
- **Abstand:** So nah wie möglich für beste Sichtbarkeit

---

### Schritt 2: Arduino verkabeln (5 Min)

```
VERBINDUNGEN:

LED-Strip Weiß:
  DATA IN  → Arduino Pin D6
  +5V      → Arduino 5V
  GND      → Arduino GND

LED-Strip Schwarz:
  DATA IN  → Arduino Pin D7
  +5V      → Arduino 5V (gemeinsam mit Weiß)
  GND      → Arduino GND (gemeinsam mit Weiß)

Netzteil (optional, bei >50 LEDs):
  +5V      → Arduino VIN (oder direkter Anschluss an LED 5V)
  GND      → Arduino GND
```

**Schaltplan:** Siehe `docs/led_mapping.png`

---

### Schritt 3: Arduino-Code hochladen (5 Min)

#### 3.1 Arduino IDE öffnen
- Starte Arduino IDE
- Gehe zu **Tools → Manage Libraries**
- Suche: `FastLED` → Installieren

#### 3.2 Code anpassen
Öffne `arduino/AndioPiano_LED_Controller.ino` und ändere:

```cpp
// DEINE WERTE HIER EINTRAGEN:
int numWhite = 36;         // Anzahl weiße Tasten
int numBlack = 25;         // Anzahl schwarze Tasten
int ledsPerWhiteKey = 1;   // 1 oder 2 LEDs pro Taste
int ledsPerBlackKey = 1;
```

#### 3.3 Hochladen
1. Arduino per USB an Computer anschließen
2. **Tools → Board:** Arduino Nano/UNO auswählen
3. **Tools → Port:** COM-Port auswählen (meist der einzige)
4. **Sketch → Upload** (oder Strg+U)

#### 3.4 Testen
- Öffne **Tools → Serial Monitor** (Baudrate: 115200)
- Du solltest sehen: `ANDIO_READY`
- Teste: Tippe `TEST` und drücke Enter → LEDs sollten Regenbogen zeigen

**✅ Funktioniert? Weiter zu Schritt 4!**

---

### Schritt 4: Android-App installieren (3 Min)

#### 4.1 APK installieren
1. Lade `AndioPlano_v3.6.apk` herunter
2. Installiere die APK (erlaube "Unbekannte Quellen" wenn nötig)
3. Öffne die App

#### 4.2 Erste Einrichtung
1. **AGB akzeptieren**
2. **Berechtigungen erlauben:**
   - Kamera (für Automapping & Scan)
   - Mikrofon (für Ton-Kalibrierung)
   - Speicher (für Songs & Profile)

---

### Schritt 5: Kalibrierung & Los geht's! (10 Min)

#### 5.1 Arduino verbinden
1. Arduino per **USB-OTG** an Android-Gerät anschließen
2. App zeigt: "Arduino erkannt"
3. Tippe auf **"Verbinden"**

#### 5.2 Profil erstellen
1. **Profil erstellen** → Namen eingeben (z.B. "Mein Keyboard")
2. App fragt: **"Kalibrierungs-Wizard starten?"** → Ja

#### 5.3 Automapping (Kamera)
```
1. Halte Kamera über die Tastatur (alle Tasten sichtbar)
2. App lässt LEDs nacheinander blinken:
   - Erst weiße Tasten (links → rechts)
   - Dann schwarze Tasten (links → rechts)
3. Kamera erfasst automatisch Anzahl & Reihenfolge
```

**Alternativ:** Wähle "Manuelle Eingabe" und trage Zahlen ein

#### 5.4 Ton-Kalibrierung (Mikrofon)
```
1. App sagt: "Spiele Taste 1"
2. Drücke die entsprechende Taste auf dem Instrument
3. Mikrofon misst Frequenz
4. Wiederhole für alle Tasten (dauert ~2-5 Min)
```

**Tipp:** Bei MIDI-Keyboards kann dieser Schritt übersprungen werden

#### 5.5 Fertig!
- **✅ Kalibrierung abgeschlossen**
- App zeigt: "Instrument ist einsatzbereit!"

---

## 🎵 Dein erster Song!

### Option 1: Vorinstallierte Songs
1. Gehe zu **"Bibliothek"**
2. Wähle z.B. "Alle meine Entchen"
3. Tippe **"Spielen"**
4. Folge den **gelben LEDs** → drücke die Tasten

### Option 2: Eigene Noten scannen
1. Gehe zu **"Noten scannen"**
2. **Foto aufnehmen** von deinem Notenblatt
3. App erkennt Noten (Basic-OMR)
4. **"In Karaoke öffnen"** → Los!

---

## 🎮 Karaoke-Modus verstehen

### LED-Farben
- 🟡 **Gelb:** "Jetzt diese Taste drücken!"
- 🟢 **Grün:** Korrekt! Weiter so!
- 🔴 **Rot:** Falsch! (richtige Taste blinkt als Hinweis)
- 🔵 **Blau:** System-Status

### Controls
- ▶️ **Play:** Musik startet
- ⏸️ **Pause:** Bei Fehler oder manuell
- 🔄 **Neustart:** Von vorne beginnen

### Fehler-Hilfe
- Bei falscher Taste: **Musik pausiert automatisch**
- **Richtige Taste blinkt gelb** als Hinweis
- Drücke richtige Taste → Musik läuft weiter

---

## 🔧 Häufige Probleme (Troubleshooting)

### LEDs leuchten nicht
```
✅ Netzteil eingeschaltet?
✅ 5V & GND korrekt verbunden?
✅ LED-Strip richtig herum? (Pfeil beachten!)
✅ Im Serial Monitor "TEST" senden → LEDs sollten reagieren
```

### Arduino verbindet nicht
```
✅ USB-OTG-Adapter funktioniert? (teste mit USB-Stick)
✅ Arduino leuchtet? (Power-LED)
✅ In App: Settings → Verbindung → "USB" ausgewählt?
✅ Andere Apps geschlossen, die Serial-Port nutzen könnten?
```

### Mapping stimmt nicht
```
✅ Automapping erneut durchführen
✅ Prüfe: LED-Strips wirklich von LINKS nach RECHTS?
✅ Schwarze/weiße Strips vertauscht? (Pins D6/D7 prüfen)
```

### KI-Download schlägt fehl
```
✅ Internetverbindung aktiv?
✅ Speicherplatz frei? (mind. 10 MB)
✅ In Settings: LAN-URL korrekt? (oder leer lassen)
```

---

## 💡 Tipps für beste Ergebnisse

### Hardware
- **Kurze Kabel:** Weniger als 2m zwischen Arduino und LEDs
- **Stromversorgung:** Bei >50 LEDs externes Netzteil nutzen
- **LED-Positionierung:** So nah an Tasten wie möglich

### Software
- **Regelmäßig kalibrieren:** Nach Transport oder Umbau
- **KI-Paket installieren:** Für beste Scan-Qualität (Advanced-OMR)
- **Profile nutzen:** Ein Profil pro Instrument

### Lernen
- **Starte langsam:** Nutze "Casual Learning Mode" (Add-on)
- **Übe Abschnitte:** Wiederhole schwierige Takte einzeln
- **Verfolge Fortschritt:** Schau dir Statistiken in der App an

---

## 🎉 Geschafft!

**Du bist jetzt bereit zu lernen!** 🎹

### Nächste Schritte:
1. 📚 Mehr Songs scannen oder importieren
2. 🎨 Themes & Add-ons ausprobieren (Settings → Add-ons)
3. 📊 Statistiken checken (Bibliothek → Details)
4. 🤝 Community beitreten (Discord/Forum)

---

## 📞 Hilfe benötigt?

- **Dokumentation:** `README.md` + `arduino/README.md`
- **Video-Tutorials:** [youtube.com/andio-piano](https://youtube.com) (Beispiel)
- **Support:** support@andio-piano.com (Beispiel)
- **Discord:** [discord.gg/andio](https://discord.gg) (Beispiel)

---

**Viel Erfolg & Spaß beim Lernen! 🎶**

© 2025 ANDIO PIANO