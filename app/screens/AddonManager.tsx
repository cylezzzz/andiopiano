import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useEffect } from 'react';
import { Package, Download, CheckCircle, Palette, Zap, Music, TrendingUp } from 'lucide-react';

const AddonManager = () => {
  const [installedAddons, setInstalledAddons] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [progress, setProgress] = useState({ percent: 0, eta: '' });

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    const installed = [];
    const available = [
      {
        id: 'theme_neon',
        name: 'Neon Dreams Theme',
        type: 'APP_THEME',
        description: 'Leuchtende Neon-Farben mit dunklem Hintergrund',
        size: '2.1 MB',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        installed: false
      },
      {
        id: 'theme_minimal',
        name: 'Minimal White Theme',
        type: 'APP_THEME',
        description: 'Klares, minimalistisches Design in Weiß',
        size: '1.8 MB',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        installed: false
      },
      {
        id: 'karaoke_retro',
        name: 'Retro Karaoke Skin',
        type: 'KARAOKE_SKIN',
        description: '80er Jahre Arcade-Style mit Pixel-Effekten',
        size: '3.5 MB',
        preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        installed: false
      },
      {
        id: 'led_rainbow',
        name: 'Rainbow Chase',
        type: 'LED_SEQUENCE',
        description: 'Regenbogen-Animationen für LED-Feedback',
        size: '0.5 MB',
        preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        installed: false
      },
      {
        id: 'scoring_strict',
        name: 'Strict Timing Scoring',
        type: 'SCORING_PRESET',
        description: 'Sehr präzises Timing erforderlich, höhere Punktzahlen',
        size: '0.2 MB',
        preview: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        installed: false
      },
      {
        id: 'scoring_casual',
        name: 'Casual Learning Mode',
        type: 'SCORING_PRESET',
        description: 'Entspanntes Lernen ohne Zeitdruck',
        size: '0.2 MB',
        preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        installed: false
      }
    ];

    try {
      const stored = await window.storage.list('addon:', false);
      if (stored?.keys) {
        for (const key of stored.keys) {
          const data = await window.storage.get(key, false);
          if (data?.value) {
            const addon = JSON.parse(data.value);
            installed.push(addon);
            const idx = available.findIndex(a => a.id === addon.id);
            if (idx !== -1) available[idx].installed = true;
          }
        }
      }
    } catch (e) {
      console.log('No addons installed yet');
    }

    setInstalledAddons(installed);
    setAvailableAddons(available);
  };

  const installAddon = async (addon) => {
    setDownloading(addon.id);
    setProgress({ percent: 0, eta: '...' });

    const totalSize = parseFloat(addon.size);
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 100));
      const percent = (i / steps) * 100;
      const eta = Math.round((steps - i) * 0.1);
      setProgress({ 
        percent: Math.round(percent), 
        eta: eta > 0 ? `${eta}s` : 'Fertig...' 
      });
    }

    const installedAddon = {
      ...addon,
      installed: true,
      installedAt: new Date().toISOString()
    };

    await window.storage.set(`addon:${addon.id}`, JSON.stringify(installedAddon), false);
    
    setInstalledAddons([...installedAddons, installedAddon]);
    setAvailableAddons(availableAddons.map(a => 
      a.id === addon.id ? { ...a, installed: true } : a
    ));
    
    setDownloading(null);
  };

  const uninstallAddon = async (addonId) => {
    await window.storage.delete(`addon:${addonId}`, false);
    setInstalledAddons(installedAddons.filter(a => a.id !== addonId));
    setAvailableAddons(availableAddons.map(a => 
      a.id === addonId ? { ...a, installed: false } : a
    ));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'APP_THEME': return <Palette size={20} />;
      case 'KARAOKE_SKIN': return <Music size={20} />;
      case 'LED_SEQUENCE': return <Zap size={20} />;
      case 'SCORING_PRESET': return <TrendingUp size={20} />;
      default: return <Package size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'APP_THEME': return 'from-purple-600 to-pink-600';
      case 'KARAOKE_SKIN': return 'from-blue-600 to-cyan-600';
      case 'LED_SEQUENCE': return 'from-yellow-600 to-orange-600';
      case 'SCORING_PRESET': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <Div>
      <Div>
        <Div>
          <H1 >🎨 Add-ons</H1>
          <P >Themes, Skins & Presets</P>
        </Div>

        {/* Installierte Add-ons */}
        {installedAddons.length > 0 && (
          <Div>
            <H2 >
              <CheckCircle  />
              Installiert ({installedAddons.length})
            </H2>
            <Div>
              {installedAddons.map(addon => (
                <Div>
                  <Div>
                  <Div>
                    <Div>
                      {getTypeIcon(addon.type)}
                    </Div>
                    <Div>
                      <h3 >{addon.name}</h3>
                      <P >{addon.description}</P>
                    </Div>
                  </Div>
                  <Div>
                    <Span>
                      {new Date(addon.installedAt).toLocaleDateString('de-DE')}
                    </Span>
                    <button
                      onClick={() => uninstallAddon(addon.id)}
                      
                    >
                      Deinstallieren
                    </button>
                  </Div>
                </Div>
              ))}
            </Div>
          </Div>
        )}

        {/* Verfügbare Add-ons */}
        <Div>
          <H2 >
            <Download  />
            Verfügbar ({availableAddons.filter(a => !a.installed).length})
          </H2>
          
          {availableAddons.filter(a => !a.installed).length === 0 ? (
            <Div>
              <Package  size={64} />
              <P >Alle Add-ons installiert!</P>
            </Div>
          ) : (
            <Div>
              {availableAddons.filter(a => !a.installed).map(addon => (
                <Div>
                  <Div>
                  <Div>
                    <Div>
                      {getTypeIcon(addon.type)}
                    </Div>
                    <Div>
                      <h3 >{addon.name}</h3>
                      <P >{addon.description}</P>
                    </Div>
                  </Div>
                  <Div>
                    <Span>{addon.size}</Span>
                    <button
                      onClick={() => installAddon(addon)}
                      disabled={downloading === addon.id}
                      
                    >
                      {downloading === addon.id ? 'Lädt...' : 'Installieren'}
                    </button>
                  </Div>
                </Div>
              ))}
            </Div>
          )}
        </Div>

        {/* Download Progress */}
        {downloading && (
          <Div>
            <Div>
              <Div>
                <Download  size={48} />
                <H2 >Add-on wird installiert</H2>
                <P >
                  {availableAddons.find(a => a.id === downloading)?.name}
                </P>
              </Div>
              
              <Div>
                <Div>
                  <Span>{progress.percent}%</Span>
                  <Span>ETA: {progress.eta}</Span>
                </Div>
                <Div>
                  <Div>
                </Div>
              </Div>
              
              <P >
                Bitte nicht schließen...
              </P>
            </Div>
          </Div>
        )}

        {/* Info Box */}
        <Div>
          <h3 >
            <Package />
            ℹ️ Über Add-ons
          </h3>
          <ul >
            <li>• <Strong>APP_THEME:</Strong> Ändert Farben und Aussehen der gesamten App</li>
            <li>• <Strong>KARAOKE_SKIN:</Strong> Visueller Stil für den Karaoke-Modus</li>
            <li>• <Strong>LED_SEQUENCE:</Strong> Animationen und Effekte für LED-Feedback</li>
            <li>• <Strong>SCORING_PRESET:</Strong> Verschiedene Bewertungssysteme</li>
            <li>• Add-ons enthalten <Strong>keinen ausführbaren Code</Strong> (nur Assets/Configs)</li>
            <li>• Deinstallation jederzeit möglich, keine Auswirkung auf Profildaten</li>
          </ul>
        </Div>

        <Div>
          Download aus: Standard-Server (konfigurierbar in Settings)
        </Div>
      </Div>
    </Div>
  );
};

export default AddonManager;


