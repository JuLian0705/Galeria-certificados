(function(){
  const wrap = document.getElementById('wrap');
  const carousel = document.getElementById('carousel');
  const items = Array.from(carousel.querySelectorAll('.item'));
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');
  const modalBg = document.querySelector('.modal-bg');
  const closeBtn = document.querySelector('.close');
  const pdfCanvas = document.getElementById('pdfCanvas');

  let index = Math.floor(items.length/2);
  const itemW = 240;
  const gap = 28;
  const visibleRange = 3;

  function layout(){
    const wrapRect = wrap.getBoundingClientRect();
    const centerX = wrapRect.width/2;

    items.forEach((it, i)=>{
      const offset = i - index;
      const baseX = centerX - (itemW/2) + offset*(itemW + gap);
      let x = baseX, r=0, s=1, o=1;

      if(offset === 0){ r=0; s=1; o=1; }
      else if(offset === -1){ r=18; s=0.86; o=0.9; }
      else if(offset === 1){ r=-18; s=0.86; o=0.9; }
      else if(Math.abs(offset) === 2){ r = offset < 0 ? 12 : -12; s=0.72; o=0.6; }
      else{
        const out = (offset<0)? -(wrapRect.width*.6) : (wrapRect.width*.6);
        x = centerX - itemW/2 + out;
        r = offset<0? 22 : -22;
        s = 0.56;
        o = 0;
      }

      it.style.transform = `translateX(${x}px) scale(${s}) rotateY(${r}deg)`;
      it.style.opacity = o;
      it.style.zIndex = 100 - Math.abs(offset);

      if(Math.abs(offset)>visibleRange) it.classList.add('far');
      else it.classList.remove('far');
    });
  }

  function moveTo(n){
    if(n<0 || n>items.length-1) return;
    index = n;
    layout();
  }

  // SONIDO
  function playClick(){
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  }

  // BOTONES
  rightBtn.onclick = ()=> {
    playClick();
    navigator.vibrate?.(20);
    moveTo(index+1);
  };

  leftBtn.onclick = ()=> {
    playClick();
    navigator.vibrate?.(20);
    moveTo(index-1);
  };

  // TECLADO
  window.onkeydown = e=>{
    if(e.key==="ArrowRight"){
      playClick();
      moveTo(index+1);
    }
    if(e.key==="ArrowLeft"){
      playClick();
      moveTo(index-1);
    }
  };

  // SWIPE
  let touchStartX = 0;
  let touchEndX = 0;

  wrap.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrap.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;

    if (touchEndX < touchStartX - swipeThreshold) {
      playClick();
      navigator.vibrate?.(20);
      moveTo(index + 1);
    } 
    else if (touchEndX > touchStartX + swipeThreshold) {
      playClick();
      navigator.vibrate?.(20);
      moveTo(index - 1);
    }
  }, { passive: true });

  let pdfDoc = null;
  let pageNum = 1;
  const scale = 1.5; 
  const ctx = pdfCanvas.getContext('2d');

  function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      page.render(renderContext);
      
      const pageNumDisplay = document.getElementById('pageNum');
      if(pageNumDisplay) pageNumDisplay.textContent = num;
    });
  }

  function loadPDF(url) {
    pageNum = 1;
    if (window.pdfjsLib) {
      pdfjsLib.getDocument(url).promise.then(doc => {
        pdfDoc = doc;
        const pageCountDisplay = document.getElementById('pageCount');
        if(pageCountDisplay) pageCountDisplay.textContent = pdfDoc.numPages;
        renderPage(pageNum);
      }).catch(err => console.error("Error al cargar el certificado:", err));
    }
  }

  items.forEach((it, i) => {
    it.addEventListener('click', () => {
      // Si el item no es el central, lo centramos primero
      if (i !== index) {
        moveTo(i);
        playClick();
      } else {
        // Si ya está centrado, abrimos el PDF
        const pdfUrl = it.getAttribute('data-pdf');
        if (pdfUrl) {
          playClick();
          navigator.vibrate?.(30);
          modalBg.style.display = 'flex';
          loadPDF(pdfUrl);
        }
      }
    });
  });

  // Cerrar modal
  if (closeBtn) {
    closeBtn.onclick = () => {
      modalBg.style.display = 'none';
      pdfDoc = null;
    };
  }

  // Cerrar al hacer clic en el fondo borroso
  modalBg.onclick = (e) => {
    if (e.target === modalBg) modalBg.style.display = 'none';
  };

  // Navegación interna del PDF (Siguiente/Anterior)
  document.getElementById('prev')?.addEventListener('click', () => {
    if (pdfDoc && pageNum > 1) {
      pageNum--;
      renderPage(pageNum);
    }
  });

  document.getElementById('next')?.addEventListener('click', () => {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  });

  setTimeout(layout,50);
})();