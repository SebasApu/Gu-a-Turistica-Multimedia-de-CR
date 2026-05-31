class AudioGuia extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'label'];
  }

  constructor() {
    super();

    this._src = '';
    this._label = 'Audio guía';
    this._isPlaying = false;
    this._duration = 0;
    this._currentTime = 0;

    this.attachShadow({ mode: 'open' });

    this._bound = {
      toggle: this._togglePlay.bind(this),
      timeupdate: this._onTimeUpdate.bind(this),
      loadedmetadata: this._onLoadedMetadata.bind(this),
      play: this._onPlay.bind(this),
      pause: this._onPause.bind(this),
      ended: this._onEnded.bind(this),
      error: this._onError.bind(this),
      seek: this._onSeek.bind(this),
    };
  }

  connectedCallback() {
    this._src = this.getAttribute('src') || '';
    this._label = this.getAttribute('label') || 'Audio guía';
    this._render();
    this._attachListeners();
  }

  disconnectedCallback() {
    this._removeListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'src') {
      this._src = newValue || '';
      if (this._audio) {
        this._audio.src = this._src;
        this._audio.load();
        this._currentTime = 0;
        this._duration = 0;
        this._updateUI();
      }
    }

    if (name === 'label') {
      this._label = newValue || 'Audio guía';
      if (this._labelEl) {
        this._labelEl.textContent = this._label;
      }
      this._updateButton();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
        }

        .audio-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          padding: 1rem;
          max-width: 100%;
        }

        .info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.85rem;
        }

        .label {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.95rem;
          line-height: 1.4;
          flex: 1;
        }

        .toggle {
          min-width: 3rem;
          min-height: 3rem;
          border-radius: 999px;
          border: none;
          background: #2563eb;
          color: white;
          font-size: 1.15rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 180ms ease, background 180ms ease;
        }

        .toggle:hover {
          transform: scale(1.04);
          background: #1d4ed8;
        }

        .toggle:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .progress-wrap {
          position: relative;
          background: #e2e8f0;
          border-radius: 999px;
          height: 12px;
          cursor: pointer;
          overflow: hidden;
        }

        .progress {
          background: linear-gradient(90deg, #2563eb, #22c55e);
          width: 0%;
          height: 100%;
          transition: width 100ms linear;
        }

        .times {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.65rem;
          font-size: 0.85rem;
          color: #475569;
        }

        .audio-empty {
          color: #64748b;
          font-size: 0.95rem;
          margin-top: 0.8rem;
        }

        audio {
          display: none;
        }
      </style>

      <div class="audio-card">
        <div class="info">
          <div class="label">${this._label}</div>
          <button class="toggle" type="button" aria-label="Reproducir audio">►</button>
        </div>

        <div class="progress-wrap" role="progressbar" aria-label="Barra de progreso de audio" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">
          <div class="progress"></div>
        </div>

        <div class="times">
          <span class="current-time">0:00</span>
          <span class="duration-time">0:00</span>
        </div>

        <div class="audio-empty" hidden>Sin archivo de audio disponible.</div>

        <audio id="audio" preload="metadata"></audio>
      </div>
    `;

    this._audio = this.shadowRoot.getElementById('audio');
    this._button = this.shadowRoot.querySelector('.toggle');
    this._labelEl = this.shadowRoot.querySelector('.label');
    this._progressBar = this.shadowRoot.querySelector('.progress-wrap');
    this._progressFill = this.shadowRoot.querySelector('.progress');
    this._currentTimeEl = this.shadowRoot.querySelector('.current-time');
    this._durationEl = this.shadowRoot.querySelector('.duration-time');
    this._emptyState = this.shadowRoot.querySelector('.audio-empty');

    if (this._src) {
      this._audio.src = this._src;
    }

    this._updateUI();
  }

  _attachListeners() {
    if (!this._audio || !this._button || !this._progressBar) return;

    this._button.addEventListener('click', this._bound.toggle);
    this._progressBar.addEventListener('click', this._bound.seek);
    this._audio.addEventListener('timeupdate', this._bound.timeupdate);
    this._audio.addEventListener('loadedmetadata', this._bound.loadedmetadata);
    this._audio.addEventListener('play', this._bound.play);
    this._audio.addEventListener('pause', this._bound.pause);
    this._audio.addEventListener('ended', this._bound.ended);
    this._audio.addEventListener('error', this._bound.error);
  }

  _removeListeners() {
    if (!this._audio || !this._button || !this._progressBar) return;

    this._button.removeEventListener('click', this._bound.toggle);
    this._progressBar.removeEventListener('click', this._bound.seek);
    this._audio.removeEventListener('timeupdate', this._bound.timeupdate);
    this._audio.removeEventListener('loadedmetadata', this._bound.loadedmetadata);
    this._audio.removeEventListener('play', this._bound.play);
    this._audio.removeEventListener('pause', this._bound.pause);
    this._audio.removeEventListener('ended', this._bound.ended);
    this._audio.removeEventListener('error', this._bound.error);
  }

  _togglePlay() {
    if (!this._src) return;

    if (this._audio.paused) {
      this._audio.play().catch(() => {
        this._isPlaying = false;
        this._updateButton();
      });
    } else {
      this._audio.pause();
    }
  }

  _onTimeUpdate() {
    this._currentTime = this._audio.currentTime;
    this._updateProgress();
  }

  _onLoadedMetadata() {
    this._duration = this._audio.duration || 0;
    this._updateProgress();
    this._updateUI();
  }

  _onPlay() {
    this._isPlaying = true;
    this._updateButton();
  }

  _onPause() {
    this._isPlaying = false;
    this._updateButton();
  }

  _onEnded() {
    this._isPlaying = false;
    this._updateButton();
  }

  _onError() {
    this._duration = 0;
    this._audio.currentTime = 0;
    this._updateProgress();
    this._updateUI();
  }

  _onSeek(event) {
    if (!this._duration) return;

    const rect = this._progressBar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this._audio.currentTime = ratio * this._duration;
  }

  _updateUI() {
    const hasSrc = Boolean(this._src);

    if (this._button) {
      this._button.disabled = !hasSrc;
    }

    if (this._emptyState) {
      this._emptyState.hidden = hasSrc;
    }

    if (this._labelEl) {
      this._labelEl.textContent = this._label;
    }

    if (this._durationEl) {
      this._durationEl.textContent = this._formatTime(this._duration);
    }

    if (this._currentTimeEl) {
      this._currentTimeEl.textContent = this._formatTime(this._currentTime);
    }

    if (this._progressBar) {
      this._progressBar.setAttribute('aria-valuemax', String(this._duration));
      this._progressBar.setAttribute('aria-valuenow', String(this._currentTime));
    }

    this._updateButton();
    this._updateProgress();
  }

  _updateButton() {
    if (!this._button) return;

    const label = this._label || 'Audio guía';
    const actionText = this._isPlaying ? 'Pausar' : 'Reproducir';
    const symbol = this._isPlaying ? '❚❚' : '►';

    this._button.textContent = symbol;
    this._button.setAttribute('aria-label', `${actionText} ${label}`);
  }

  _updateProgress() {
    if (!this._progressFill) return;

    const percent = this._duration ? (this._currentTime / this._duration) * 100 : 0;
    this._progressFill.style.width = `${percent}%`;

    if (this._currentTimeEl) {
      this._currentTimeEl.textContent = this._formatTime(this._currentTime);
    }

    if (this._durationEl) {
      this._durationEl.textContent = this._formatTime(this._duration);
    }

    if (this._progressBar) {
      this._progressBar.setAttribute('aria-valuenow', String(this._currentTime));
    }
  }

  _formatTime(value) {
    const seconds = Number.isFinite(value) ? Math.floor(value) : 0;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${String(remainder).padStart(2, '0')}`;
  }
}

customElements.define('audio-guia', AudioGuia);
