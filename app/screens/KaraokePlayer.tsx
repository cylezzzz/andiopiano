import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Award, TrendingUp, Zap } from 'lucide-react';

const KaraokePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [totalBeats, setTotalBeats] = useState(200);
  const [score, setScore] = useState({ correct: 0, wrong: 0, streak: 0, maxStreak: 0 });
  const [currentNote, setCurrentNote] = useState(null);
  const [showError, setShowError] = useState(null);
  const [ledStatus, setLedStatus] = useState({});
  const intervalRef = useRef(null);

  const songData = {
    title: "Alle meine Entchen",
    difficulty: "Einfach",
    notes: [
      { beat: 0, midi: 60, duration: 4, name: "C" },
      { beat: 4, midi: 62, duration: 4, name: "D" },
      { beat: 8, midi: 64, duration: 4, name: "E" },
      { beat: 12, midi: 65, duration: 4, name: "F" },
      { beat: 16, midi: 67, duration: 8, name: "G" },
      { beat: 24, midi: 67, duration: 8, name: "G" },
      { beat: 32, midi: 69, duration: 4, name: "A" },
      { beat: 36, midi: 69, duration: 4, name: "A" },
      { beat: 40, midi: 69, duration: 4, name: "A" },
      { beat: 44, midi: 69, duration: 4, name: "A" },
      { beat: 48, midi: 67, duration: 16, name: "G" }
    ]
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          if (prev >= totalBeats) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 150);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, totalBeats]);

  useEffect(() => {
    const note = songData.notes.find(n => 
      currentBeat >= n.beat && currentBeat < n.beat + n.duration
    );
    
    if (note && note !== currentNote) {
      setCurrentNote(note);
      sendLEDCommand(note.midi, 1);
    } else if (!note && currentNote) {
      setCurrentNote(null);
    }
  }, [currentBeat]);

  const sendLEDCommand = (midi, state) => {
    setLedStatus(prev => ({ ...prev, [midi]: state }));
    console.log(`LED Command: MIDI=${midi} STATE=${state}`);
  };

  const handleKeyPress = (midi) => {
    if (!isPlaying || !currentNote) return;

    if (midi === currentNote.midi) {
      sendLEDCommand(midi, 2);
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        maxStreak: Math.max(prev.maxStreak, prev.streak + 1)
      }));
      setTimeout(() => sendLEDCommand(midi, 0), 300);
    } else {
      sendLEDCommand(midi, 3);
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1, streak: 0 }));
      setShowError({ expected: currentNote.name, played: getMidiName(midi) });
      setIsPlaying(false);
      setTimeout(() => {
        setShowError(null);
        sendLEDCommand(midi, 0);
      }, 2000);
    }
  };

  const getMidiName = (midi) => {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return names[midi % 12];
  };

  const NoteDisplay = () => (
    <Div>
      <Div>
        <Div>
          <H2 >{songData.title}</H2>
          <P >Schwierigkeit: {songData.difficulty}</P>
        </Div>
        <Div>
          <Div>
            {Math.round((currentBeat / totalBeats) * 100)}%
          </Div>
          <Div>Fortschritt</Div>
        </Div>
      </Div>

      <Div>
        <Div>
          <Div>
            <Div>
            {songData.notes.map((note, i) => {
              const position = ((note.beat - currentBeat + 20) / 40) * 100;
              if (position < 0 || position > 100) return null;
              
              return (
                <Div>
                  <Div>
                    {note.name}
                  </Div>
                </Div>
              );
            })}
          </Div>
        </Div>
      </Div>

      {currentNote && (
        <Div>
          <Div>
            {currentNote.name}
          </Div>
          <Div>Jetzt spielen!</Div>
        </Div>
      )}
    </Div>
  );

  const ScorePanel = () => (
    <Div>
      <Div>
        <Div>{score.correct}</Div>
        <Div>Richtig</Div>
      </Div>
      <Div>
        <Div>{score.wrong}</Div>
        <Div>Falsch</Div>
      </Div>
      <Div>
        <Div>{score.streak}</Div>
        <Div>Streak</Div>
      </Div>
      <Div>
        <Div>{score.maxStreak}</Div>
        <Div>Rekord</Div>
      </Div>
    </Div>
  );

  const VirtualKeyboard = () => {
    const whiteKeys = [60, 62, 64, 65, 67, 69, 71, 72];
    const blackKeys = [61, 63, null, 66, 68, 70, null];

    return (
      <Div>
        <h3 >Virtuelle Tastatur (Test)</h3>
        <Div>
          <Div>
            {whiteKeys.map((midi, i) => (
              <button
                key={i}
                onClick={() => handleKeyPress(midi)}
                
                `}
              >
                <Div>
                  {getMidiName(midi)}
                </Div>
              </button>
            ))}
          </Div>
          <Div>
            {blackKeys.map((midi, i) => 
              midi ? (
                <button
                  key={i}
                  onClick={() => handleKeyPress(midi)}
                  
                  `}
                />
              ) : <Div>
            )}
          </Div>
        </Div>
      </Div>
    );
  };

  return (
    <Div>
      <Div>
        <Div>
          <H1 >🎹 Karaoke-Modus</H1>
          <P >Lerne Schritt für Schritt mit LED-Feedback</P>
        </Div>

        <ScorePanel />
        <NoteDisplay />
        
        <Div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            
              text-white
            `}
          >
            {isPlaying ? <><Pause size={24} /> Pause</> : <><Play size={24} /> Start</>}
          </button>
          <button
            onClick={() => {
              setCurrentBeat(0);
              setScore({ correct: 0, wrong: 0, streak: 0, maxStreak: 0 });
            }}
            
          >
            <SkipForward size={24} /> Neustart
          </button>
        </Div>

        <VirtualKeyboard />

        {showError && (
          <Div>
            <Div>
              <Div>❌</Div>
              <H2 >Falsche Taste!</H2>
              <P >
                Erwartet: <Span>{showError.expected}</Span>
              </P>
              <P >
                Gespielt: <Span>{showError.played}</Span>
              </P>
              <Div>
                Pause... gleich geht's weiter
              </Div>
            </Div>
          </Div>
        )}

        {currentBeat >= totalBeats && (
          <Div>
            <Div>
              <Award  size={80} />
              <H2 >Gratulation!</H2>
              <Div>
                <P >
                  {score.correct} richtige Töne
                </P>
                <P >
                  {score.wrong} Fehler
                </P>
                <P >
                  Beste Streak: {score.maxStreak}
                </P>
              </Div>
              <button
                onClick={() => window.location.reload()}
                
              >
                Zurück zum Menü
              </button>
            </Div>
          </Div>
        )}
      </Div>
    </Div>
  );
};

export default KaraokePlayer;


