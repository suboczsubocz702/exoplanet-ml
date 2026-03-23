const resultArea = document.getElementById('resultArea');

if (!resultArea) {
    console.error('Critical: resultArea element not found');
}
const navBtns = document.querySelectorAll('.nav-btn');
const panes = document.querySelectorAll('.tab-pane');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        navBtns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(targetId).classList.add('active');
        
        if (targetId === 'tab-model' && window.MathJax) {
            MathJax.typesetPromise();
        }
    });
});

const snrInput = document.getElementById('snr');
const depthInput = document.getElementById('depth');
const durationInput = document.getElementById('duration');
const pradInput = document.getElementById('prad');
const periodInput = document.getElementById('period');
const impactInput = document.getElementById('impact');
const predictBtn = document.getElementById('predictBtn');

const API_URL = 'https://exoplanet-ml.onrender.com/predict';

function fallbackPrediction(data) {
    const { snr, depth, duration, prad, period, impact } = data;
    
    let score = 0.5;
    
    // SNR: Primary detection significance
    if (snr > 15) score += 0.20;
    else if (snr > 8) score += 0.10;
    else if (snr < 5) score -= 0.15;
    
    // Depth: Physical plausibility
    if (depth > 100 && depth < 5000) score += 0.15;
    else if (depth < 50) score -= 0.20;
    
    // Duration: Typical transit window
    if (duration > 1.5 && duration < 10) score += 0.10;
    else if (duration < 0.5) score -= 0.15;
    
    // Radius ratio: Planet-like scale
    if (prad > 0.5 && prad < 3) score += 0.10;
    else if (prad > 5) score -= 0.10;
    
    // Impact parameter: Central transits favor planets
    if (impact < 0.4) score += 0.15;
    else if (impact > 0.8) score -= 0.15;
    
    const probability = Math.min(0.95, Math.max(0.05, score));
    const prediction = probability > 0.55 ? 1 : 0;
    
    return { probability, prediction };
}

function renderResult(probability, prediction, isFallback) {
    const percent = (probability * 100).toFixed(1);
    
    let category = '';
    let color = '';
    let infoNote = '';
    
    if (probability > 0.7) {
        category = 'EXOPLANET CANDIDATE';
        color = '#22c55e';
    } else if (probability > 0.55 && probability <= 0.7) {
        category = 'EXOPLANET CANDIDATE';
        color = '#8b5cf6';
    } else if (probability > 0.45 && probability <= 0.55) {
        category = 'UNCERTAIN SIGNAL';
        color = '#f59e0b';
        infoNote = `
            <div style="background: rgba(59,130,246,0.1); border-radius: 0.75rem; padding: 0.75rem; margin-top: 1rem; font-size: 0.75rem; text-align: left;">
                ℹ️ <strong>Why is this borderline?</strong> The model learned that long-period signals with moderate SNR are often false positives in Kepler data. Real planets with these parameters require more transits for confirmation.
            </div>
        `;
    } else if (probability > 0.3 && probability <= 0.45) {
        category = 'LIKELY FALSE POSITIVE';
        color = '#f97316';
        infoNote = `
            <div style="background: rgba(59,130,246,0.1); border-radius: 0.75rem; padding: 0.75rem; margin-top: 1rem; font-size: 0.75rem; text-align: left;">
                ℹ️ <strong>Why is this borderline?</strong> The model learned that long-period signals with moderate SNR are often false positives in Kepler data. Real planets with these parameters require more transits for confirmation.
            </div>
        `;
    } else {
        category = 'FALSE POSITIVE';
        color = '#ef4444';
    }
    
    const fallbackNote = isFallback ? `
        <div style="background: rgba(245,158,11,0.15); border-radius: 0.75rem; padding: 0.5rem; margin-bottom: 1rem; font-size: 0.7rem;">
            API unavailable — using scientific approximation model
        </div>
    ` : '';
    
    resultArea.innerHTML = `
        ${fallbackNote}
        <div style="text-align: center;">
            <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.75rem; color: ${color}">
                ${category}
            </div>
            <div style="margin: 1rem 0;">
                <div style="background: rgba(0,0,0,0.4); border-radius: 1rem; height: 8px;">
                    <div style="background: ${color}; width: ${percent}%; height: 100%; border-radius: 1rem;"></div>
                </div>
                <div style="font-size: 1.2rem; margin-top: 0.5rem;">${percent}% confidence</div>
            </div>
            <div style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.7;">
                Classification threshold: 55%
            </div>
            <div style="font-size: 0.7rem; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; margin-top: 0.5rem;">
                Gradient Boosting | Log Loss Optimized
            </div>
            ${infoNote}
        </div>
    `;
}

