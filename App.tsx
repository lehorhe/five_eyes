import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeMediaContent } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'audio' | 'video' | 'text' | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = useCallback(async (file: File | null, customPrompt: string) => {
    if (!file) {
      setError("Proszę wybrać plik do analizy.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    
    const mimeType = file.type;
    let currentFileType: 'image' | 'audio' | 'video' | 'text' | null = null;

    if (mimeType.startsWith('image/')) {
        currentFileType = 'image';
        setFilePreview(URL.createObjectURL(file));
    } else if (mimeType.startsWith('audio/')) {
        currentFileType = 'audio';
        setFilePreview(null);
    } else if (mimeType.startsWith('video/')) {
        currentFileType = 'video';
        setFilePreview(URL.createObjectURL(file));
    } else if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html'].includes(mimeType)) {
        currentFileType = 'text';
        setFilePreview(null);
    } else {
        setError("Nieobsługiwany typ pliku.");
        setLoading(false);
        return;
    }
    
    setFileType(currentFileType);
    setFileName(file.name);

    try {
      const mediaData = await fileToBase64(file);
      let prompt = '';
      if (currentFileType === 'image') {
        prompt = `Analizuj następujący plik graficzny. Dostarcz szczegółowy raport obejmujący: 1. Podsumowanie treści wizualnej. 2. Szczegółowy opis wszystkich podmiotów, obiektów i działań. 3. Analizę potencjalnej lokalizacji i czasu na podstawie wskazówek wizualnych. 4. Ocenę zagrożenia na podstawie treści. 5. Analizę wszelkiego dostrzegalnego tekstu lub symboli.`;
      } else if (currentFileType === 'audio') {
        prompt = `Analizuj następujący plik audio. Dostarcz szczegółowy raport obejmujący: 1. Transkrypcję wszelkiej mowy. 2. Identyfikację i opis wszystkich dźwięków tła i niewerbalnych (np. syreny, strzały, muzyka). 3. Ocenę nastroju i tonu mówców. 4. Ocenę zagrożenia na podstawie treści audio. 5. Analizę wszelkich anomalii lub ukrytych dźwięków.`;
      } else if (currentFileType === 'video') {
        prompt = `Analizuj następujący plik wideo. Dostarcz szczegółowy raport obejmujący: 1. Podsumowanie treści wideo, w tym opis kluczowych scen. 2. Szczegółowy opis wszystkich podmiotów, obiektów i działań w porządku chronologicznym. 3. Transkrypcję wszelkiej mowy i identyfikację dźwięków tła. 4. Analizę potencjalnej lokalizacji i czasu na podstawie wskazówek wizualnych i dźwiękowych. 5. Ocenę zagrożenia na podstawie treści. 6. Analizę wszelkiego dostrzegalnego tekstu, symboli lub logo.`;
      } else if (currentFileType === 'text') {
        prompt = `Analizuj następujący dokument tekstowy. Dostarcz szczegółowy raport obejmujący: 1. Zwięzłe streszczenie treści. 2. Ekstrakcję kluczowych bytów (osoby, organizacje, lokalizacje, daty). 3. Analizę nastroju (sentymentu) dokumentu. 4. Identyfikację potencjalnie wrażliwych informacji lub zagrożeń. 5. Podsumowanie głównych tematów i argumentów.`;
      }
      
      if (customPrompt) {
          prompt += `\n\n### Dodatkowe dyrektywy analityczne:\n${customPrompt}`;
      }

      const result = await analyzeMediaContent(prompt, mediaData, file.type);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(`Błąd analizy: ${err.message || 'Nieznany błąd. Sprawdź konsolę, aby uzyskać więcej informacji.'}`);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  }, [filePreview]);

  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-300">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputPanel onAnalyze={handleAnalyze} loading={loading} />
          <AnalysisDisplay 
            loading={loading} 
            error={error} 
            result={analysisResult}
            filePreview={filePreview}
            fileName={fileName}
            fileType={fileType}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-600 border-t border-gray-800 mt-8">
        <p>CLASSIFIED // FIVE EYES INTELLIGENCE // FOR AUTHORIZED PERSONNEL ONLY</p>
      </footer>
    </div>
  );
};

export default App;
