import { startDrone, playImpact, playShutter, playMassiveImpact } from './audio.js';

const COVER_IMAGE = "https://i.postimg.cc/28sPh51s/file-0000000083a47246a1087a141da0ebe2.png";
const RANDOM_IMAGES = [
  "https://i.postimg.cc/sXHLXfF5/file-00000000fa447246afd024e07fb30628.png",
  "https://i.postimg.cc/wMtGsKgT/file-00000000b3847246a591c6d24c9554c1.png",
  "https://i.postimg.cc/sgCN10Lk/file-000000006f0c72468f53b58b7e012ab4.png",
  "https://i.postimg.cc/N0gCk2B3/file-000000008aa872468354fe6722dab9df.png",
  "https://i.postimg.cc/RF2jdCPm/file-0000000056b07246836af00c70696fad.png"
];

const SEQ = [
  { id: 'psa', type: 'text', content: 'PUBLIC SERVICE ANNOUNCEMENT', duration: 4000 },
  { id: 't1', type: 'text', content: 'THE NATION HAS BEEN DIVIDED', duration: 3500 },
  { id: 't2', type: 'text', content: 'THE LEADERSHIP HAS FAILED', duration: 3000 },
  { id: 't3', type: 'text', content: 'A NEW ERA IS DAWNING', duration: 3500 },
  { id: 'montage', type: 'montage', duration: 3000 },
  { id: 't4', type: 'text', content: 'SWEAR ALLEGIANCE', flash: true, duration: 2500 },
  { id: 'blackout', type: 'blackout', duration: 1500 },
  { id: 'reveal', type: 'reveal', duration: 0 },
];

function preloadImages() {
  const imagesToPreload = [COVER_IMAGE, ...RANDOM_IMAGES];
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

function placeholderHtml(id, srcStr, extraClasses = "") {
  let inner = '';
  if (srcStr) {
    inner += `<img src="${srcStr}" alt="${id}" referrerpolicy="no-referrer" class="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:opacity-100 transition-all duration-700" />`;
  }
  inner += `<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-80 z-0 transition-opacity group-hover:opacity-30 pointer-events-none"></div>`;
  if (!srcStr) {
    inner += `<span class="z-10 font-mono text-stone-600 text-xs md:text-sm tracking-[0.3em] font-bold uppercase transition-colors group-hover:text-stone-300 pointer-events-none">[${id}]</span>`;
  }
    
  return `<div class="w-full aspect-square bg-[#0a0a0a] border border-stone-800 flex items-center justify-center relative overflow-hidden group ${extraClasses}">${inner}</div>`;
}

function renderIntro(container, onStart) {
    container.innerHTML = `
      <div id="intro-screen" class="absolute inset-0 flex items-center justify-center z-50 flex-col gap-10 opacity-100 transition-opacity duration-1000">
        <button id="init-btn" class="font-mono text-xs md:text-sm tracking-[0.6em] text-stone-500 hover:text-stone-100 transition-all duration-1000 px-8 py-5 border border-stone-800 hover:border-stone-400 bg-black/50 backdrop-blur-sm cursor-pointer shadow-2xl hover:shadow-stone-900">
          INITIATE BROADCAST
        </button>
      </div>
    `;
    
    document.getElementById('init-btn')?.addEventListener('click', () => {
        const el = document.getElementById('intro-screen');
        if (el) {
            el.style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = '';
                onStart();
            }, 1000);
        }
    });
}

