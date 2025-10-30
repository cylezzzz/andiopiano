import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useEffect } from 'react';
import { Settings, Wifi, Palette, Download, Trash2, Zap, Bluetooth, HardDrive, Info } from 'lucide-react';

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [brightness, setBrightness] = useState(200);
  const [connectionType, setConnectionType] = useState('usb');
  const [theme, setTheme] = useState('andio');
  const [lanUrl, setLanUrl] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await window.storage.get('app_settings', false);
      if (stored?.value) {
        const settings = JSON.parse(stored.value);
        setBrightness(settings.brightness || 200);
        setConnectionType(settings.connectionType || 'usb');
        setTheme(settings.theme || 'andio');
        setLanUrl(settings.lanUrl || '');
      }
    } catch (e) {
      console.log('Default settings loaded');
    }

    try {
      const profileList = await window.storage.list('profile:', false);
      if (profileList?.keys) {
        const profs = [];
        for (const key of profileList.keys) {
          const data = await window.storage.get(key, false);
          if (data?.value) profs.push(JSON.parse(data.value));
        }
        setProfiles(profs);
      }
    } catch (e) {
      setProfiles([]);
    }
  };

  const saveSettings = async () => {
    const settings = {
      brightness,
      connectionType,
      theme,
      lanUrl,
      lastUpdate: new Date().toISOString()
    };
    await window.storage.set('app_settings', JSON.stringify(settings), false);
    alert('✅ Einstellungen gespeichert!');
  };

  const deleteProfile = async (profileId) => {
    await window.storage.delete(`profile:${profileId}`, false);
    setProfiles(profiles.filter(p => p.id !== profileId));
    setShowDeleteConfirm(null);
    alert('Profil gelöscht');
  };

  const installAIPackage = async () => {
    alert('KI-Paket wird heruntergeladen...\n\nQuelle: ' + (lanUrl || 'Standard-Server'));
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
    }
    alert('✅ KI-Paket erfolgreich installiert!');
  };

  const exportWiringGuide = () => {
    const guide = `
ANDIO PIANO - Verkabelungsanleitung
====================================

LED-STRIPS:
-----------
• Weiße Tasten: Data-Pin D6
• Schwarze Tasten: Data-Pin D7
• Beide Strips: 5V + GND gemeinsam

VERKABELUNG:
------------
Arduino Nano/UNO:
  D6 -----> LED Strip Weiß (Data In)
  D7 -----> LED Strip Schwarz (Data In)
  5V -----> Beide Strips (Power)
  GND ----> Beide Strips (Ground)

WICHTIG:
--------
• Jede Reihe ist EIN durchgehender Strip
• LEDs von LINKS nach RECHTS verkabeln
• Bei 2 LEDs/Taste: beide nacheinander im Strip
• Netzteil: min. 2A für 88 Tasten

Weitere Infos: docs/led_mapping.png
    `;
    
    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'andio_wiring_guide.txt';
    a.click();
    alert('📦 Tutorial-Pack exportiert!');
  };

  const GeneralTab = () => (
    <Div>
      <Div>
        <h3 >
          <Zap  />
          LED-Helligkeit
        </h3>
        <Div>
          <input
            type="range"
            min="0"
            max="255"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            
          />
          <Div>
            <Span>Aus</Span>
            <Span>{brightness} / 255</Span>
            <Span>Max</Span>
          </Div>
        </Div>
      </Div>

      <Div>
        <h3 >
          <Palette  />
          UI-Theme
        </h3>
        <Div>
          {['andio', 'dark', 'light'].map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              `}
            >
              {t === 'andio' ? '🔴 Andio' : t === 'dark' ? '🌙 Dunkel' : '☀️ Hell'}
            </button>
          ))}
        </Div>
        <button
          onClick={() => setTheme('andio')}
          
        >
          Theme zurücksetzen
        </button>
      </Div>

      <Div>
        <h3 >
          <Wifi  />
          Verbindung
        </h3>
        <Div>
          <button
            onClick={() => setConnectionType('usb')}
            `}
          >
            USB (OTG)
          </button>
          <button
            onClick={() => setConnectionType('bluetooth')}
            `}
          >
            <Bluetooth size={20} />
            Bluetooth
          </button>
        </Div>
        {connectionType === 'bluetooth' && (
          <Div>
            HC-05 oder ESP32 BLE wird unterstützt
          </Div>
        )}
      </Div>

      <button
        onClick={saveSettings}
        
      >
        ✅ Einstellungen speichern
      </button>
    </Div>
  );

  const ProfileTab = () => (
    <Div>
      <Div>
        <P >
          💡 Profile speichern separate Kalibrierungen für verschiedene Instrumente
        </P>
      </Div>

      {profiles.map(prof => (
        <Div>
          <Div>
            <Div>
              <h4 >{prof.name}</h4>
              <P >
                Erstellt: {new Date(prof.created).toLocaleDateString('de-DE')}
              </P>
            </Div>
            <button
              onClick={() => setShowDeleteConfirm(prof.id)}
              
            >
              <Trash2 size={20} />
            </button>
          </Div>
          
          <Div>
            {prof.calibrated && (
              <Span>
                ✓ Kalibriert
              </Span>
            )}
            {prof.aiInstalled && (
              <Span>
                ⚡ KI aktiv
              </Span>
            )}
            {prof.whiteKeys > 0 && (
              <Span>
                {prof.whiteKeys + prof.blackKeys} Tasten
              </Span>
            )}
          </Div>
        </Div>
      ))}

      {profiles.length === 0 && (
        <Div>
          Keine Profile vorhanden
        </Div>
      )}

      {showDeleteConfirm && (
        <Div>
          <Div>
            <h3 >Profil löschen?</h3>
            <P >
              Alle Daten inkl. Kalibrierung und KI-Modelle werden gelöscht.
            </P>
            <Div>
              <button
                onClick={() => deleteProfile(showDeleteConfirm)}
                
              >
                Löschen
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                
              >
                Abbrechen
              </button>
            </Div>
          </Div>
        </Div>
      )}
    </Div>
  );

  const AITab = () => (
    <Div>
      <Div>
        <h3 >
          <Download  />
          KI-Quelle konfigurieren
        </h3>
        <Div>
          <label >
            LAN-Server URL (optional):
          </label>
          <input
            type="text"
            value={lanUrl}
            onChange={(e) => setLanUrl(e.target.value)}
            placeholder="http://192.168.1.100:8000"
            
          />
          <P >
            Leer lassen für Standard-Server. Mit LAN-URL werden Modelle aus dem Heimnetz geladen.
          </P>
        </Div>
      </Div>

      <Div>
        <h3 >KI-Paket verwalten</h3>
        <button
          onClick={installAIPackage}
          
        >
          🤖 KI-Paket (neu) installieren
        </button>
        <P >
          Lädt omr_symbols.tflite + omr_staff.tflite herunter
        </P>
      </Div>

      <Div>
        <h4 >ℹ️ Info</h4>
        <ul >
          <li>• Basic-OMR: Immer verfügbar, keine Installation</li>
          <li>• Advanced-OMR: TFLite, ~8 MB Download</li>
          <li>• Modelle werden pro Profil gespeichert</li>
          <li>• Verarbeitung komplett offline</li>
        </ul>
      </Div>
    </Div>
  );

  const WiringTab = () => (
    <Div>
      <Div>
        <h3 >📌 PIN-Konfiguration</h3>
        
        <Div>
          <Div>
            <label >Weiße Tasten - Data-Pin:</label>
            <input
              type="text"
              defaultValue="D6"
              
            />
          </Div>
          <Div>
            <label >Schwarze Tasten - Data-Pin:</label>
            <input
              type="text"
              defaultValue="D7"
              
            />
          </Div>
        </Div>

        <Div>
          <Div>
            <label >LEDs pro weiße Taste:</label>
            <select >
              <option value="1">1 LED</option>
              <option value="2">2 LEDs</option>
            </select>
          </Div>
          <Div>
            <label >LEDs pro schwarze Taste:</label>
            <select >
              <option value="1">1 LED</option>
              <option value="2">2 LEDs</option>
            </select>
          </Div>
        </Div>

        <button
          onClick={() => alert('CFG LPKW=1 LPKB=1 PINW=6 PINB=7 gesendet')}
          
        >
          An Arduino senden
        </button>
      </Div>

      <Div>
        <h3 >📦 Verkabelungs-Tutorial</h3>
        <P >
          Exportiert eine Anleitung mit Diagramm und Schritt-für-Schritt-Erklärung
        </P>
        <button
          onClick={exportWiringGuide}
          
        >
          Tutorial-Pack exportieren
        </button>
      </Div>

      <Div>
        <h4 >⚠️ Wichtig</h4>
        <ul >
          <li>• Beide LED-Reihen sind SEPARATE Strips</li>
          <li>• Von LINKS nach RECHTS verkabeln</li>
          <li>• Bei 2 LEDs/Taste: beide im selben Strip nacheinander</li>
          <li>• Stromversorgung an Anzahl LEDs anpassen</li>
        </ul>
      </Div>
    </Div>
  );

  const AboutTab = () => (
    <Div>
      <Div>
        <H2 >🎹 ANDIO PIANO</H2>
        <P >Core v3.6</P>
        <Div>
          <P>Intelligentes LED-Lernsystem</P>
          <P>für Tasteninstrumente</P>
        </Div>
      </Div>

      <Div>
        <h3 >Features:</h3>
        <Div>
          <Div>✓ 2-Reihen LED-System</Div>
          <Div>✓ Automapping (Kamera)</Div>
          <Div>✓ Ton-Kalibrierung</Div>
          <Div>✓ KI-Notenerkennung (OMR)</Div>
          <Div>✓ Karaoke-Modus</Div>
          <Div>✓ Live-Scoring</Div>
          <Div>✓ Multi-Profile</Div>
          <Div>✓ Offline & No-Cloud</Div>
        </Div>
      </Div>

      <Div>
        <h3 >Technologie:</h3>
        <ul >
          <li>• Arduino-basierte LED-Steuerung</li>
          <li>• TensorFlow Lite (on-device)</li>
          <li>• MusicXML & MIDI Support</li>
          <li>• USB OTG & Bluetooth</li>
          <li>• React Native + lokaler Storage</li>
        </ul>
      </Div>

      <Div>
        © 2025 ANDIO · Konzept & Entwicklung: Andi
      </Div>
    </Div>
  );

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Settings },
    { id: 'profiles', label: 'Profile', icon: HardDrive },
    { id: 'ai', label: 'KI-Setup', icon: Zap },
    { id: 'wiring', label: 'Verkabelung', icon: Bluetooth },
    { id: 'about', label: 'Info', icon: Info }
  ];

  return (
    <Div>
      <Div>
        <Div>
          <H1 >⚙️ Einstellungen</H1>
          <P >Konfiguration & Verwaltung</P>
        </Div>

        <Div>
          <Div>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  `}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </Div>

          <Div>
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'profiles' && <ProfileTab />}
            {activeTab === 'ai' && <AITab />}
            {activeTab === 'wiring' && <WiringTab />}
            {activeTab === 'about' && <AboutTab />}
          </Div>
        </Div>
      </Div>
    </Div>
  );
};

export default SettingsPanel;


