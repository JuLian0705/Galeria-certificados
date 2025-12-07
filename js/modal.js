(function(){
  const wrap = document.getElementById('wrap');
  const carousel = document.getElementById('carousel');
  const items = Array.from(carousel.querySelectorAll('.item'));
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');

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
      else{ const out = (offset<0)? -(wrapRect.width*.6) : (wrapRect.width*.6); x = centerX - itemW/2 + out; r = offset<0? 22 : -22; s = 0.56; o = 0; }

      it.style.transform = `translateX(${x}px) scale(${s}) rotateY(${r}deg)`;
      it.style.opacity = o;
      it.style.zIndex = 100 - Math.abs(offset);
      if(Math.abs(offset)>visibleRange) it.classList.add('far'); else it.classList.remove('far');
    });
  }

  function moveTo(n){
    if(n<0 || n>items.length-1) return;
    index = n;
    layout();
  }

  rightBtn.onclick = ()=> moveTo(index+1);
  leftBtn.onclick = ()=> moveTo(index-1);
  window.onkeydown = e=>{
    if(e.key==="ArrowRight") moveTo(index+1);
    if(e.key==="ArrowLeft") moveTo(index-1);
  };

  setTimeout(layout,50);
})();

/* === MODAL PDF CON PDF.JS === */
const modalBg = document.getElementById("modalBg");
const pdfCanvas = document.getElementById("pdfCanvas");
const closeModal = document.getElementById("closeModal");
const ctx = pdfCanvas.getContext('2d');

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

document.querySelectorAll(".item").forEach(item => {
  item.addEventListener("click", async () => {
    let pdfPath = item.getAttribute("data-pdf");
    if(pdfPath){
      modalBg.style.display = "flex";
      pdfPath = encodeURI(pdfPath);
      pdfDoc = await pdfjsLib.getDocument(pdfPath).promise;
      totalPages = pdfDoc.numPages;
      document.getElementById('pageCount').textContent = totalPages;
      currentPage = 1;
      renderPage(currentPage);
    }
  });
});

function renderPage(num){
  pdfDoc.getPage(num).then(page => {
    const container = modalBg.querySelector('.pdf-container');
    const viewport = page.getViewport({ scale: 1 });
    let scale = container.clientWidth / viewport.width;
    const dpiScale = window.devicePixelRatio || 1;
    const scaledViewport = page.getViewport({ scale: scale * dpiScale });

    pdfCanvas.width = scaledViewport.width;
    pdfCanvas.height = scaledViewport.height;
    pdfCanvas.style.width = (scaledViewport.width / dpiScale) + 'px';
    pdfCanvas.style.height = (scaledViewport.height / dpiScale) + 'px';

    page.render({ canvasContext: ctx, viewport: scaledViewport });
    document.getElementById('pageNum').textContent = num;
  });
}
closeModal.onclick = () => {
  modalBg.style.display = "none";
  pdfDoc = null;
  pdfCanvas.height = pdfCanvas.width = 0;
};

modalBg.onclick = e => {
  if(e.target === modalBg){
    modalBg.style.display = "none";
    pdfDoc = null;
    pdfCanvas.height = pdfCanvas.width = 0;
  }
};