function startSequence(container) {
    let step = 0;
    let montageInterval;

    function renderStep() {
        const currentStage = SEQ[step];
        if (!currentStage) return;

        if (montageInterval) {
            clearInterval(montageInterval);
            montageInterval = null;
        }
        
        if (currentStage.type === 'text') {
            playImpact();
            if (currentStage.flash) {
                playShutter();
            }
            container.innerHTML = `
              <div id="seq-el" class="fade-in scale-enter absolute inset-0 flex items-center justify-center z-40 px-6 text-center">
                <h2 class="font-cinzel text-3xl md:text-5xl lg:text-7xl font-bold tracking-[0.15em] text-stone-300 cinematic-text">
                  ${currentStage.content}
                </h2>
                ${currentStage.flash ? '<div class="film-flash absolute inset-0 z-50 pointer-events-none"></div>' : ''}
              </div>
            `;
            
            requestAnimationFrame(() => {
                const el = document.getElementById('seq-el');
                if (el) el.classList.add('visible');
            });
            
            setTimeout(() => {
                const el = document.getElementById('seq-el');
                if (el) el.classList.add('scale-exit');
            }, Math.max(0, currentStage.duration - 1500));

        } else if (currentStage.type === 'montage') {
            container.innerHTML = `
                <div id="montage-bg" class="absolute inset-0 z-40 bg-[#050505]">
                    <div id="montage-el" class="absolute w-full h-full flex items-center justify-center transition-all duration-75 overflow-hidden">
                    </div>
                </div>
            `;
            
            let tick = 0;
            const updateMontage = () => {
                const containerEl = document.getElementById('montage-el');
                if (containerEl) {
                    const activeImage = RANDOM_IMAGES[tick % RANDOM_IMAGES.length];
                    const rotation = (Math.random() - 0.5) * 30; // -15 to 15 degrees
                    const offsetX = (Math.random() - 0.5) * 40;
                    const offsetY = (Math.random() - 0.5) * 40;
                    
                    const newPhoto = document.createElement('div');
                    newPhoto.className = "absolute w-[80%] max-w-[400px] aspect-square bg-[#0e0e0e] ring-[0.5rem] ring-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden";
                    newPhoto.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(1.15)`;
                    newPhoto.style.opacity = '0';
                    newPhoto.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    newPhoto.style.zIndex = tick.toString();
                    
                    newPhoto.innerHTML = `
                        <img src="${activeImage}" referrerpolicy="no-referrer" class="absolute inset-0 w-full h-full object-cover" />
                        <div class="film-flash absolute inset-0 pointer-events-none"></div>
                    `;
                    
                    containerEl.appendChild(newPhoto);
                    
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            newPhoto.style.opacity = '1';
                            newPhoto.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(1)`;
                        });
                    });
                }
                tick++;
                playShutter();
            };
            
            updateMontage();
            montageInterval = setInterval(updateMontage, 400);

        } else if (currentStage.type === 'blackout') {
             playImpact();
             container.innerHTML = '<div class="absolute inset-0 bg-black z-50"></div>';
        } else if (currentStage.type === 'reveal') {
            container.innerHTML = `
                <div class="reveal-container min-h-screen w-full relative z-10 flex flex-col items-center pt-10 md:pt-20 pb-20 px-6" id="reveal-screen">
                    <div id="flash-overlay" class="flash-white"></div>
                    <div id="camera-shake-container" class="w-full flex flex-col items-center">
                         <div id="rev-text" class="fly-in text-center space-y-3 md:space-y-6">
                            <h2 class="font-playfair italic text-stone-500 text-xl md:text-3xl tracking-widest">welcome to the</h2>
                            <h1 class="cinematic-title font-cinzel text-5xl md:text-7xl lg:text-[9rem] font-black text-stone-200 uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                                <span class="block cinematic-text">United States</span>
                                <span class="text-stone-400 block cinematic-text" style="animation-delay: 0.2s">Of SiCka</span>
                            </h1>
                            <p class="font-mono text-stone-300 md:text-lg tracking-[0.5em] uppercase mt-8 md:mt-12 opacity-80" style="animation: fade-in-anim 2s ease-out forwards; animation-delay: 1.5s; opacity: 0;">ALBUM OUT 8.21.2026</p>
                         </div>

                         <div id="rev-album" class="fly-in-album mt-10 md:mt-16 w-full max-w-xl relative group z-20">
                            ${placeholderHtml('ALBUM_COVER', COVER_IMAGE, 'shadow-[0_0_80px_rgba(0,0,0,1)] ring-1 ring-stone-700')}
                            <div id="album-flash" class="absolute inset-0 bg-white mix-blend-overlay pointer-events-none opacity-0 transition-opacity duration-200"></div>
                         </div>

                         <div id="rev-grid" class="fly-in-grid mt-16 md:mt-24 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
                            ${placeholderHtml('ASSET_TRACK_01', RANDOM_IMAGES[0])}
                            ${placeholderHtml('ASSET_TRACK_02', RANDOM_IMAGES[1])}
                            ${placeholderHtml('ASSET_TRACK_03', RANDOM_IMAGES[2])}
                            ${placeholderHtml('ASSET_TRACK_04', RANDOM_IMAGES[3])}
                         </div>

                         <div id="rev-end" class="fade-slow mt-20 md:mt-32 font-mono text-stone-700 text-xs tracking-[0.5em] uppercase text-center">
                            END OF TRANSMISSION
                         </div>
                    </div>
                </div>
            `;
            
            requestAnimationFrame(() => {
                const screen = document.getElementById('reveal-screen');
                if (screen) screen.classList.add('visible');
                
                const flashOverlay = document.getElementById('flash-overlay');
                if (flashOverlay) {
                    setTimeout(() => flashOverlay.classList.add('hidden'), 50);
                }

                const shake = document.getElementById('camera-shake-container');
                if (shake) shake.classList.add('camera-shake');

                setTimeout(() => {
                     const text = document.getElementById('rev-text');
                     if (text) text.classList.add('visible');
                     playMassiveImpact();
                }, 200);

                setTimeout(() => {
                     const album = document.getElementById('rev-album');
                     if (album) album.classList.add('visible');
                     playMassiveImpact();
                     
                     setTimeout(() => {
                         const aFlash = document.getElementById('album-flash');
                         if (aFlash) {
                             aFlash.style.opacity = '1';
                             setTimeout(()=> aFlash.style.opacity = '0', 100);
                         }
                     }, 1000);
                }, 800);

                setTimeout(() => {
                    const grid = document.getElementById('rev-grid');
                    if (grid) grid.classList.add('visible');
                }, 2500);

                setTimeout(() => {
                    const endText = document.getElementById('rev-end');
                    if (endText) endText.classList.add('visible');
                }, 4000);
            });
        }
        
        if (currentStage.duration > 0) {
            setTimeout(() => {
                step++;
                renderStep();
            }, currentStage.duration);
        }
    }

    renderStep();
}

function initApp() {
    preloadImages();
    
    const container = document.getElementById('app-container');
    if (!container) return;

    renderIntro(container, () => {
        startDrone();
        startSequence(container);
    });
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
