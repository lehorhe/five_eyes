import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon, AudioIcon, FileTextIcon } from './icons';

interface InputPanelProps {
  onAnalyze: (file: File | null, customPrompt: string) => void;
  loading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, loading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup the object URL to avoid memory leaks
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const processFile = (file: File | undefined) => {
    if (!file) return;

    const acceptedMimeTypes = [
        'image/', 
        'audio/', 
        'video/', 
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain', 
        'text/html'
    ];

    if (acceptedMimeTypes.some(type => file.type.startsWith(type))) {
      setSelectedFile(file);
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    } else {
      alert('Nieobsługiwany typ pliku. Obsługiwane są pliki graficzne, audio, wideo oraz dokumenty (PDF, Word, TXT, HTML).');
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    processFile(file);
    if(fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files;
    }
  }, []);

  const handleSubmit = () => {
    onAnalyze(selectedFile, customPrompt);
  };

  const renderPreview = () => {
    if (!selectedFile) {
      return (
        <>
          <UploadIcon className="w-12 h-12 text-gray-500 mb-2" />
          <p className="text-gray-400">Przeciągnij i upuść plik tutaj</p>
          <p className="text-xs text-gray-500">lub kliknij, aby wybrać (formaty poniżej)</p>
        </>
      );
    }

    if (selectedFile.type.startsWith('image/') && filePreview) {
      return <img src={filePreview} alt="Podgląd pliku" className="max-h-full max-w-full object-contain rounded-md" />;
    }

    if (selectedFile.type.startsWith('video/') && filePreview) {
      return <video src={filePreview} loop autoPlay muted className="max-h-full max-w-full object-contain rounded-md" />;
    }

    if (selectedFile.type.startsWith('audio/')) {
      return (
        <>
          <AudioIcon className="w-12 h-12 text-gray-500 mb-2" />
          <p className="text-gray-400">Wybrano plik audio</p>
          <p className="text-xs text-gray-500">{selectedFile.name}</p>
        </>
      );
    }

    if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html'].includes(selectedFile.type)) {
       return (
        <>
          <FileTextIcon className="w-12 h-12 text-gray-500 mb-2" />
          <p className="text-gray-400">Wybrano dokument</p>
          <p className="text-xs text-gray-500">{selectedFile.name}</p>
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/50 border border-cyan-300/20 rounded-lg p-6 shadow-2xl shadow-cyan-500/5 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-cyan-300 border-b border-cyan-300/20 pb-2 mb-4">Dossier Wejściowe</h2>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div 
          className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 transition-colors ${isDragOver ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-600 hover:border-cyan-500'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/html"
            disabled={loading}
          />
          {renderPreview()}
        </div>
        
        <div className="w-full mt-4 text-xs text-center text-gray-500 bg-gray-800/30 p-3 rounded-md border border-gray-700">
            <p className="font-semibold text-gray-400 mb-2">Obsługiwane typy plików:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <p><strong className="text-cyan-400/80">Grafika:</strong> JPEG, PNG, WEBP, GIF</p>
                <p><strong className="text-cyan-400/80">Audio:</strong> MP3, WAV, OGG</p>
                <p><strong className="text-cyan-400/80">Wideo:</strong> MP4, WEBM, MOV</p>
                <p><strong className="text-cyan-400/80">Dokumenty:</strong> PDF, DOCX, TXT, HTML</p>
            </div>
        </div>

        {selectedFile && (
          <div className="mt-2 text-center text-sm text-cyan-400">
            <p>Wybrany plik: <span className="font-semibold">{selectedFile.name}</span></p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-cyan-400 mb-1">
                Dodatkowe dyrektywy analityczne:
            </label>
            <textarea
                id="custom-prompt"
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-300 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-colors"
                placeholder="Np. 'Skup się na identyfikacji pojazdów i ich numerów rejestracyjnych'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={loading}
            />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ANALIZOWANIE...
            </>
          ) : (
            'ROZPOCZNIJ ANALIZĘ'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;