async function getPrediction(data) {
    if (!resultArea) return;
    
    resultArea.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="display: inline-block; width: 24px; height: 24px; border: 2px solid #60a5fa; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem;">Loading model prediction...</div>
        </div>
    `;
    
    if (!document.querySelector('#spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        const probability = result.probability ?? (result.prediction === 1 ? 0.85 : 0.25);
        const prediction = result.prediction ?? (probability > 0.55 ? 1 : 0);
        
        renderResult(probability, prediction, false);
        
    } catch (error) {
        console.warn('API fallback:', error.message);
        const fallback = fallbackPrediction(data);
        renderResult(fallback.probability, fallback.prediction, true);
    }
}

predictBtn?.addEventListener('click', () => {
    const payload = {
        snr: parseFloat(snrInput?.value),
        depth: parseFloat(depthInput?.value),
        duration: parseFloat(durationInput?.value),
        prad: parseFloat(pradInput?.value),
        period: parseFloat(periodInput?.value),
        impact: parseFloat(impactInput?.value)
    };
    
    if (Object.values(payload).some(v => isNaN(v))) {
        if (resultArea) {
            resultArea.innerHTML = '<div style="color: #f87171; text-align: center;">Please fill all fields with valid numbers</div>';
        }
        return;
    }
    
    getPrediction(payload);
});

const examples = {
    'kepler-22b': { snr: 15.2, depth: 520, duration: 5.8, prad: 2.4, period: 289, impact: 0.2 },
    'false-positive': { snr: 4.1, depth: 90, duration: 1.2, prad: 0.3, period: 3.7, impact: 0.85 },
    'hot-jupiter': { snr: 28.5, depth: 1280, duration: 3.2, prad: 1.1, period: 3.5, impact: 0.4 },
    'super-earth': { snr: 9.8, depth: 210, duration: 4.5, prad: 1.3, period: 129, impact: 0.15 }
};

document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-example');
        const ex = examples[key];
        if (ex && snrInput && depthInput && durationInput && pradInput && periodInput && impactInput) {
            snrInput.value = ex.snr;
            depthInput.value = ex.depth;
            durationInput.value = ex.duration;
            pradInput.value = ex.prad;
            periodInput.value = ex.period;
            impactInput.value = ex.impact;
            updateTransitCurve();
            predictBtn?.click();
        }
    });
});

let transitChart = null;

function updateTransitCurve() {
    const depth = parseFloat(depthInput?.value) || 400;
    const duration = parseFloat(durationInput?.value) || 4;
    const impact = parseFloat(impactInput?.value) || 0.35;
    
    const times = [];
    const fluxes = [];
    const steps = 100;
    const halfDur = duration / 2;
    
    for (let i = 0; i <= steps; i++) {
        const t = -halfDur + (i * duration / steps);
        times.push(t.toFixed(1));
        
        let fluxDrop = 0;
        const absT = Math.abs(t);
        
        if (absT < halfDur) {
            const ingress = Math.min(0.2 * duration, 0.5);
            if (absT < ingress) fluxDrop = (depth / 10000) * (absT / ingress);
            else if (absT < halfDur - ingress) fluxDrop = depth / 10000;
            else fluxDrop = (depth / 10000) * ((halfDur - absT) / ingress);
            
            const impactFactor = Math.sqrt(Math.max(0.05, 1 - Math.min(0.95, impact * impact)));
            fluxDrop = Math.min(0.12, fluxDrop * impactFactor);
        }
        
        fluxes.push(1 - fluxDrop);
    }
    
    const canvas = document.getElementById('transitCurve');
    if (!canvas) return;
    
    if (transitChart) transitChart.destroy();
    
    transitChart = new Chart(canvas, {
        type: 'line',
        data: { labels: times, datasets: [{ label: 'Relative Flux', data: fluxes, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.05)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3 }] },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { labels: { color: '#cbd5e6', font: { size: 10 } } } },
            scales: {
                y: { title: { display: true, text: 'Flux', color: '#94a3b8' }, ticks: { color: '#94a3b8', callback: v => (v * 100).toFixed(0) + '%' }, min: 0.95, max: 1.005 },
                x: { title: { display: true, text: 'Time (hours)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

depthInput?.addEventListener('input', updateTransitCurve);
durationInput?.addEventListener('input', updateTransitCurve);
impactInput?.addEventListener('input', updateTransitCurve);

updateTransitCurve();

console.log('API:', API_URL);
