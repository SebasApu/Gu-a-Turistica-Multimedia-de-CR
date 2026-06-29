class AudioGuia extends HTMLElement {
  static get observedAttributes() {
    return ["src", "label", "duration"];
  }

  constructor() {
    super();
    this._src          = "";
    this._label        = "Audio guía";
    this._isPlaying    = false;
    this._duration     = 0;
    this._currentTime  = 0;
    this._displayTime  = 0;
    this._manualDuration = 0;
    this._instanceId   = `audio-guia-${Math.floor(Math.random() * 1e9)}`;
    this._rafId        = null;
    this.attachShadow({ mode: "open" });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    this._src            = this.getAttribute("src")      || "";
    this._label          = this.getAttribute("label")    || "Esperando selección de destino...";
    this._manualDuration = Number(this.getAttribute("duration")) || 0;
    if (this._manualDuration > 0) this._duration = this._manualDuration;

    this._render();
    this._attachListeners();
    document.addEventListener("audio:request-play", this._onExternalRequestPlay);
  }

  disconnectedCallback() {
    this._removeListeners();
    document.removeEventListener("audio:request-play", this._onExternalRequestPlay);
    this._stopRaf();
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;
    if (name === "src") {
      this._src = newV || "";
      this._resetAudioForNewSrc();
    } else if (name === "label") {
      this._label = newV || "Audio guía";
      if (this._labelEl) this._labelEl.textContent = this._label;
      this._updateButton();
    } else if (name === "duration") {
      this._manualDuration = Number(newV) || 0;
      if (!this._duration && this._manualDuration) this._duration = this._manualDuration;
      this._updateUI();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; }

        .card {
          background: #fff;
          border-radius: 12px;
          padding: .9rem;
          border: 1px solid #e6eef8;
          max-width: 100%;
        }

        .row {
          display: flex;
          align-items: center;
          gap: .75rem;
          justify-content: space-between;
        }

        .label { font-weight: 700; color: #0f172a; flex: 1; }

        .btn {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: none;
          background: #2563eb;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform .12s ease;
        }

        .btn:active          { transform: scale(.98); }
        .btn[disabled]       { background: #cbd5e1; cursor: not-allowed; }

        .progress-wrap {
          margin-top: .6rem;
          height: 12px;
          background: #eef2ff;
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
        }

        .progress {
          display: block;
          height: 100%;
          width: 100%;
          transform-origin: left center;
          transform: scaleX(0);
          will-change: transform;
          transition: transform 120ms linear;
          background: linear-gradient(90deg, #2563eb, #22c55e);
          box-shadow: 0 1px 4px rgba(37,99,235,.12) inset;
        }

        .times {
          display: flex;
          justify-content: space-between;
          margin-top: .5rem;
          font-size: .85rem;
          color: #475569;
        }

        .empty { color: #64748b; margin-top: .6rem; font-size: .95rem; }

        audio { display: none; }
      </style>

      <div class="card">
        <div class="row">
          <div class="label">${this._label}</div>
          <button class="btn" type="button" aria-label="Reproducir audio">►</button>
        </div>

        <div class="progress-wrap"
          role="progressbar"
          tabindex="0"
          aria-label="Barra de progreso de audio"
          aria-valuemin="0"
          aria-valuemax="0"
          aria-valuenow="0">
          <div class="progress"></div>
        </div>

        <div class="times">
          <span class="current">0:00</span>
          <span class="duration">0:00</span>
        </div>

        <div class="empty" hidden>Sin archivo de audio disponible.</div>

        <audio id="audio" preload="auto"></audio>
      </div>
    `;

    this._audio        = this.shadowRoot.getElementById("audio");
    this._button       = this.shadowRoot.querySelector(".btn");
    this._labelEl      = this.shadowRoot.querySelector(".label");
    this._progressWrap = this.shadowRoot.querySelector(".progress-wrap");
    this._progressFill = this.shadowRoot.querySelector(".progress");
    this._currentEl    = this.shadowRoot.querySelector(".current");
    this._durationEl   = this.shadowRoot.querySelector(".duration");
    this._emptyEl      = this.shadowRoot.querySelector(".empty");

    if (this._src) this._audio.src = this._src;
    if (this._manualDuration && !this._duration) this._duration = this._manualDuration;
    this._updateUI();
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  _attachListeners() {
    if (!this._audio || !this._button || !this._progressWrap) return;
    this._button.addEventListener("click",            this._onToggle);
    this._progressWrap.addEventListener("click",      this._onSeek);
    this._progressWrap.addEventListener("keydown",    this._onProgressKey);
    this._audio.addEventListener("timeupdate",        this._onTimeUpdate);
    this._audio.addEventListener("loadedmetadata",    this._onLoadedMeta);
    this._audio.addEventListener("play",              this._onPlay);
    this._audio.addEventListener("pause",             this._onPause);
    this._audio.addEventListener("ended",             this._onEnded);
    this._audio.addEventListener("error",             this._onError);
  }

  _removeListeners() {
    if (!this._audio || !this._button || !this._progressWrap) return;
    this._button.removeEventListener("click",         this._onToggle);
    this._progressWrap.removeEventListener("click",   this._onSeek);
    this._progressWrap.removeEventListener("keydown", this._onProgressKey);
    this._audio.removeEventListener("timeupdate",     this._onTimeUpdate);
    this._audio.removeEventListener("loadedmetadata", this._onLoadedMeta);
    this._audio.removeEventListener("play",           this._onPlay);
    this._audio.removeEventListener("pause",          this._onPause);
    this._audio.removeEventListener("ended",          this._onEnded);
    this._audio.removeEventListener("error",          this._onError);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────

  _resetAudioForNewSrc() {
    if (this._audio) {
      this._audio.pause();
      this._audio.currentTime = 0;
      this._audio.src = this._src || "";
      this._audio.load();
    }
    this._isPlaying   = false;
    this._currentTime = 0;
    this._displayTime = 0;
    this._duration    = this._manualDuration || 0;
    this._stopRaf();
    this._updateUI();
  }

  _onToggle = () => {
    if (!this._src) return;
    if (this._audio.paused) {
      document.dispatchEvent(new CustomEvent("audio:request-play", {
        detail: { instanceId: this._instanceId },
        bubbles: true,
        composed: true,
      }));
      this._audio.play().catch(() => {
        this._isPlaying = false;
        this._updateButton();
      });
    } else {
      this._audio.pause();
    }
  };

  _onExternalRequestPlay = (ev) => {
    const otherId = ev?.detail?.instanceId;
    if (otherId && otherId !== this._instanceId && this._audio && !this._audio.paused) {
      this._audio.pause();
    }
  };

  _onTimeUpdate = () => {
    this._currentTime = this._audio.currentTime || 0;
    if (!this._duration && Number.isFinite(this._audio.duration) && this._audio.duration > 0) {
      this._duration = this._audio.duration;
    }
  };

  _onLoadedMeta = () => {
    this._duration = (Number.isFinite(this._audio.duration) && this._audio.duration > 0)
      ? this._audio.duration
      : (this._manualDuration || 0);
    this._updateUI();
  };

  _onPlay = () => {
    this._isPlaying = true;
    this._updateButton();
    this._startRaf();
    this.dispatchEvent(new CustomEvent("audio:play", { bubbles: true, composed: true }));
  };

  _onPause = () => {
    this._isPlaying = false;
    this._updateButton();
    this._stopRaf();
    this.dispatchEvent(new CustomEvent("audio:pause", { bubbles: true, composed: true }));
  };

  _onEnded = () => {
    this._isPlaying       = false;
    this._audio.currentTime = 0;
    this._displayTime     = 0;
    this._updateButton();
    this._updateProgress();
    this._stopRaf();
    this.dispatchEvent(new CustomEvent("audio:ended", { bubbles: true, composed: true }));
  };

  _onError = () => {
    this._duration    = 0;
    this._currentTime = 0;
    this._displayTime = 0;
    this._updateUI();
  };

  _onSeek = (ev) => {
    if (!this._duration) return;
    const rect    = this._progressWrap.getBoundingClientRect();
    const clientX = ev.touches?.[0]?.clientX ?? ev.clientX ?? 0;
    const ratio   = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    this._audio.currentTime = ratio * this._duration;
    this._currentTime = this._displayTime = this._audio.currentTime;
    this._updateProgress();
  };

  _onProgressKey = (e) => {
    if (!this._duration) return;
    const step = Math.max(1, Math.floor(this._duration / 20));
    if (e.key === "ArrowRight") this._audio.currentTime = Math.min(this._duration, this._audio.currentTime + step);
    if (e.key === "ArrowLeft")  this._audio.currentTime = Math.max(0, this._audio.currentTime - step);
    this._currentTime = this._displayTime = this._audio.currentTime;
    this._updateProgress();
  };

  // ─── RAF ──────────────────────────────────────────────────────────────────

  _startRaf() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(this._rafLoop);
  }

  _stopRaf() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _rafLoop = () => {
    const target = this._audio?.currentTime ?? this._currentTime ?? 0;
    this._displayTime += (target - this._displayTime) * 0.12;
    if (Math.abs(target - this._displayTime) < 0.02) this._displayTime = target;
    this._updateProgress(true);
    this._rafId = requestAnimationFrame(this._rafLoop);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────

  _updateUI() {
    if (this._button)       this._button.disabled = !this._src;
    if (this._emptyEl)      this._emptyEl.hidden  =  Boolean(this._src);
    if (this._labelEl)      this._labelEl.textContent   = this._label;
    if (this._durationEl)   this._durationEl.textContent = this._formatTime(this._duration);
    if (this._currentEl)    this._currentEl.textContent  = this._formatTime(this._currentTime);
    if (this._progressWrap) {
      this._progressWrap.setAttribute("aria-valuemax", String(Math.floor(this._duration || 0)));
      this._progressWrap.setAttribute("aria-valuenow", String(Math.floor(this._currentTime || 0)));
    }
    this._updateButton();
    this._updateProgress();
  }

  _updateButton() {
    if (!this._button) return;
    const playing = this._isPlaying;
    this._button.textContent = playing ? "❚❚" : "►";
    this._button.setAttribute("aria-label", `${playing ? "Pausar" : "Reproducir"} ${this._label || "audio"}`);
  }

  _updateProgress(fromRaf = false) {
    if (!this._progressFill) return;

    const dur = this._duration > 0
      ? this._duration
      : (Number.isFinite(this._audio?.duration) ? this._audio.duration : 0);

    const cur     = fromRaf ? this._displayTime : (this._audio?.currentTime ?? this._currentTime ?? 0);
    const clamped = dur ? Math.max(0, Math.min(1, cur / dur)) : 0;

    this._progressFill.style.transform = `scaleX(${clamped})`;

    if (this._currentEl)  this._currentEl.textContent  = this._formatTime(cur);
    if (this._durationEl) this._durationEl.textContent = this._formatTime(dur);
    if (this._progressWrap) {
      this._progressWrap.setAttribute("aria-valuenow", String(Math.floor(cur)));
      this._progressWrap.setAttribute("aria-valuemax", String(Math.floor(dur)));
    }
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  _formatTime(value) {
    const s = Number.isFinite(value) ? Math.floor(value) : 0;
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // ─── API pública ──────────────────────────────────────────────────────────

  play()              { return this._audio?.play(); }
  pause()             { return this._audio?.pause(); }
  seek(seconds)       { if (this._audio && Number.isFinite(seconds)) this._audio.currentTime = seconds; }
  get playing()       { return !!(this._audio && !this._audio.paused && !this._audio.ended); }
}

customElements.define("audio-guia", AudioGuia);
export default AudioGuia;