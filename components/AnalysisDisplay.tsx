import React from 'react';
import type { AnalysisResult } from '../types';
import { AlertTriangleIcon, AudioIcon, FileTextIcon } from './icons';

interface AnalysisDisplayProps {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  filePreview: string | null;
  fileName: string | null;
  fileType: 'image' | 'audio' | 'video' | 'text' | null;
}

const LoadingIndicator: React.FC = () => {
    const messages = [
        "Nawiązywanie połączenia z siecią ECHELON...",
        "Dekodowanie strumienia danych...",
        "Przeprowadzanie analizy heurystycznej...",
        "Korelacja z bazami danych wywiadu...",
        "Generowanie raportu..."
    ];
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            <p className="mt-4 text-lg text-cyan-300">TRWA ANALIZA</p>
            <p className="text-sm text-gray-500 animate-pulse">{message}</p>
        </div>
    );
};

const ThreatLevelIndicator: React.FC<{ level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN' }> = ({ level }) => {
    const levelInfo = {
        LOW: { text: 'NISKI', color: 'bg-green-500', textColor: 'text-green-300' },
        MEDIUM: { text: 'ŚREDNI', color: 'bg-yellow-500', textColor: 'text-yellow-300' },
        HIGH: { text: 'WYSOKI', color: 'bg-orange-500', textColor: 'text-orange-300' },
        CRITICAL: { text: 'KRYTYCZNY', color: 'bg-red-600', textColor: 'text-red-300' },
        UNKNOWN: { text: 'NIEZNANY', color: 'bg-gray-500', textColor: 'text-gray-300' },
    };
    const { text, color, textColor } = levelInfo[level] || levelInfo.UNKNOWN;

    return (
        <div className={`flex items-center space-x-2 p-2 rounded ${textColor} bg-opacity-20 ${color.replace('bg-', 'bg-')}/20`}>
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            <span className="font-bold tracking-wider">{text}</span>
        </div>
    );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ loading, error, result, filePreview, fileName, fileType }) => {
  return (
    <div className="bg-gray-900/50 border border-cyan-300/20 rounded-lg p-6 shadow-2xl shadow-cyan-500/5 min-h-[40rem] flex flex-col">
      <h2 className="text-lg font-semibold text-cyan-300 border-b border-cyan-300/20 pb-2 mb-4">Raport Analityczny</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        {loading && <LoadingIndicator />}
        {error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
                <AlertTriangleIcon className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold">Błąd Transmisji</h3>
                <p className="mt-2 text-red-300">{error}</p>
            </div>
        )}
        {!loading && !error && !result && (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                 <p>Oczekiwanie na dane do analizy...</p>
                 <p className="text-xs mt-2">System gotowy i sprawny.</p>
             </div>
        )}
        {result && (
            <div className="space-y-6 text-gray-300 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                       {fileType === 'image' && filePreview && (
                            <img src={filePreview} alt="Analizowany plik" className="rounded-lg border-2 border-cyan-700/50 w-full object-contain max-h-64" />
                       )}
                       {fileType === 'audio' && (
                           <div className="h-full min-h-48 flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border-2 border-cyan-700/50 p-4">
                               <AudioIcon className="w-24 h-24 text-cyan-500" />
                           </div>
                       )}
                       {fileType === 'video' && filePreview && (
                            <video src={filePreview} controls className="rounded-lg border-2 border-cyan-700/50 w-full object-contain max-h-64">
                                Twoja przeglądarka nie obsługuje tagu wideo.
                            </video>
                       )}
                       {fileType === 'text' && (
                           <div className="h-full min-h-48 flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border-2 border-cyan-700/50 p-4">
                               <FileTextIcon className="w-24 h-24 text-cyan-500" />
                           </div>
                       )}
                        <p className="text-xs text-center mt-2 text-gray-400 truncate">{fileName}</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <h4 className="font-bold text-cyan-400">Poziom zagrożenia:</h4>
                            <ThreatLevelIndicator level={result.threatAssessment.level} />
                            <p className="text-sm mt-1">{result.threatAssessment.justification}</p>
                        </div>
                         <div>
                            <h4 className="font-bold text-cyan-400">Podsumowanie:</h4>
                            <p className="text-sm">{result.executiveSummary}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-cyan-400 border-t border-cyan-800/50 pt-4 mt-4">Szczegółowa analiza treści:</h4>
                    <p className="text-sm whitespace-pre-wrap">{result.detailedAnalysis}</p>
                </div>

                <div>
                    <h4 className="font-bold text-cyan-400">Ocena lokalizacji:</h4>
                    <p className="text-sm"><span className="font-semibold">Prawdopodobna lokalizacja:</span> {result.locationAssessment.potentialLocation}</p>
                    <p className="text-sm"><span className="font-semibold">Uzasadnienie:</span> {result.locationAssessment.reasoning}</p>
                </div>
                 
                {result.subjectProfiles && result.subjectProfiles.length > 0 && (
                    <div>
                        <h4 className="font-bold text-cyan-400">Zidentyfikowane podmioty:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {result.subjectProfiles.map((profile, index) => <li key={index}>{profile}</li>)}
                        </ul>
                    </div>
                )}

                <div>
                    <h4 className="font-bold text-cyan-400">Wnioski z metadanych (symulowane):</h4>
                    <p className="text-sm">{result.metadataInsights}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDisplay;