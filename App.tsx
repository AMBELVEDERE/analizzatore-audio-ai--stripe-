import React, { useState, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisType, MindMapNode, CombinedAnalysisResult, SpeakerAnalysisResult } from './types';
import * as geminiService from './services/geminiService';
import Icon from './components/Icon';
import MindMap from './components/MindMap';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';


const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [resultText, setResultText] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedAnalysisResult | null>(null);
  const [speakerAnalysisData, setSpeakerAnalysisData] = useState<SpeakerAnalysisResult | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        });

        const {
        data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        });

        return () => subscription.unsubscribe();
    }
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setAudioSrc(URL.createObjectURL(selectedFile));
      // Reset previous results
      setResultText(null);
      setMindMapData(null);
      setCombinedData(null);
      setSpeakerAnalysisData(null);
      setError(null);
      setActiveAnalysis(null);
    }
  };

  const handleAnalysis = useCallback(async (type: AnalysisType) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResultText(null);
    setMindMapData(null);
    setCombinedData(null);
    setSpeakerAnalysisData(null);
    setActiveAnalysis(type);

    try {
      if (type === 'summary') {
        const summary = await geminiService.summarizeAudio(file);
        setResultText(summary);
      } else if (type === 'speakers') {
        const analysis = await geminiService.analyzeSpeakers(file);
        setSpeakerAnalysisData(analysis);
      } else if (type === 'mindmap') {
        const mapData = await geminiService.generateMindMapData(file);
        setMindMapData(mapData);
      } else if (type === 'combined') {
        const combinedResult = await geminiService.generateCombinedAnalysis(file);
        setCombinedData(combinedResult);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Errore durante l'analisi: ${err.message}`);
      } else {
        setError("Si è verificato un errore sconosciuto.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleDownload = () => {
    if (isDownloading) return;

    let blob: Blob;
    let filename: string;

    if (activeAnalysis === 'combined' && combinedData) {
      const input = document.getElementById('pdf-content');
      if (input) {
        setIsDownloading(true);
        html2canvas(input, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#1f2937', // bg-gray-800
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height],
            hotfixes: ['px_scaling'],
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('analisi-completa.pdf');
        }).catch(err => {
          setError(`Errore durante la creazione del PDF: ${err.message}`);
        }).finally(() => {
          setIsDownloading(false);
        });
      }
      return;
    }
    
    if (activeAnalysis === 'speakers' && speakerAnalysisData) {
      let textContent = "Analisi degli Speaker\n=======================\n\n";
      speakerAnalysisData.speakers.forEach(speaker => {
          textContent += `Speaker: ${speaker.speakerId}\n`;
          textContent += `Riassunto: ${speaker.summary}\n`;
          textContent += `Cluster di Discussione:\n`;
          speaker.knowledgeGraph.forEach(cluster => {
              textContent += `- ${cluster}\n`;
          });
          textContent += "\n";
      });
      textContent += "Punti in Comune\n================\n";
      speakerAnalysisData.commonGround.forEach(point => {
          textContent += `- ${point}\n`;
      });
      textContent += "\n";
      textContent += "Punti di Divergenza\n=====================\n";
      speakerAnalysisData.divergentPoints.forEach(point => {
          textContent += `- ${point}\n`;
      });
      blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      filename = 'analisi-speaker.txt';
    } else if (activeAnalysis === 'mindmap' && mindMapData) {
      const jsonString = JSON.stringify(mindMapData, null, 2);
      blob = new Blob([jsonString], { type: 'application/json' });
      filename = 'mappa-mentale.json';
    } else if (resultText) {
      blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
      filename = 'riassunto.txt';
    } else {
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const hasResult = resultText || mindMapData || combinedData || speakerAnalysisData;

  const FileUploader: React.FC = () => (
    <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-600 hover:border-sky-500 transition-colors">
        <div className="flex flex-col items-center justify-center text-center">
            <Icon name="upload" className="w-12 h-12 text-gray-500 mb-4"/>
            <p className="text-lg font-semibold text-gray-300 mb-2">Trascina un file audio qui o clicca per caricare</p>
            <p className="text-sm text-gray-500">Formati supportati: MP3, MP4, WAV, M4A</p>
            <input 
                type="file" 
                className="absolute w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                accept=".mp3,.mp4,.wav,.m4a"
            />
        </div>
    </div>
  );

  const ActionButton = ({ type, label, iconName }: { type: AnalysisType, label: string, iconName: 'summary' | 'speakers' | 'mindmap' | 'combined' }) => (
    <button
        onClick={() => handleAnalysis(type)}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-sky-700 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 transition-all text-white font-medium"
    >
        {isLoading && activeAnalysis === type ? <Icon name="processing" className="w-5 h-5"/> : <Icon name={iconName} className="w-5 h-5"/>}
        <span>{label}</span>
    </button>
  );

  const renderResult = () => {
    if (activeAnalysis === 'combined' && combinedData) {
        return (
            <div id="pdf-content" className="p-6 sm:p-8 bg-gray-800">
                <h3 className="text-2xl font-bold text-sky-400 mb-4 border-b border-gray-700 pb-2">Riassunto della Conversazione</h3>
                <pre className="whitespace-pre-wrap text-gray-300 font-sans text-base leading-relaxed mb-8">{combinedData.summary}</pre>
                
                <h3 className="text-2xl font-bold text-sky-400 mb-6 border-b border-gray-700 pb-2">Mappa Mentale</h3>
                <MindMap data={combinedData.mindMap} />
            </div>
        );
    }
    
    if (activeAnalysis === 'speakers' && speakerAnalysisData) {
      return (
        <div className="p-6 sm:p-8 space-y-10">
            <div>
                <h3 className="text-2xl font-bold text-sky-400 mb-6 border-b border-gray-700 pb-2">Analisi per Speaker</h3>
                <div className="space-y-6">
                    {speakerAnalysisData.speakers.map((speaker, index) => (
                        <div key={index} className="bg-gray-700/40 p-5 rounded-lg border border-gray-600/50">
                            <h4 className="text-xl font-semibold text-sky-300 mb-3">{speaker.speakerId}</h4>
                            <p className="text-gray-300 mb-4 leading-relaxed">{speaker.summary}</p>
                            <h5 className="font-semibold text-gray-200 mb-3">Cluster di Discussione:</h5>
                            <div className="flex flex-wrap gap-2">
                                {speaker.knowledgeGraph.map((cluster, cIndex) => (
                                    <span key={cIndex} className="bg-sky-900/70 text-sky-200 text-sm font-medium px-3 py-1 rounded-full">{cluster}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {speakerAnalysisData.commonGround.length > 0 && (
                    <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon name="checkCircle" className="w-7 h-7 text-green-400" />
                            <h3 className="text-xl font-bold text-gray-100">Punti in Comune</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-green-200/90">
                            {speakerAnalysisData.commonGround.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {speakerAnalysisData.divergentPoints.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Icon name="xCircle" className="w-7 h-7 text-red-400" />
                            <h3 className="text-xl font-bold text-gray-100">Punti di Divergenza</h3>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-red-200/90">
                            {speakerAnalysisData.divergentPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
      );
    }
    
    if (activeAnalysis === 'mindmap' && mindMapData) {
        return <div className="p-6 sm:p-8"><MindMap data={mindMapData} /></div>;
    }
    
    if (resultText) {
        return <div className="p-6 sm:p-8"><pre className="whitespace-pre-wrap text-gray-300 font-sans text-base leading-relaxed">{resultText}</pre></div>;
    }

    return null;
  }
  
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-2xl text-center border border-red-500/50">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-4">
            Configurazione Richiesta
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Le credenziali per Supabase non sono state trovate. Per utilizzare questa applicazione, è necessario impostare le seguenti variabili d'ambiente:
          </p>
          <div className="my-6 text-left bg-gray-900 p-4 rounded-md font-mono text-sm text-sky-300">
            <p>SUPABASE_URL=Il_tuo_url_del_progetto</p>
            <p>SUPABASE_ANON_KEY=La_tua_chiave_anon</p>
          </div>
          <p className="text-sm text-gray-500">
            Una volta impostate, ricarica l'applicazione.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-2xl">
          <h1 className="text-3xl font-bold text-white tracking-tight text-center mb-2">
            Analizzatore Audio <span className="text-sky-400">AI</span>
          </h1>
          <p className="mt-2 mb-8 text-center text-gray-400">Accedi per continuare</p>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={['google', 'github']}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-start mb-10">
            <div>
                 <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    Analizzatore Audio <span className="text-sky-400">AI</span>
                </h1>
                <p className="mt-4 text-lg text-gray-400">
                    Carica un file audio e ottieni riassunti, trascrizioni e mappe mentali in pochi secondi.
                </p>
            </div>
            <button
                onClick={handleSignOut}
                className="ml-8 flex-shrink-0 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                Sign Out
            </button>
        </header>

        <main>
          {!file ? (
            <FileUploader />
          ) : (
            <div className="space-y-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                <div className="flex items-center gap-4 mb-5">
                    <Icon name="audio" className="w-6 h-6 text-sky-400"/>
                    <p className="font-mono text-gray-300 flex-1 truncate" title={file.name}>{file.name}</p>
                     <button onClick={() => { setFile(null); setAudioSrc(null); }} className="text-sm text-gray-500 hover:text-white">Cambia file</button>
                </div>
                {audioSrc && <audio controls src={audioSrc} className="w-full"></audio>}
              </div>

              <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                <h2 className="text-xl font-semibold mb-4 text-white">Azioni Disponibili</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionButton type="summary" label="Fai un Riassunto" iconName="summary" />
                    <ActionButton type="speakers" label="Analisi Speaker" iconName="speakers" />
                    <ActionButton type="mindmap" label="Genera Mappa" iconName="mindmap" />
                    <ActionButton type="combined" label="Analisi Completa" iconName="combined" />
                </div>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-4 p-8 text-lg text-sky-400">
                    <Icon name="processing" className="w-8 h-8"/>
                    <span>Analisi in corso... Potrebbe richiedere un momento.</span>
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                    <p className="font-bold">Oops! Si è verificato un errore.</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {hasResult && !isLoading && (
                <div className="bg-gray-800 rounded-lg shadow-2xl transition-opacity duration-500 animate-[fadeIn_0.5s_ease-in-out]">
                    <header className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-white">Risultato</h2>
                        <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-semibold transition-colors disabled:bg-sky-800 disabled:cursor-wait">
                            {isDownloading ? <Icon name="processing" className="w-5 h-5"/> : <Icon name="download" className="w-5 h-5"/>}
                            <span>{isDownloading ? 'Creazione...' : 'Download'}</span>
                        </button>
                    </header>
                     <div>
                        {renderResult()}
                    </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
