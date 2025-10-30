import { Div, Section, Article } from '../ui/layout';
import { H1, H2, P, Span, Small, Strong, Em, Li } from '../ui/typography';
import React, { useState, useEffect } from 'react';
import { Music, Search, Star, Clock, TrendingUp, Download, Trash2, Play } from 'lucide-react';

const MusicLibrary = () => {
  const [songs, setSongs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    const defaultSongs = [
      {
        id: 'song_1',
        title: 'Alle meine Entchen',
        composer: 'Volkslied',
        difficulty: 'Einfach',
        duration: '0:45',
        measures: 8,
        notes: 32,
        lastPlayed: null,
        bestScore: 0,
        favorite: false,
        source: 'preinstalled'
      },
      {
        id: 'song_2',
        title: 'Hänschen Klein',
        composer: 'Volkslied',
        difficulty: 'Einfach',
        duration: '1:10',
        measures: 12,
        notes: 48,
        lastPlayed: null,
        bestScore: 0,
        favorite: false,
        source: 'preinstalled'
      },
      {
        id: 'song_3',
        title: 'Ode an die Freude',
        composer: 'Beethoven',
        difficulty: 'Mittel',
        duration: '2:30',
        measures: 32,
        notes: 124,
        lastPlayed: null,
        bestScore: 85,
        favorite: true,
        source: 'preinstalled'
      },
      {
        id: 'song_4',
        title: 'Für Elise (Intro)',
        composer: 'Beethoven',
        difficulty: 'Mittel',
        duration: '1:45',
        measures: 24,
        notes: 96,
        lastPlayed: Date.now() - 86400000,
        bestScore: 72,
        favorite: true,
        source: 'preinstalled'
      }
    ];

    try {
      const stored = await window.storage.list('song:', false);
      if (stored?.keys && stored.keys.length > 0) {
        const userSongs = [];
        for (const key of stored.keys) {
          const data = await window.storage.get(key, false);
          if (data?.value) userSongs.push(JSON.parse(data.value));
        }
        setSongs([...defaultSongs, ...userSongs]);
      } else {
        setSongs(defaultSongs);
        for (const song of defaultSongs) {
          await window.storage.set(`song:${song.id}`, JSON.stringify(song), false);
        }
      }
    } catch (e) {
      setSongs(defaultSongs);
    }
  };

  const toggleFavorite = async (songId) => {
    const updated = songs.map(s => 
      s.id === songId ? { ...s, favorite: !s.favorite } : s
    );
    setSongs(updated);
    
    const song = updated.find(s => s.id === songId);
    if (song) {
      await window.storage.set(`song:${songId}`, JSON.stringify(song), false);
    }
  };

  const deleteSong = async (songId) => {
    const song = songs.find(s => s.id === songId);
    if (song?.source === 'preinstalled') {
      alert('⚠️ Vorinstallierte Lieder können nicht gelöscht werden');
      return;
    }
    
    await window.storage.delete(`song:${songId}`, false);
    setSongs(songs.filter(s => s.id !== songId));
    setShowDeleteConfirm(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Einfach': return 'text-green-400';
      case 'Mittel': return 'text-yellow-400';
      case 'Schwer': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredSongs = songs
    .filter(s => {
      if (filter === 'favorites' && !s.favorite) return false;
      if (filter === 'recent' && !s.lastPlayed) return false;
      if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase()) 
          && !s.composer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return (b.lastPlayed || 0) - (a.lastPlayed || 0);
      if (sortBy === 'score') return (b.bestScore || 0) - (a.bestScore || 0);
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') {
        const order = { 'Einfach': 1, 'Mittel': 2, 'Schwer': 3 };
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      }
      return 0;
    });

  const stats = {
    total: songs.length,
    favorites: songs.filter(s => s.favorite).length,
    played: songs.filter(s => s.lastPlayed).length,
    avgScore: Math.round(
      songs.filter(s => s.bestScore > 0).reduce((sum, s) => sum + s.bestScore, 0) / 
      songs.filter(s => s.bestScore > 0).length || 0
    )
  };

  return (
    <Div>
      <Div>
        <Div>
          <H1 >📚 Bibliothek</H1>
          <P >Deine gespeicherten Musikstücke</P>
        </Div>

        {/* Statistiken */}
        <Div>
          <Div>
            <Div>{stats.total}</Div>
            <Div>Gesamt</Div>
          </Div>
          <Div>
            <Div>{stats.favorites}</Div>
            <Div>Favoriten</Div>
          </Div>
          <Div>
            <Div>{stats.played}</Div>
            <Div>Gespielt</Div>
          </Div>
          <Div>
            <Div>{stats.avgScore || '—'}</Div>
            <Div>Ø Score</Div>
          </Div>
        </Div>

        {/* Filter & Suche */}
        <Div>
          <Div>
            <Div>
              <Search  size={20} />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                
              />
            </Div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              
            >
              <option value="all">Alle anzeigen</option>
              <option value="favorites">⭐ Favoriten</option>
              <option value="recent">🕒 Zuletzt gespielt</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              
            >
              <option value="recent">Sortieren: Neueste</option>
              <option value="name">Sortieren: Name</option>
              <option value="score">Sortieren: Beste Scores</option>
              <option value="difficulty">Sortieren: Schwierigkeit</option>
            </select>
          </Div>

          <Div>
            {filteredSongs.length} {filteredSongs.length === 1 ? 'Lied' : 'Lieder'} gefunden
          </Div>
        </Div>

        {/* Song-Liste */}
        <Div>
          {filteredSongs.length === 0 ? (
            <Div>
              <Music  size={64} />
              <P >Keine Lieder gefunden</P>
            </Div>
          ) : (
            filteredSongs.map(song => (
              <Div>
                <Div>
                  <Div>
                    <Div>
                      <h3 >{song.title}</h3>
                      {song.source === 'preinstalled' && (
                        <Span>
                          Public Domain
                        </Span>
                      )}
                    </Div>
                    <P >{song.composer}</P>
                  </Div>

                  <Div>
                    <button
                      onClick={() => toggleFavorite(song.id)}
                      `}
                    >
                      <Star size={24} fill={song.favorite ? 'currentColor' : 'none'} />
                    </button>
                    
                    {song.source !== 'preinstalled' && (
                      <button
                        onClick={() => setShowDeleteConfirm(song.id)}
                        
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </Div>
                </Div>

                <Div>
                  <Div>
                    <Div>Schwierigkeit</Div>
                    <Div>
                      {song.difficulty}
                    </Div>
                  </Div>
                  <Div>
                    <Div>Dauer</Div>
                    <Div>
                      <Clock size={14} />
                      {song.duration}
                    </Div>
                  </Div>
                  <Div>
                    <Div>Takte</Div>
                    <Div>{song.measures}</Div>
                  </Div>
                  <Div>
                    <Div>Noten</Div>
                    <Div>{song.notes}</Div>
                  </Div>
                  <Div>
                    <Div>Bester Score</Div>
                    <Div>
                      {song.bestScore > 0 ? (
                        <>
                          <TrendingUp size={14} />
                          {song.bestScore}%
                        </>
                      ) : '—'}
                    </Div>
                  </Div>
                </Div>

                {song.lastPlayed && (
                  <Div>
                    Zuletzt gespielt: {new Date(song.lastPlayed).toLocaleDateString('de-DE')}
                  </Div>
                )}

                <Div>
                  <button
                    onClick={() => alert(`Starte Karaoke für "${song.title}"...`)}
                    
                  >
                    <Play size={20} />
                    Spielen
                  </button>
                  
                  <button
                    onClick={() => alert(`Öffne Details für "${song.title}"...`)}
                    
                  >
                    Details
                  </button>
                </Div>
              </Div>
            ))
          )}
        </Div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <Div>
            <Div>
              <h3 >Lied löschen?</h3>
              <P >
                Das Lied wird dauerhaft aus deiner Bibliothek entfernt.
              </P>
              <Div>
                <button
                  onClick={() => deleteSong(showDeleteConfirm)}
                  
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

        {/* Import Button */}
        <Div>
          <button
            onClick={() => alert('Öffne Scanner zum Importieren...')}
            
          >
            <Download size={20} />
            Neues Lied importieren
          </button>
        </Div>
      </Div>
    </Div>
  );
};

export default MusicLibrary;


