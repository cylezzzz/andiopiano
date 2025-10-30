/*
 * ANDIO PIANO - Arduino LED Controller v3.6
 * 
 * Unterstützt 2 separate LED-Strips (weiße + schwarze Tasten)
 * Kommunikation über USB Serial oder Bluetooth
 * 
 * Hardware: Arduino Nano/UNO/Mega oder ESP32
 * LED-Typ: WS2812B/NeoPixel kompatibel
 */

#include <FastLED.h>

// ===== KONFIGURATION =====
#define PIN_WHITE 6        // Data-Pin für weiße Tasten
#define PIN_BLACK 7        // Data-Pin für schwarze Tasten
#define MAX_LEDS 200       // Maximum LEDs pro Strip
#define BAUDRATE 115200    // Serial Baudrate

// LED-Arrays
CRGB ledsWhite[MAX_LEDS];
CRGB ledsBlack[MAX_LEDS];

// Aktuelle Konfiguration
int numWhite = 88;         // Anzahl weiße Tasten
int numBlack = 36;         // Anzahl schwarze Tasten
int ledsPerWhiteKey = 1;   // LEDs pro weiße Taste
int ledsPerBlackKey = 1;   // LEDs pro schwarze Taste
uint8_t brightness = 200;  // Global 0-255
bool isPaused = false;

// Farbdefinitionen (Standard Andio)
const CRGB COLOR_OFF = CRGB::Black;
const CRGB COLOR_YELLOW = CRGB(255, 200, 0);   // Voranzeige
const CRGB COLOR_GREEN = CRGB(0, 255, 0);      // Korrekt
const CRGB COLOR_RED = CRGB(255, 0, 0);        // Falsch
const CRGB COLOR_BLUE = CRGB(0, 100, 255);     // System
const CRGB COLOR_CYAN = CRGB(0, 255, 255);     // Kalibrier-Marker

// MIDI-Mapping (C0 = 12, C1 = 24, C4 = 60, etc.)
// Weiße Tasten: MIDI 21-108 (A0-C8)
// Schwarze Tasten: dazwischen

void setup() {
  Serial.begin(BAUDRATE);
  
  // LED-Strips initialisieren
  FastLED.addLeds<WS2812B, PIN_WHITE, GRB>(ledsWhite, MAX_LEDS);
  FastLED.addLeds<WS2812B, PIN_BLACK, GRB>(ledsBlack, MAX_LEDS);
  FastLED.setBrightness(brightness);
  
  // Startup-Sequenz
  startupAnimation();
  
  Serial.println("ANDIO_READY");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    processCommand(cmd);
  }
  
  // Periodic refresh
  FastLED.show();
  delay(10);
}

void processCommand(String cmd) {
  // CFG BRIGHT=<0-255> LEN_W=<n> LEN_B=<m> LPKW=<1|2> LPKB=<1|2> PINW=<pin> PINB=<pin>
  if (cmd.startsWith("CFG")) {
    parseConfig(cmd);
    Serial.println("OK_CFG");
  }
  
  // N <midi> <state>
  // state: 0=off, 1=yellow, 2=green, 3=red, 4=blue, 5=cyan
  else if (cmd.startsWith("N ")) {
    int midi = cmd.substring(2, cmd.indexOf(' ', 2)).toInt();
    int state = cmd.substring(cmd.lastIndexOf(' ') + 1).toInt();
    setNote(midi, state);
    Serial.println("OK_N");
  }
  
  // C - Clear all
  else if (cmd == "C") {
    clearAll();
    Serial.println("OK_C");
  }
  
  // PAUSE on|off
  else if (cmd.startsWith("PAUSE")) {
    isPaused = cmd.endsWith("on");
    Serial.println(isPaused ? "OK_PAUSE_ON" : "OK_PAUSE_OFF");
  }
  
  // HINT <midi> - Blink hint for wrong note
  else if (cmd.startsWith("HINT")) {
    int midi = cmd.substring(5).toInt();
    blinkHint(midi);
    Serial.println("OK_HINT");
  }
  
  // TEST - Testsequenz
  else if (cmd == "TEST") {
    testSequence();
    Serial.println("OK_TEST");
  }
  
  else {
    Serial.println("ERR_UNKNOWN_CMD");
  }
}

void parseConfig(String cmd) {
  // Parse alle Parameter
  int idx;
  
  if ((idx = cmd.indexOf("BRIGHT=")) != -1) {
    brightness = cmd.substring(idx + 7, cmd.indexOf(' ', idx)).toInt();
    FastLED.setBrightness(brightness);
  }
  
  if ((idx = cmd.indexOf("LEN_W=")) != -1) {
    numWhite = cmd.substring(idx + 6, cmd.indexOf(' ', idx)).toInt();
  }
  
  if ((idx = cmd.indexOf("LEN_B=")) != -1) {
    numBlack = cmd.substring(idx + 6, cmd.indexOf(' ', idx)).toInt();
  }
  
  if ((idx = cmd.indexOf("LPKW=")) != -1) {
    ledsPerWhiteKey = cmd.substring(idx + 5, cmd.indexOf(' ', idx)).toInt();
  }
  
  if ((idx = cmd.indexOf("LPKB=")) != -1) {
    ledsPerBlackKey = cmd.substring(idx + 5, cmd.indexOf(' ', idx)).toInt();
  }
}

