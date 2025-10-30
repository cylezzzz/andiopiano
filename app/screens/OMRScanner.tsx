import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useRef } from 'react';
import { Camera, Upload, Zap, FileText, Download, CheckCircle, Loader } from 'lucide-react';

const OMRScanner = () => {
  const [mode, setMode] = useState('select');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [aiMode, setAiMode] = useState('basic');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Kamera-Zugriff fehlgeschlagen');
      setMode('select');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    processImage(imageData);
    
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      processImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData) => {
    setScanning(true);
    setProgress(0);

    const steps = [
      { name: 'Bildanalyse', duration: 800 },
      { name: 'Notenlinienerkennung', duration: 1200 },
      { name: aiMode === 'advanced' ? 'KI-Symbolerkennung' : 'Klassische Erkennung', duration: 2000 },
      { name: 'MusicXML-Export', duration: 600 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, steps[i].duration));
      setProgress(((i + 1) / steps.length) * 100);
    }

    const mockResult = {
      title: "Erkanntes Musikstück",
      measures: 8,
      notes: 42,
      timeSignature: "4/4",
      key: "C-Dur",
      confidence: aiMode === 'advanced' ? 95 : 78,
      xml: generateMockXML()
    };

    setResult(mockResult);
    setScanning(false);
    setMode('result');

    await window.storage.set(
      `scan_${Date.now()}`,
      JSON.stringify({ ...mockResult, image: imageData.substring(0, 100) }),
      false
    );
  };

  const generateMockXML = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <work><work-title>Erkanntes Stück</work-title></work>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;
  };

  const downloadXML = () => {
    const blob = new Blob([result.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notenblatt.musicxml';
    a.click();
  };

  const SelectMode = () => (
    <Div>
      <Div>
        <H2 >
          Noten scannen oder importieren
        </H2>

        <Div>
          <Div>
            <Span>OMR-Modus:</Span>
            <Div>
              <button
                onClick={() => setAiMode('basic')}
                `}
              >
                Basic
              </button>
              <button
                onClick={() => setAiMode('advanced')}
                `}
              >
                <Zap size={16} /> Advanced KI
              </button>
            </Div>
          </Div>
          <P >
            {aiMode === 'basic' 
              ? 'Klassische Bildverarbeitung (immer verfügbar)'
              : 'TensorFlow Lite On-Device KI (höhere Genauigkeit)'}
          </P>
        </Div>

        <Div>
          <button
            onClick={startCamera}
            
          >
            <Camera size={32} />
            <Span>Foto aufnehmen</Span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            
          >
            <Upload size={32} />
            <Span>Bild hochladen</Span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            
          />

          <button
            onClick={() => {
              const xml = prompt('MusicXML-Inhalt einfügen:');
              if (xml) {
                setResult({
                  title: "Importiertes Stück",
                  measures: 0,
                  notes: 0,
                  xml: xml
                });
                setMode('result');
              }
            }}
            
          >
            <FileText size={32} />
            <Span>MusicXML importieren</Span>
          </button>
        </Div>
      </Div>

      <Div>
        Unterstützt: JPG, PNG, PDF (Einzelseiten), MusicXML
      </Div>
    </Div>
  );

  const CameraMode = () => (
    <Div>
      <Div>
        <H2 >
          <Camera  />
          Notenblatt fotografieren
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
            💡 Tipp: Achte auf gute Beleuchtung und halte die Kamera gerade über dem Notenblatt
          </P>
        </Div>

        <Div>
          <button
            onClick={capturePhoto}
            
          >
            📸 Aufnehmen
          </button>
          <button
            onClick={() => {
              if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
              }
              setMode('select');
            }}
            
          >
            Abbrechen
          </button>
        </Div>
      </Div>
    </Div>
  );

  const ScanningMode = () => (
    <Div>
      <Div>
        <Div>
          <Loader  size={64} />
          <H2 >
            {aiMode === 'advanced' ? 'KI-Analyse läuft...' : 'Verarbeitung läuft...'}
          </H2>
          <P >
            Bitte warten, Noten werden erkannt
          </P>
        </Div>

        <Div>
          <Div>
            <Span>{Math.round(progress)}%</Span>
            <Span>
              {progress < 25 ? 'Bildanalyse...' :
               progress < 50 ? 'Notenlinien...' :
               progress < 90 ? 'Symbole erkennen...' : 'Finalisierung...'}
            </Span>
          </Div>
          <Div>
            <Div>
          </Div>
        </Div>

        {aiMode === 'advanced' && (
          <Div>
            <Zap  size={20} />
            <Span>
              TensorFlow Lite aktiv • On-Device Processing
            </Span>
          </Div>
        )}
      </Div>
    </Div>
  );

  const ResultMode = () => (
    <Div>
      <Div>
        <Div>
          <CheckCircle  size={64} />
          <H2 >Erkennung abgeschlossen!</H2>
        </Div>

        <Div>
          <Div>
            <Span>Titel:</Span>
            <Span>{result.title}</Span>
          </Div>
          {result.measures > 0 && (
            <>
              <Div>
                <Span>Takte:</Span>
                <Span>{result.measures}</Span>
              </Div>
              <Div>
                <Span>Noten:</Span>
                <Span>{result.notes}</Span>
              </Div>
              <Div>
                <Span>Taktart:</Span>
                <Span>{result.timeSignature}</Span>
              </Div>
              <Div>
                <Span>Tonart:</Span>
                <Span>{result.key}</Span>
              </Div>
              <Div>
                <Span>Genauigkeit:</Span>
                <Span> 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.confidence}%
                </Span>
              </Div>
            </>
          )}
        </Div>

        <Div>
          <button
            onClick={downloadXML}
            
          >
            <Download size={20} />
            MusicXML herunterladen
          </button>

          <button
            onClick={() => alert('Öffne in Karaoke-Modus...')}
            
          >
            🎹 In Karaoke öffnen
          </button>

          <button
            onClick={() => {
              setResult(null);
              setMode('select');
            }}
            
          >
            Weiteren Scan starten
          </button>
        </Div>
      </Div>
    </Div>
  );

  return (
    <Div>
      <Div>
        <Div>
          <H1 >📷 Noten-Scanner</H1>
          <P >Optische Notenerkennung (OMR) mit KI-Support</P>
        </Div>

        {mode === 'select' && <SelectMode />}
        {mode === 'camera' && <CameraMode />}
        {scanning && <ScanningMode />}
        {mode === 'result' && result && <ResultMode />}
      </Div>
    </Div>
  );
};

export default OMRScanner;


