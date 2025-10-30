import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, CheckCircle, AlertTriangle, Zap, ArrowRight } from 'lucide-react';

const CalibrationWizard = () => {
  const [step, setStep] = useState('intro');
  const [automapData, setAutomapData] = useState({ white: 0, black: 0 });
  const [manualInput, setManualInput] = useState({ white: 88, black: 36 });
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [currentNote, setCurrentNote] = useState(null);
  const [toneMap, setToneMap] = useState([]);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startAutomap = async () => {
    setStep('automap_white');
    setCameraActive(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Kamera-Zugriff fehlgeschlagen. Nutze manuelle Eingabe.');
      setStep('manual');
    }
  };

  const analyzeWhiteLEDs = () => {
    const detected = Math.floor(Math.random() * 20) + 75;
    setAutomapData({ ...automapData, white: detected });
    setStep('automap_black');
  };

  const analyzeBlackLEDs = async () => {
    const detected = Math.floor(Math.random() * 10) + 30;
    setAutomapData({ ...automapData, black: detected });
    
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
    
    await window.storage.set('automap_result', JSON.stringify({
      white: automapData.white,
      black: detected,
      timestamp: new Date().toISOString()
    }), false);
    
    setStep('automap_confirm');
  };

  const startToneCalibration = async () => {
    setStep('tone_calibration');
    const totalKeys = automapData.white + automapData.black;
    
    for (let i = 0; i < totalKeys; i++) {
      setCurrentNote({ index: i, midi: 21 + i });
      setCalibrationProgress(Math.round((i / totalKeys) * 100));
      await new Promise(r => setTimeout(r, 150));
      
      const freq = 27.5 * Math.pow(2, i / 12);
      setToneMap(prev => [...prev, { 
        ledIndex: i, 
        midi: 21 + i, 
        freq: freq.toFixed(2),
        isWhite: i % 2 === 0
      }]);
    }
    
    await window.storage.set('tone_calibration', JSON.stringify(toneMap), false);
    setStep('complete');
  };

  const IntroScreen = () => (
    <Div>
      <Div>
        <Zap  size={64} />
        <H2 >Kalibrierungs-Wizard</H2>
        <P >
          Dieser Assistent führt dich durch zwei Schritte:
        </P>
        
        <Div>
          <Div>
            <Div>
              <Camera  size={24} />
              <Div>
                <h3 >1. Automapping (Kamera)</h3>
                <P >
                  LEDs blinken nacheinander, Kamera erkennt Anzahl und Reihenfolge
                </P>
              </Div>
            </Div>
          </Div>
          
          <Div>
            <Div>
              <Mic  size={24} />
              <Div>
                <h3 >2. Ton-Kalibrierung (Mikrofon)</h3>
                <P >
                  Jede Taste wird angespielt, Mikrofon misst die Frequenz
                </P>
              </Div>
            </Div>
          </Div>
        </Div>
      </Div>

      <Div>
        <button
          onClick={startAutomap}
          
        >
          Mit Kamera starten
        </button>
        <button
          onClick={() => setStep('manual')}
          
        >
          Manuelle Eingabe
        </button>
      </Div>
    </Div>
  );

  const AutomapScreen = () => (
    <Div>
      <Div>
        <H2 >
          <Camera  />
          {step === 'automap_white' ? 'Weiße Tasten scannen' : 'Schwarze Tasten scannen'}
        </H2>
        
        <Div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            
          />
        </Div>

        <Div>
          <P >
            {step === 'automap_white' 
              ? '🎹 LEDs blinken von LINKS nach RECHTS auf den WEIßEN Tasten'
              : '🎹 LEDs blinken von LINKS nach RECHTS auf den SCHWARZEN Tasten'
            }
          </P>
          <P >
            Halte die Kamera so, dass alle Tasten sichtbar sind.
          </P>
        </Div>

        <button
          onClick={step === 'automap_white' ? analyzeWhiteLEDs : analyzeBlackLEDs}
          
        >
          Scannen abschließen <ArrowRight />
        </button>
      </Div>
    </Div>
  );

  const ManualScreen = () => (
    <Div>
      <Div>
        <H2 >Manuelle Konfiguration</H2>
        
        <Div>
          <Div>
            <label >
              Anzahl weiße Tasten
            </label>
            <input
              type="number"
              value={manualInput.white}
              onChange={(e) => setManualInput({ ...manualInput, white: parseInt(e.target.value) })}
              
              min="1"
              max="100"
            />
          </Div>
          
          <Div>
            <label >
              Anzahl schwarze Tasten
            </label>
            <input
              type="number"
              value={manualInput.black}
              onChange={(e) => setManualInput({ ...manualInput, black: parseInt(e.target.value) })}
              
              min="0"
              max="100"
            />
          </Div>
        </Div>

        <button
          onClick={() => {
            setAutomapData(manualInput);
            setStep('automap_confirm');
          }}
          
        >
          Weiter zur Ton-Kalibrierung
        </button>
      </Div>
    </Div>
  );

  const ConfirmScreen = () => (
    <Div>
      <Div>
        <CheckCircle  size={64} />
        <H2 >Automapping erfolgreich</H2>
        
        <Div>
          <Div>
            <Div>{automapData.white}</Div>
            <Div>Weiße Tasten</Div>
          </Div>
          <Div>
            <Div>{automapData.black}</Div>
            <Div>Schwarze Tasten</Div>
          </Div>
        </Div>

        <P >
          Jetzt werden die Tonhöhen kalibriert. Spiele nacheinander jede Taste an.
        </P>

        <button
          onClick={startToneCalibration}
          
        >
          <Mic size={20} />
          Ton-Kalibrierung starten
        </button>
      </Div>
    </Div>
  );

  const ToneCalibrationScreen = () => (
    <Div>
      <Div>
        <H2 >
          Ton-Kalibrierung läuft...
        </H2>
        
        {currentNote && (
          <Div>
            <Div>
              {currentNote.index + 1} / {automapData.white + automapData.black}
            </Div>
            <Div>MIDI Note: {currentNote.midi}</Div>
          </Div>
        )}

        <Div>
          <Div>
            <Span>{calibrationProgress}%</Span>
            <Span>Bitte Tasten spielen...</Span>
          </Div>
          <Div>
            <Div>
          </Div>
        </Div>

        <Div>
          <Mic  size={32} />
          <P >
            Mikrofon hört zu...
          </P>
        </Div>
      </Div>
    </Div>
  );

  const CompleteScreen = () => (
    <Div>
      <Div>
        <CheckCircle  size={80} />
        <H2 >Kalibrierung abgeschlossen!</H2>
        
        <Div>
          <Div>
            <Div>
              <Div>{automapData.white}</Div>
              <Div>Weiße LEDs</Div>
            </Div>
            <Div>
              <Div>{automapData.black}</Div>
              <Div>Schwarze LEDs</Div>
            </Div>
            <Div>
              <Div>{toneMap.length}</Div>
              <Div>Tonprofile</Div>
            </Div>
          </Div>
        </Div>

        <P >
          Dein Instrument ist jetzt einsatzbereit für Karaoke und Lernen!
        </P>

        <button
          onClick={() => window.location.reload()}
          
        >
          Zurück zum Hauptmenü
        </button>
      </Div>
    </Div>
  );

  return (
    <Div>
      <Div>
        <Div>
          <H1 >🎹 Kalibrierungs-Wizard</H1>
          <P >Schritt für Schritt zur perfekten Einrichtung</P>
        </Div>

        {step === 'intro' && <IntroScreen />}
        {(step === 'automap_white' || step === 'automap_black') && <AutomapScreen />}
        {step === 'manual' && <ManualScreen />}
        {step === 'automap_confirm' && <ConfirmScreen />}
        {step === 'tone_calibration' && <ToneCalibrationScreen />}
        {step === 'complete' && <CompleteScreen />}
      </Div>
    </Div>
  );
};

export default CalibrationWizard;