void setNote(int midi, int state) {
  if (isPaused && state != 4) return; // Bei Pause nur System-Commands
  
  // Bestimme ob weiß oder schwarz (vereinfacht)
  bool isBlack = isBlackKey(midi);
  int ledIndex = midiToLedIndex(midi, isBlack);
  
  CRGB color;
  switch (state) {
    case 0: color = COLOR_OFF; break;
    case 1: color = COLOR_YELLOW; break;
    case 2: color = COLOR_GREEN; break;
    case 3: color = COLOR_RED; break;
    case 4: color = COLOR_BLUE; break;
    case 5: color = COLOR_CYAN; break;
    default: color = COLOR_OFF;
  }
  
  if (isBlack) {
    for (int i = 0; i < ledsPerBlackKey && ledIndex + i < MAX_LEDS; i++) {
      ledsBlack[ledIndex + i] = color;
    }
  } else {
    for (int i = 0; i < ledsPerWhiteKey && ledIndex + i < MAX_LEDS; i++) {
      ledsWhite[ledIndex + i] = color;
    }
  }
}

bool isBlackKey(int midi) {
  // MIDI-Noten: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
  int note = midi % 12;
  return (note == 1 || note == 3 || note == 6 || note == 8 || note == 10);
}

int midiToLedIndex(int midi, bool isBlack) {
  // Vereinfachtes Mapping (ab A0 = MIDI 21)
  if (isBlack) {
    // Schwarze Tasten: 5 pro Oktave, Start bei C# (MIDI 13, 25, 37...)
    int octave = (midi - 13) / 12;
    int noteInOctave = (midi - 13) % 12;
    
    // Mapping innerhalb Oktave: C#=0, D#=1, F#=2, G#=3, A#=4
    int blackIndex = 0;
    if (noteInOctave == 1) blackIndex = 0;      // C#
    else if (noteInOctave == 3) blackIndex = 1; // D#
    else if (noteInOctave == 6) blackIndex = 2; // F#
    else if (noteInOctave == 8) blackIndex = 3; // G#
    else if (noteInOctave == 10) blackIndex = 4;// A#
    
    return (octave * 5 + blackIndex) * ledsPerBlackKey;
  } else {
    // Weiße Tasten: 7 pro Oktave
    int octave = (midi - 12) / 12;
    int noteInOctave = (midi - 12) % 12;
    
    // C=0, D=1, E=2, F=3, G=4, A=5, B=6
    int whiteIndex = 0;
    if (noteInOctave == 0) whiteIndex = 0;
    else if (noteInOctave == 2) whiteIndex = 1;
    else if (noteInOctave == 4) whiteIndex = 2;
    else if (noteInOctave == 5) whiteIndex = 3;
    else if (noteInOctave == 7) whiteIndex = 4;
    else if (noteInOctave == 9) whiteIndex = 5;
    else if (noteInOctave == 11) whiteIndex = 6;
    
    return (octave * 7 + whiteIndex) * ledsPerWhiteKey;
  }
}

void clearAll() {
  fill_solid(ledsWhite, MAX_LEDS, CRGB::Black);
  fill_solid(ledsBlack, MAX_LEDS, CRGB::Black);
  FastLED.show();
}

void blinkHint(int midi) {
  // 3x blinken für Hinweis
  for (int i = 0; i < 3; i++) {
    setNote(midi, 1); // Gelb
    FastLED.show();
    delay(200);
    setNote(midi, 0); // Aus
    FastLED.show();
    delay(200);
  }
}

void startupAnimation() {
  // Regenbogen-Sweep
  for (int i = 0; i < numWhite * ledsPerWhiteKey; i++) {
    ledsWhite[i] = CHSV(i * 255 / (numWhite * ledsPerWhiteKey), 255, 255);
    FastLED.show();
    delay(10);
  }
  delay(500);
  clearAll();
  
  // Dreimal blinken weiß
  for (int i = 0; i < 3; i++) {
    fill_solid(ledsWhite, numWhite * ledsPerWhiteKey, CRGB::White);
    fill_solid(ledsBlack, numBlack * ledsPerBlackKey, CRGB::White);
    FastLED.show();
    delay(200);
    clearAll();
    delay(200);
  }
}

void testSequence() {
  // Test: Alle Farben durchlaufen
  const CRGB colors[] = {COLOR_YELLOW, COLOR_GREEN, COLOR_RED, COLOR_BLUE, COLOR_CYAN};
  const int numColors = 5;
  
  for (int c = 0; c < numColors; c++) {
    fill_solid(ledsWhite, numWhite * ledsPerWhiteKey, colors[c]);
    fill_solid(ledsBlack, numBlack * ledsPerBlackKey, colors[c]);
    FastLED.show();
    delay(500);
  }
  
  clearAll();
}

/*
 * PROTOKOLL-BEISPIELE:
 * 
 * App → Arduino:
 * ----------------
 * CFG BRIGHT=200 LEN_W=88 LEN_B=36 LPKW=1 LPKB=1
 * N 60 1        // MIDI 60 (C4) gelb
 * N 60 2        // MIDI 60 grün (korrekt)
 * N 62 3        // MIDI 62 rot (falsch)
 * HINT 60       // Taste 60 blinken
 * C             // Alle LEDs löschen
 * PAUSE on      // Pause aktivieren
 * TEST          // Testsequenz
 * 
 * Arduino → App:
 * ----------------
 * ANDIO_READY   // Beim Start
 * OK_CFG        // Config empfangen
 * OK_N          // Note gesetzt
 * OK_C          // Cleared
 * ERR_UNKNOWN_CMD
 */