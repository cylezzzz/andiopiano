import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StatusBar } from 'react-native';
import { Div } from '../ui/layout';
import { H1, H2, P, Span } from '../ui/typography';
import { Camera, Music, Settings, BookOpen, Download, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Image } from "react-native";
import logo from "../../assets/images/logo.png";

type Profile = {
  id: string;
  name: string;
  created: string;
  calibrated: boolean;
  automapped: boolean;
  whiteKeys: number;
  blackKeys: number;
  aiInstalled: boolean;
};

const AndioApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'profiles' | 'main' | 'settings' | 'scan' | 'karaoke' | 'calibration' | 'library'>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ file: string; percent: number; eta: string } | null>(null);
  const [arduinoConnected, setArduinoConnected] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const stored = await (window as any).storage.list('profile:', false);
      if (stored?.keys) {
        const profileData: Profile[] = [];
        for (const key of stored.keys) {
          const data = await (window as any).storage.get(key, false);
          if (data?.value) profileData.push(JSON.parse(data.value));
        }
        setProfiles(profileData);
      }
    } catch {
      setProfiles([]);
    }
  };

  const createProfile = async (name: string) => {
    const newProfile: Profile = {
      id: `prof_${Date.now()}`,
      name,
      created: new Date().toISOString(),
      calibrated: false,
      automapped: false,
      whiteKeys: 0,
      blackKeys: 0,
      aiInstalled: false,
    };
    await (window as any).storage.set(`profile:${newProfile.id}`, JSON.stringify(newProfile), false);
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfile(newProfile);
    setCurrentScreen('main');
  };

  const installAI = async (profileId: string) => {
    setDownloadProgress({ file: 'omr_symbols.tflite', percent: 0, eta: '...' });
    for (let i = 0; i <= 100; i += 5) {
      // simuliertes Download-Progress
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 100));
      const eta = Math.max(0, Math.round((100 - i) * 0.1));
      setDownloadProgress({ file: 'omr_symbols.tflite', percent: i, eta: `${eta}s` });
    }
    const prof = profiles.find(p => p.id === profileId);
    if (prof) {
      prof.aiInstalled = true;
      await (window as any).storage.set(`profile:${prof.id}`, JSON.stringify(prof), false);
      setProfiles([...profiles]);
    }
    setDownloadProgress(null);
  };

  const ProfileScreen: React.FC = () => (
    <Div style={{ flex: 1, padding: 16 }}>
      <StatusBar barStyle="light-content" />
      <Div style={{ marginBottom: 16 }}>
        <H1>🎹 ANDIO PIANO</H1>
        <P>Intelligentes LED-Lernsystem v3.6</P>
      </Div>

      <Div style={{ marginBottom: 12 }}>
        <H2>Profile</H2>

        {profiles.length === 0 && (
          <Div style={{ paddingVertical: 8 }}>
            <P>Noch keine Profile vorhanden</P>
          </Div>
        )}

        <Div>
          {profiles.map(prof => (
            <TouchableOpacity
              key={prof.id}
              onPress={() => {
                setActiveProfile(prof);
                setCurrentScreen('main');
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: '#1f1f1f',
                marginBottom: 8,
              }}
            >
              <Div>
                <Div style={{ marginBottom: 6 }}>
                  <H2>{prof.name}</H2>
                  <Div style={{ flexDirection: 'row', gap: 12 }}>
                    {prof.calibrated ? (
                      <Span><CheckCircle size={14} /> Kalibriert</Span>
                    ) : (
                      <Span><AlertCircle size={14} /> Nicht kalibriert</Span>
                    )}
                    {prof.aiInstalled && (
                      <Span><Zap size={14} /> KI aktiv</Span>
                    )}
                  </Div>
                </Div>

                {(prof.whiteKeys > 0 || prof.blackKeys > 0) && (
                  <Div>
                    <Span>{prof.whiteKeys} weiße</Span>
                    <Span> · {prof.blackKeys} schwarze</Span>
                  </Div>
                )}
              </Div>
            </TouchableOpacity>
          ))}
        </Div>

        <TouchableOpacity
          onPress={() => {
            const name = (typeof prompt !== 'undefined') ? prompt('Profilname:') : 'Profil';
            if (name) createProfile(name);
          }}
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            backgroundColor: '#2a2a2a',
            alignItems: 'center',
          }}
        >
          <P>+ Neues Profil erstellen</P>
        </TouchableOpacity>
      </Div>

      <Div>
        <Span>Keine Registrierung · Keine Cloud · Offline</Span>
      </Div>
    </Div>
  );

  const MainScreen: React.FC = () => (
    <Div style={{ flex: 1, padding: 16 }}>
      <StatusBar barStyle="light-content" />
      <Div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Div>
          <H1>🎹 ANDIO PIANO</H1>
          <P>{activeProfile?.name}</P>
        </Div>
        <TouchableOpacity
          onPress={() => setCurrentScreen('settings')}
          style={{ padding: 8 }}
        >
          <Settings size={24} />
        </TouchableOpacity>
      </Div>

      {!activeProfile?.aiInstalled && (
        <Div style={{ backgroundColor: '#1f1f1f', padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <Div style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Div>
              <H2>KI-Paket verfügbar</H2>
              <P>Advanced-OMR für Notenerkennung</P>
            </Div>
            <TouchableOpacity
              onPress={() => installAI(activeProfile!.id)}
              style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#2a2a2a', borderRadius: 8 }}
            >
              <P>Jetzt installieren</P>
            </TouchableOpacity>
          </Div>
        </Div>
      )}

      <Div style={{ gap: 10 }}>
        <MenuCard
          icon={<Camera size={32} />}
          title="Noten scannen"
          desc="Foto aufnehmen oder importieren"
          onPress={() => setCurrentScreen('scan')}
        />
        <MenuCard
          icon={<Music size={32} />}
          title="Karaoke"
          desc="Lieder lernen & üben"
          onPress={() => setCurrentScreen('karaoke')}
        />
        <MenuCard
          icon={<Zap size={32} />}
          title="Kalibrierung"
          desc="Automapping & Tonprofile"
          onPress={() => setCurrentScreen('calibration')}
        />
        <MenuCard
          icon={<BookOpen size={32} />}
          title="Bibliothek"
          desc="Gespeicherte Stücke"
          onPress={() => setCurrentScreen('library')}
        />
      </Div>

      <Div style={{ marginTop: 16 }}>
        <Div style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Span>{arduinoConnected ? 'Arduino verbunden' : 'Arduino nicht verbunden'}</Span>
          <TouchableOpacity
            onPress={() => setArduinoConnected(!arduinoConnected)}
            style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#2a2a2a', borderRadius: 8 }}
          >
            <P>{arduinoConnected ? 'Trennen' : 'Verbinden'}</P>
          </TouchableOpacity>
        </Div>
      </Div>
    </Div>
  );

  const MenuCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; onPress: () => void }> = ({ icon, title, desc, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#1f1f1f',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <Div style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Div>{icon}</Div>
        <Div>
          <H2>{title}</H2>
          <P>{desc}</P>
        </Div>
      </Div>
    </TouchableOpacity>
  );

  // Progress Overlay
  if (downloadProgress) {
    return (
      <Div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Div style={{ backgroundColor: '#1f1f1f', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 }}>
          <Div style={{ alignItems: 'center', marginBottom: 10 }}>
            <Download size={48} />
            <H2>KI-Installation</H2>
            <P>{downloadProgress.file}</P>
          </Div>
          <Div style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Span>{downloadProgress.percent}%</Span>
            <Span>ETA: {downloadProgress.eta}</Span>
          </Div>
          <P>Bitte warten, Download läuft...</P>
        </Div>
      </Div>
    );
  }

  if (!activeProfile || currentScreen === 'profiles') {
    return <ProfileScreen />;
  }

  if (currentScreen === 'settings') {
    // hier würdest du deinen Settings-Screen rendern
    return (
      <Div style={{ flex: 1, padding: 16 }}>
        <H1>Einstellungen</H1>
        <P>Hier kommt dein SettingsPanel hin.</P>
      </Div>
    );
  }

  return <MainScreen />;
};

export default AndioApp;
