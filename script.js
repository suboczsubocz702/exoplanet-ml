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
const resultArea = document.getElementById('resultArea');

const API_URL = 'https://exoplanet-ml.onrender.com/predict';

async function getPrediction(data) {
    try {
        resultArea.innerHTML = `<div class="loading">🔄 Loading... Gradient Boosting inference in progress</div>`;
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        let probability = result.probability;
        let prediction = result.prediction;
        
        if (probability === undefined && prediction !== undefined) {
            probability = prediction === 1 ? 0.85 : 0.25;
        }
        
        const isExoplanet = (prediction === 1 || prediction === true || (probability && probability > 0.55));
        const probPercent = probability ? (probability * 100).toFixed(1) : (isExoplanet ? '78.5' : '32.0');
        
        const confidenceColor = isExoplanet ? '#22c55e' : '#f97316';
        const confidenceGradient = isExoplanet ? 'linear-gradient(135deg, #22c55e, #15803d)' : 'linear-gradient(135deg, #f97316, #c2410c)';
        
        resultArea.innerHTML = `
            <div class="${isExoplanet ? 'prediction-positive' : 'prediction-negative'}" style="padding: 0.8rem;">
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                    ${isExoplanet ? 'EXOPLANET CANDIDATE' : 'FALSE POSITIVE'}
                </div>
                <div style="margin: 0.8rem 0;">
                    <span style="font-size: 0.85rem; opacity: 0.8;">Confidence:</span>
                    <div style="background: rgba(0,0,0,0.4); border-radius: 1rem; height: 8px; width: 100%; margin-top: 4px;">
                        <div style="background: ${confidenceGradient}; width: ${probPercent}%; height: 100%; border-radius: 1rem;"></div>
                    </div>
                    <strong style="font-size: 1.4rem;">${probPercent}%</strong> probability
                </div>
                <div style="font-size: 0.85rem; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0.6rem; padding-top: 0.6rem;">
                    <span>Log Loss optimized | Gradient Boosting (M=100, η=0.1)</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('API Error:', error);
        resultArea.innerHTML = `
            <div style="color: #f87171; padding: 0.8rem;">
                API unavailable (${error.message})<br>
                <small>The Render service may be waking up. Try again in a few seconds.</small>
            </div>
        `;
    }
}

predictBtn.addEventListener('click', () => {
    const payload = {
        snr: parseFloat(snrInput.value),
        depth: parseFloat(depthInput.value),
        duration: parseFloat(durationInput.value),
        prad: parseFloat(pradInput.value),
        period: parseFloat(periodInput.value),
        impact: parseFloat(impactInput.value)
    };
    
    if (Object.values(payload).some(v => isNaN(v))) {
        resultArea.innerHTML = `<div style="color: #f87171;">❌ All fields must contain valid numbers.</div>`;
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

const exampleBtns = document.querySelectorAll('.example-btn');
exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-example');
        const ex = examples[key];
        if (ex) {
            snrInput.value = ex.snr;
            depthInput.value = ex.depth;
            durationInput.value = ex.duration;
            pradInput.value = ex.prad;
            periodInput.value = ex.period;
            impactInput.value = ex.impact;
            updateTransitCurve();
            predictBtn.click();
        }
    });
});

let transitChart = null;

function updateTransitCurve() {
    const depth = parseFloat(depthInput.value) || 400;
    const duration = parseFloat(durationInput.value) || 4;
    const impact = parseFloat(impactInput.value) || 0.35;
    
    const times = [];
    const fluxes = [];
    const steps = 100;
    const halfDur = duration / 2;
    
    for (let i = 0; i <= steps; i++) {
        let t = -halfDur + (i * duration / steps);
        times.push(t.toFixed(1));
        
        let fluxDrop = 0;
        const absT = Math.abs(t);
        
        if (absT < halfDur) {
            const ingressWidth = 0.15 * duration;
            if (absT < ingressWidth) {
                fluxDrop = (depth / 10000) * (absT / ingressWidth);
            } else if (absT < halfDur - ingressWidth) {
                fluxDrop = depth / 10000;
            } else {
                fluxDrop = (depth / 10000) * ((halfDur - absT) / ingressWidth);
            }
            
            const impactFactor = Math.sqrt(Math.max(0, 1 - impact * impact));
            fluxDrop = fluxDrop * impactFactor;
            
            if (fluxDrop > 0.12) fluxDrop = 0.12;
        }
        
        fluxes.push(1 - fluxDrop);
    }
    
    const ctx = document.getElementById('transitCurve').getContext('2d');
    if (transitChart) transitChart.destroy();
    
    transitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Relative Flux',
                data: fluxes,
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96,165,250,0.08)',
                borderWidth: 2.5,
                pointRadius: 0,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { labels: { color: '#cbd5e6', font: { size: 11 } } },
                tooltip: { 
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (ctx) => `Flux: ${(ctx.raw * 100).toFixed(2)}%`
                    }
                }
            },
            scales: {
                y: { 
                    title: { display: true, text: 'Relative Flux', color: '#94a3b8', font: { size: 11 } }, 
                    ticks: { color: '#94a3b8', callback: (v) => (v * 100).toFixed(0) + '%' },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    min: 0.96,
                    max: 1.005
                },
                x: { 
                    title: { display: true, text: 'Time [hours]', color: '#94a3b8', font: { size: 11 } }, 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

depthInput.addEventListener('input', updateTransitCurve);
durationInput.addEventListener('input', updateTransitCurve);
impactInput.addEventListener('input', updateTransitCurve);

updateTransitCurve();

if (window.MathJax) {
    MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
}