window.addEventListener('load', () => {
  if (!sessionStorage.getItem('loaderShown')) {
  setTimeout(() => {
    document.body.classList.add('loaded');
    sessionStorage.setItem('loaderShown', 'true');
  }, 2600);
  } else {
    document.body.classList.add('loaded');
  }
});