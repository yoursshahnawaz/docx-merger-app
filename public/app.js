(() => {
  const MAX_FILES = 3;

  let files = [];
  let dragSrcIndex = null;
  let progressTimer = null;

  const dropZone        = document.getElementById('dropZone');
  const fileInput       = document.getElementById('fileInput');
  const fileList        = document.getElementById('fileList');
  const fileListSection = document.getElementById('fileListSection');
  const fileCount       = document.getElementById('fileCount');
  const clearBtn        = document.getElementById('clearBtn');
  const mergeBtn        = document.getElementById('mergeBtn');
  const statusEl        = document.getElementById('status');
  const downloadBtn     = document.getElementById('downloadBtn');
  const progressWrap    = document.getElementById('progressWrap');
  const progressFill    = document.getElementById('progressFill');
  const step1           = document.getElementById('step1');
  const step2           = document.getElementById('step2');
  const step3           = document.getElementById('step3');

  // ── Drop zone ──
  dropZone.addEventListener('click', () => { if (files.length < MAX_FILES) fileInput.click(); });
  fileInput.addEventListener('change', e => addFiles(Array.from(e.target.files)));
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    addFiles(Array.from(e.dataTransfer.files).filter(f => f.name.toLowerCase().endsWith('.docx')));
  });

  clearBtn.addEventListener('click', () => { files = []; fileInput.value = ''; render(); hideResult(); });

  // ── File management ──
  function addFiles(incoming) {
    const valid = incoming.filter(f => f.name.toLowerCase().endsWith('.docx'));
    let added = 0;
    valid.forEach(f => {
      if (files.length >= MAX_FILES) return;
      if (!files.find(x => x.name === f.name)) { files.push(f); added++; }
    });
    if (valid.length > 0 && added === 0 && files.length >= MAX_FILES) flashLimit();
    render();
    hideResult();
  }

  function flashLimit() {
    fileListSection.classList.remove('limit-flash');
    fileListSection.offsetWidth;
    fileListSection.classList.add('limit-flash');
    setTimeout(() => fileListSection.classList.remove('limit-flash'), 600);
  }

  function removeFile(i)      { files.splice(i, 1); render(); hideResult(); }
  function moveFile(i, delta) {
    const t = i + delta;
    if (t < 0 || t >= files.length) return;
    [files[i], files[t]] = [files[t], files[i]];
    render();
  }

  // ── Render ──
  function render() {
    fileList.innerHTML = '';
    const hasFiles = files.length > 0;
    fileListSection.classList.toggle('visible', hasFiles);
    fileCount.textContent = `${files.length} of ${MAX_FILES} files`;
    mergeBtn.disabled = files.length < 2;

    // Dim drop zone when at capacity
    dropZone.style.opacity   = files.length >= MAX_FILES ? '.45' : '';
    dropZone.style.cursor    = files.length >= MAX_FILES ? 'not-allowed' : '';
    dropZone.style.pointerEvents = files.length >= MAX_FILES ? 'none' : '';

    setStep(hasFiles ? (files.length >= 2 ? 2 : 1) : 0);

    files.forEach((f, i) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.draggable = true;
      li.innerHTML = `
        <span class="drag-handle" title="Drag to reorder">
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
          </svg>
        </span>
        <svg class="file-icon" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
        </svg>
        <span class="file-name" title="${f.name}">${f.name}</span>
        <span class="file-size">${fmtSize(f.size)}</span>
        <div class="reorder-btns">
          <button class="reorder-btn" data-move="-1" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button class="reorder-btn" data-move="1"  data-idx="${i}" ${i === files.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
        <button class="remove-btn" data-idx="${i}" title="Remove">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>`;

      li.querySelectorAll('.reorder-btn').forEach(btn =>
        btn.addEventListener('click', () => moveFile(+btn.dataset.idx, +btn.dataset.move)));
      li.querySelector('.remove-btn').addEventListener('click', e =>
        removeFile(+e.currentTarget.dataset.idx));

      li.addEventListener('dragstart', () => { dragSrcIndex = i; setTimeout(() => li.classList.add('dragging'), 0); });
      li.addEventListener('dragend',   () => li.classList.remove('dragging'));
      li.addEventListener('dragover',  e => { e.preventDefault(); li.classList.add('drag-over'); });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', e => {
        e.preventDefault(); e.stopPropagation();
        li.classList.remove('drag-over');
        if (dragSrcIndex !== null && dragSrcIndex !== i) {
          const moved = files.splice(dragSrcIndex, 1)[0];
          files.splice(i, 0, moved);
          dragSrcIndex = null;
          render();
        }
      });

      fileList.appendChild(li);
    });
  }

  // ── Steps ──
  function setStep(n) {
    [step1, step2, step3].forEach((el, i) => {
      el.classList.remove('active', 'done');
      if (i + 1 === n) el.classList.add('active');
      if (i + 1 < n)  el.classList.add('done');
    });
  }

  // ── Progress bar ──
  function startProgress() {
    clearTimeout(progressTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    progressFill.offsetWidth; // force reflow

    progressWrap.classList.add('active');

    requestAnimationFrame(() => {
      progressFill.style.transition = 'width .5s cubic-bezier(.4,0,.2,1)';
      progressFill.style.width = '78%';
    });

    // Slow creep while waiting
    progressTimer = setTimeout(() => {
      progressFill.style.transition = 'width 10s linear';
      progressFill.style.width = '89%';
    }, 560);
  }

  function finishProgress(callback) {
    clearTimeout(progressTimer);
    progressFill.style.transition = 'width .2s ease-out';
    progressFill.style.width = '100%';
    setTimeout(() => {
      progressWrap.style.transition = 'opacity .3s ease';
      progressWrap.style.opacity = '0';
      setTimeout(() => {
        progressWrap.classList.remove('active');
        progressWrap.style.opacity = '';
        progressWrap.style.transition = '';
        callback && callback();
      }, 300);
    }, 260);
  }

  function resetProgress() {
    clearTimeout(progressTimer);
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    progressWrap.classList.remove('active');
    progressWrap.style.opacity = '';
    progressWrap.style.transition = '';
  }

  // ── Merge ──
  mergeBtn.addEventListener('click', async () => {
    hideResult();
    mergeBtn.disabled = true;
    mergeBtn.innerHTML = '<div class="spinner"></div> Merging…';
    startProgress();

    const form = new FormData();
    files.forEach(f => form.append('files', f));
    const mergedCount = files.length;

    try {
      const res = await fetch('/merge', { method: 'POST', body: form });
      if (!res.ok) {
        const { error } = await res.json();
        resetProgress();
        showError(error || 'Merge failed.');
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);

      finishProgress(() => {
        showSuccess(mergedCount);
        downloadBtn.href = url;
        downloadBtn.classList.add('visible');
        setStep(3);
      });
    } catch (e) {
      resetProgress();
      showError('Network error — please check your connection and try again.');
    } finally {
      mergeBtn.disabled = files.length < 2;
      mergeBtn.innerHTML = `
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
        </svg>
        Merge Documents`;
    }
  });

  // ── Status helpers ──
  function showSuccess(count) {
    statusEl.style.display = 'flex';
    statusEl.className = 'status-card status-card--success';
    statusEl.innerHTML = `
      <div class="sc-icon">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <circle class="sc-circle" cx="14" cy="14" r="12"
            stroke="#16a34a" stroke-width="2"
            transform="rotate(-90 14 14)"/>
          <path class="sc-tick"
            d="M9 14.5l3.5 3.5 6.5-7"
            stroke="#16a34a" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="sc-body">
        <div class="sc-title">Merged successfully</div>
        <div class="sc-sub">${count} document${count !== 1 ? 's' : ''} combined &mdash; your file is ready</div>
      </div>`;
  }

  function showError(msg) {
    statusEl.style.display = 'flex';
    statusEl.className = 'status-card status-card--error';
    statusEl.innerHTML = `
      <div class="sc-icon">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" stroke="#dc2626" stroke-width="2"/>
          <path d="M10 10l8 8M18 10l-8 8"
            stroke="#dc2626" stroke-width="2.2"
            stroke-linecap="round"/>
        </svg>
      </div>
      <div class="sc-body">
        <div class="sc-title">Merge failed</div>
        <div class="sc-sub">${msg}</div>
      </div>`;
  }

  function hideResult() {
    statusEl.style.display = 'none';
    statusEl.className = '';
    statusEl.innerHTML = '';
    downloadBtn.classList.remove('visible');
    downloadBtn.href = '';
    resetProgress();
  }

  // ── Utilities ──
  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── npm stats ──
  let pendingStats = null;
  let statsRevealed = false;
  const statsStrip = document.getElementById('statsStrip');

  // Reveal cards + trigger count-up when strip enters viewport
  const statsObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    statsObserver.disconnect();
    statsStrip.classList.add('revealed');
    if (pendingStats) runCountUp(pendingStats);
    statsRevealed = true;
  }, { threshold: 0.2 });
  if (statsStrip) statsObserver.observe(statsStrip);

  async function loadNpmStats() {
    try {
      const [weekly, monthly, pkg] = await Promise.all([
        fetch('https://api.npmjs.org/downloads/point/last-week/docx-merger').then(r => r.json()),
        fetch('https://api.npmjs.org/downloads/point/last-month/docx-merger').then(r => r.json()),
        fetch('https://registry.npmjs.org/docx-merger/latest').then(r => r.json()),
      ]);

      const data = { weekly: weekly.downloads, monthly: monthly.downloads, version: pkg.version };
      document.getElementById('statVersion').textContent = `v${pkg.version}`;

      if (statsRevealed) runCountUp(data);
      else pendingStats = data;

    } catch {
      ['statWeekly', 'statMonthly'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
    }
  }

  function runCountUp({ weekly, monthly }) {
    countUp(document.getElementById('statWeekly'),  weekly,  1400);
    countUp(document.getElementById('statMonthly'), monthly, 1900);
  }

  function countUp(el, target, duration) {
    if (!el) return;
    const start = performance.now();
    (function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out quart
      el.textContent = fmtNum(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toLocaleString();
  }

  loadNpmStats();

  // ── Copy button ──
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('npm install docx-merger').then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1800);
      });
    });
  }
})();
