import React, { useRef, useState } from 'react';
import CanvasBoard, { CanvasRef } from './components/CanvasBoard';
import Controls from './components/Controls';
import { reimagineSketch } from './services/geminiService';
import { BrushColor, AppState } from './types';

function App() {
  const canvasRef = useRef<CanvasRef>(null);
  const [currentColor, setCurrentColor] = useState<BrushColor>(BrushColor.BLACK);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>("");

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setGeneratedImage(null);
    setAppState(AppState.IDLE);
  };

  const handleReimagine = async () => {
    if (!canvasRef.current) return;
    
    const imageData = canvasRef.current.getImageData();
    if (!imageData) return;

    setAppState(AppState.GENERATING);
    setGeneratedImage(null);

    try {
      const newImage = await reimagineSketch(imageData, userPrompt);
      setGeneratedImage(newImage);
    } catch (error) {
      console.error(error);
      alert("Something went wrong with the creative process. Please try again.");
    } finally {
      setAppState(AppState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Creature Creator
          </h1>
          <p className="text-slate-500 max-w-lg text-lg">
            Scribble a shape, and our AI will evolve it into a unique beast.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Input Section */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
               <CanvasBoard 
                ref={canvasRef} 
                color={currentColor} 
                brushSize={5} 
              />
            </div>
            
            <Controls 
              currentColor={currentColor} 
              onColorChange={setCurrentColor} 
              onClear={handleClear}
              disabled={appState === AppState.GENERATING}
            />

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <div>
                <label htmlFor="prompt" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Creature Traits (Optional)
                </label>
                <input 
                  id="prompt"
                  type="text" 
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g. Cute, Scary, Robotic, Swamp Dweller..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                  disabled={appState === AppState.GENERATING}
                />
              </div>
              
              <button
                onClick={handleReimagine}
                disabled={appState === AppState.GENERATING}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {appState === AppState.GENERATING ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Spawning Creature...
                  </>
                ) : (
                  <>
                    <span>Spawn Creature</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col h-full">
            <div className={`
              relative flex-grow min-h-[400px] md:min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-6 transition-all duration-500
              ${generatedImage ? 'ring-4 ring-indigo-500/10' : 'bg-slate-50/50 border-dashed'}
            `}>
              {generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center animate-fade-in group">
                  <img 
                    src={generatedImage} 
                    alt="Re-imagined Art" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  />
                  <a 
                    href={generatedImage} 
                    download="creature.png"
                    className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 border border-slate-200 transform translate-y-2 group-hover:translate-y-0"
                  >
                    Download Creature
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-5 max-w-xs">
                  {appState === AppState.GENERATING ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <div className="h-10 w-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Evolving...</h3>
                      <p className="text-slate-500 text-sm">Giving life to your lines.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <div className="h-24 w-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-600">No creature yet</p>
                      <p className="text-sm">Draw a shape and spawn your beast!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {generatedImage && (
              <div className="mt-4 text-center animate-fade-in">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  Powered by Gemini 2.5 Flash
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;