export class Header {
  public static render(): string {
    return `
      <header class="app-header">
        <div class="brand-wrapper">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 class="brand-title">HumanTextSuite</h1>
            <p class="brand-subtitle">Detector probabilístico de IA & Motor de Humanización v1.2.0</p>
          </div>
        </div>

        <div class="header-status">
          <div class="badge-engine">
            <span class="badge-pulse"></span>
            Motor Heurístico & N-Gramas Activo
          </div>
        </div>
      </header>
    `;
  }
}
