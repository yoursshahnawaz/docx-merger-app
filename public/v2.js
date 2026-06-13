// v2 release page — small progressive enhancements.

// ── Animate performance bars when scrolled into view ──
(() => {
  const perf = document.getElementById('perf');
  if (!perf) return;
  const bars = perf.querySelectorAll('.perf__bar');
  const reveal = () => bars.forEach(b => { b.style.width = b.dataset.w + '%'; });

  if (!('IntersectionObserver' in window)) { reveal(); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { reveal(); io.disconnect(); }
    });
  }, { threshold: 0.4 });
  io.observe(perf);
})();

// ── Copy install command (matches the home page behaviour) ──
(() => {
  const copyBtn = document.getElementById('copyBtn');
  if (!copyBtn) return;
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('npm install docx-merger@2').then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1800);
    });
  });
})();
