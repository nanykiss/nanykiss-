/* ==========================================================================
   NANY KISS CRM - MÓDULO DE CLIENTES (styles.css)
   ========================================================================== */

:root {
    --nk-primary: #e91e63;
    --nk-primary-dark: #c2185b;
    --nk-secondary: #9c27b0;
    --nk-bg: #f8f9fa;
    --nk-card-bg: #ffffff;
    --nk-text: #2c3e50;
    --nk-muted: #7f8c8d;
    --nk-border: #e2e8f0;
    --nk-success: #2ecc71;
    --nk-warning: #f39c12;
    --nk-danger: #e74c3c;
    --nk-radius: 10px;
    --nk-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* RESETEO Y UTILIDADES */
* {
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background-color: var(--nk-bg);
    color: var(--nk-text);
    margin: 0;
    padding: 0;
}

.hidden {
    display: none !important;
}

.content-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* ENCABEZADO Y BARRA DE ACCIONES */
.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background-color: #ffffff;
    border-bottom: 1px solid var(--nk-border);
    flex-wrap: wrap;
    gap: 15px;
}

.header-title h2 {
    margin: 0;
    color: var(--nk-primary-dark);
    font-size: 1.4rem;
}

.header-title p {
    margin: 4px 0 0 0;
    color: var(--nk-muted);
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

/* BUSCADOR DE CLIENTES */
.search-bar-section {
    margin-bottom: 20px;
}

.search-bar-section .form-control {
    font-size: 1rem;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}

/* GRID Y TARJETAS DE CLIENTES */
.clientes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.card-cliente {
    background: var(--nk-card-bg);
    border-radius: var(--nk-radius);
    border: 1px solid var(--nk-border);
    box-shadow: var(--nk-shadow);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-cliente:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* Bordes indicadores de deuda */
.card-cliente.con-deuda {
    border-left: 5px solid var(--nk-danger);
}

.card-cliente.al-dia {
    border-left: 5px solid var(--nk-success);
}

.card-header-cliente {
    padding: 14px 16px;
    background: #ffffff;
    border-bottom: 1px solid var(--nk-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header-cliente h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--nk-text);
}

.card-body-cliente {
    padding: 16px;
    font-size: 0.9rem;
    color: var(--nk-muted);
}

.card-body-cliente p {
    margin: 6px 0;
}

/* ACCIONES DE LA TARJETA */
.card-actions-cliente {
    padding: 12px 16px;
    background: #fafafa;
    border-top: 1px solid var(--nk-border);
    display: flex;
    gap: 8px;
}

/* BADGES DE SALDO / ESTADO */
.badge-saldo {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.badge-saldo.zero {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.badge-saldo.deuda {
    background-color: #ffebee;
    color: #c62828;
}

/* BOTONES GENERALES */
.btn {
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s, transform 0.1s;
}

.btn:active {
    transform: scale(0.98);
}

.btn-primary {
    background-color: var(--nk-primary);
    color: #ffffff;
}

.btn-primary:hover {
    background-color: var(--nk-primary-dark);
}

.btn-campana {
    background-color: var(--nk-secondary);
    color: #ffffff;
}

.btn-campana:hover {
    background-color: #7b1fa2;
}

.btn-secondary {
    background-color: #6c757d;
    color: #ffffff;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.btn-success {
    background-color: #28a745;
    color: #ffffff;
}

.btn-success:hover {
    background-color: #218838;
}

.btn-whatsapp {
    background-color: #25d366;
    color: #ffffff;
}

.btn-whatsapp:hover {
    background-color: #1ebe57;
}

/* Botones pequeños dentro de tarjeta */
.btn-sm {
    padding: 6px 10px;
    font-size: 0.8rem;
    flex: 1;
    justify-content: center;
}

.btn-outline {
    background: #ffffff;
    border: 1px solid var(--nk-primary);
    color: var(--nk-primary);
}

.btn-outline:hover {
    background: var(--nk-primary);
    color: #ffffff;
}

.btn-outline-success {
    background: #ffffff;
    border: 1px solid var(--nk-success);
    color: var(--nk-success);
}

.btn-outline-success:hover {
    background: var(--nk-success);
    color: #ffffff;
}

/* MODALES & CAPAS POSTERIORES */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-card {
    background: #ffffff;
    border-radius: var(--nk-radius);
    width: 90%;
    max-width: 520px;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    animation: nkSlideDown 0.2s ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--nk-border);
    padding-bottom: 12px;
    margin-bottom: 16px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.15rem;
    color: var(--nk-primary-dark);
}

.btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--nk-muted);
}

.btn-close:hover {
    color: var(--nk-text);
}

/* FORMULARIO CONTROLES */
.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--nk-text);
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--nk-border);
    border-radius: 6px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.9rem;
    transition: border-color 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--nk-primary);
    box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid var(--nk-border);
}

@keyframes nkSlideDown {
    from { transform: translateY(-15px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* RESPONSIVO */
@media (max-width: 600px) {
    .module-header {
        flex-direction: column;
        align-items: flex-start;
    }
    .action-buttons {
        width: 100%;
    }
    .action-buttons .btn {
        flex: 1;
    }
}