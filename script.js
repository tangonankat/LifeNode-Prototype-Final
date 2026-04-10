
        // --- State Management ---
        const state = {
            role: null, // 'resident' or 'government'
            darkMode: true,
            activeTab: 'sos', // 'sos' (or 'monitor' for gov), 'chat', 'map', 'settings'
            sosActive: false,
            sosStage: 0, // 0: Idle, 1: Sending, 2: Sent
            isHolding: false, // For SOS Hold Interaction
            sosHoldTimer: null, // Timer reference for hold
            location: { lat: 14.5995, lng: 120.9842 },
            powerSaving: false,
            govFilter: 'All', // 'All', 'Active', 'Resolved'
            broadcastMessage: "Typhoon Signal #3 raised. Flood waters rising in Sector 4. Evacuate to higher ground immediately.",
            medicalData: {
                name: "Juan Dela Cruz",
                bloodType: "O+",
                age: "24",
                allergies: "Penicillin, Peanuts",
                condition: "Asthma (Inhaler Required)"
            },
            mapState: { x: 0, y: 0, scale: 1 }, // Map persistence state
            messages: [
                { id: 1, sender: 'System', text: 'Connected to Mesh Node #842.', time: '10:02 AM', isSystem: true },
                { id: 2, sender: 'LGU Rescue', text: 'Unit 4 dispatched to Barangay San Jose. ETA 40 mins.', time: '10:15 AM', isMe: false },
            ],
            // Government Data
            incidents: [
                { id: 101, type: 'SOS', user: 'Maria Santos', lat: 14.5999, lng: 120.9845, status: 'Active', time: '2m ago', details: { age: '34', blood: 'A+', condition: 'Pregnant (7mo)', history: 'Hypertension' } },
                { id: 102, type: 'Medical', user: 'Pedro Penduko', lat: 14.6001, lng: 120.9839, status: 'Active', time: '5m ago', details: { age: '62', blood: 'O-', condition: 'Cardiac Arrest Risk', history: 'Previous Stroke' } },
                { id: 103, type: 'Flood', user: 'System Sensor 4', lat: 14.5982, lng: 120.9850, status: 'Resolved', time: '1h ago', details: { age: 'N/A', blood: 'N/A', condition: 'Water Level: Critical', history: 'Sensor ID: #8842' } }
            ]
        };

    // --- Persistence Logic ---
    function saveState() {
        const stateToSave = {
            role: state.role,
            darkMode: state.darkMode,
            powerSaving: state.powerSaving,
            medicalData: state.medicalData
        };
        localStorage.setItem('lifeNodeState', JSON.stringify(stateToSave));
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('lifeNodeState');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.role !== undefined) state.role = parsed.role;
                if (parsed.darkMode !== undefined) state.darkMode = parsed.darkMode;
                if (parsed.powerSaving !== undefined) state.powerSaving = parsed.powerSaving;
                if (parsed.medicalData) state.medicalData = { ...state.medicalData, ...parsed.medicalData };
            }
        } catch (e) { console.error("Failed to load state", e); }
    }

        // --- Core Functions ---

        function init() {
            loadState();
            if (state.role) {
                finalizeRoleSelection(state.role);
            } else {
                renderLanding();
            }
            setInterval(updateClock, 1000);
            if (window.lucide) lucide.createIcons();
        }

        function updateClock() {
            const timeEls = document.querySelectorAll('.status-time');
            if (timeEls.length) {
                const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                timeEls.forEach(el => el.innerText = timeStr);
            }
        }

        // --- Role Selection (Landing Page) ---

        function renderLanding() {
            const mainContent = document.getElementById('main-content');
            document.getElementById('bottom-nav').classList.add('hidden');
            
            mainContent.innerHTML = `
            <section class="h-full flex flex-col items-center justify-center p-8 bg-slate-900 animate-fade-in relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <header class="mb-12 flex flex-col items-center z-10 text-center">
                    <div class="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl mb-4 border border-slate-700">
                        <i data-lucide="radio" class="w-10 h-10 text-blue-500"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-white tracking-tight text-balance">LifeNode</h1>
                    <p class="text-slate-400 text-sm mt-2">Disaster Mesh Network</p>
                </header>

                <nav class="w-full space-y-4 z-10">
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest text-center mb-6">Select User Role</p>
                    
                    <button onclick="selectRole('resident')" class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-all group">
                        <div class="bg-blue-600/20 p-3 rounded-full text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <i data-lucide="user" class="w-6 h-6"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="text-white font-bold">Resident</h3>
                            <p class="text-slate-400 text-xs">I need help or updates</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-5 h-5 text-slate-600 ml-auto"></i>
                    </button>

                    <button onclick="selectRole('government')" class="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-all group">
                        <div class="bg-green-600/20 p-3 rounded-full text-green-500 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <i data-lucide="building-2" class="w-6 h-6"></i>
                        </div>
                        <div class="text-left">
                            <h3 class="text-white font-bold">Government / LGU</h3>
                            <p class="text-slate-400 text-xs">Command Center Access</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-5 h-5 text-slate-600 ml-auto"></i>
                    </button>
                </nav>

                <div class="mt-12 text-center z-10">
                    <p class="text-[10px] text-slate-600">v1.5.0 • Off-Grid Ready</p>
                </div>
            </section>`;
            if (window.lucide) lucide.createIcons();
        }

        function selectRole(role) {
            if (role === 'government') {
                toggleGovLogin(true);
                return;
            }
            finalizeRoleSelection(role);
        }

        function toggleGovLogin(show) {
            const modal = document.getElementById('gov-login-modal');
            const input = document.getElementById('input-gov-id');
            const inputContainer = document.getElementById('gov-input-container');
            
            if (show) {
                modal.classList.remove('hidden');
                input.value = ''; // Clear previous input
                inputContainer.classList.remove('border-red-500'); // Reset error style
            } else {
                modal.classList.add('hidden');
            }
        }

        function verifyGovLogin() {
            const input = document.getElementById('input-gov-id');
            const container = document.getElementById('gov-input-container');
            
            if (input.value.trim().toUpperCase() === 'LGU-123') {
                toggleGovLogin(false);
                finalizeRoleSelection('government');
            } else {
                container.classList.add('border-red-500', 'shake');
                input.value = '';
                input.placeholder = 'Invalid Code';
                setTimeout(() => {
                    container.classList.remove('shake');
                }, 500);
            }
        }

        function finalizeRoleSelection(role) {
            state.role = role;
            saveState();
            state.activeTab = 'sos'; 
            
            // Show Nav
            const nav = document.getElementById('bottom-nav');
            nav.classList.remove('hidden');
            nav.classList.add('flex');

            // Configure Nav based on Role
            const centerIcon = document.getElementById('icon-center');
            const rightIcon = document.getElementById('icon-right');
            const rightText = document.getElementById('text-right');

            if (role === 'government') {
                centerIcon.setAttribute('data-lucide', 'activity'); // Monitor icon
                rightIcon.setAttribute('data-lucide', 'log-out');
                rightText.innerText = 'EXIT';
            } else {
                centerIcon.setAttribute('data-lucide', 'shield-alert'); // SOS icon
                rightIcon.setAttribute('data-lucide', 'user');
                rightText.innerText = 'ID';
            }

            renderScreen();
            updateNavHighlight();
            refreshIcons();
        }

        function handleRightNav() {
            if (state.role === 'government') {
                state.role = null;
                saveState();
                renderLanding();
            } else {
                toggleMedical(true);
            }
        }

        // --- Render Helpers ---

        function getStatusBarHTML() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black border-b border-gray-800' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const textClass = state.powerSaving ? 'text-yellow-400' : (isDark ? 'text-white' : 'text-slate-900');
            const battFill = state.powerSaving ? '#facc15' : 'white';
            const roleBadge = state.role === 'government' 
                ? '<span class="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-2">LGU</span>' 
                : '';
            
            return `
            <header class="${bgClass} text-white px-6 py-3 flex justify-between items-center text-xs select-none z-10 transition-colors duration-500">
                <div class="flex items-center gap-2">
                    <span class="font-bold status-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    ${state.powerSaving ? '<i data-lucide="zap" class="w-3 h-3 text-yellow-400"></i>' : ''}
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 text-green-400">
                        <i data-lucide="radio" class="w-3 h-3 animate-pulse"></i>
                        <span class="font-mono tracking-tighter">MESH: STRONG</span>
                    </div>
                    ${roleBadge}
                    <div class="flex items-center gap-1 ml-2">
                        <span class="text-xs ${textClass}">84%</span>
                        <i data-lucide="battery" class="w-4 h-4 ${textClass}" fill="${battFill}"></i>
                    </div>
                </div>
            </header>`;
        }

        function getEmergencyBannerHTML() {
            if (!state.broadcastMessage) return '';

            return `
            <aside class="bg-red-600/90 backdrop-blur-md text-white px-4 py-2 flex items-start gap-3 shadow-lg z-20">
                <i data-lucide="alert-triangle" class="w-5 h-5 shrink-0 animate-pulse mt-0.5"></i>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="text-xs font-bold uppercase tracking-wider text-balance">LGU Broadcast • NOW</h4>
                        ${state.role === 'government' ? `<button onclick="clearBroadcast()" class="text-[10px] bg-white/20 px-2 rounded hover:bg-white/30 font-bold">DISMISS</button>` : ''}
                    </div>
                    <p class="text-xs leading-tight opacity-90 mt-1">${state.broadcastMessage}</p>
                </div>
            </aside>`;
        }

        // --- Resident Screen Renders ---

        function renderResidentSOS() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const btnClass = state.sosStage === 2 
                ? 'bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40 animate-pulse' 
                : state.sosStage === 3
                    ? 'bg-blue-900/20 border-blue-500 text-blue-500 hover:bg-blue-900/40'
                : state.sosActive 
                    ? 'bg-red-600 border-red-500 text-white scale-95' 
                    : state.powerSaving 
                        ? 'bg-black border-slate-700 text-red-600 hover:border-red-600'
                        : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl') + ' text-red-500 hover:border-red-500 hover:text-red-400 hover:scale-105 active:scale-95';
            
            let statusText = "RESIDENT SAFE";
            let statusColor = "text-emerald-500";
            let statusBg = "bg-emerald-500/10 border-emerald-500/20";
            let statusIcon = "shield-check";

            if(state.sosStage === 1) { 
                statusText = "SENDING ALERT..."; 
                statusColor = "text-yellow-500";
                statusBg = "bg-yellow-500/10 border-yellow-500/20";
                statusIcon = "radio";
            }
            if(state.sosStage === 2) { 
                statusText = "RESCUE PENDING"; 
                statusColor = "text-red-500 animate-pulse";
                statusBg = "bg-red-500/10 border-red-500/20";
                statusIcon = "loader";
            }
            if(state.sosStage === 3) {
                statusText = "RESCUED";
                statusColor = "text-blue-400";
                statusBg = "bg-blue-500/10 border-blue-500/20";
                statusIcon = "check-circle-2";
            }

            const shortCondition = state.medicalData.condition.split(' ')[0];

            // Setup Hold Events
            let eventHandlers = '';
            
            if (state.sosStage === 0) {
                // Idle state: Needs hold
                eventHandlers = 'onmousedown="startSOSHold(event)" ontouchstart="startSOSHold(event)" onmouseup="cancelSOSHold()" ontouchend="cancelSOSHold()" onmouseleave="cancelSOSHold()" oncontextmenu="return false;" style="touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none;"';
            } else if (state.sosStage === 2 || state.sosStage === 3) {
                // Pending or Rescued state: Click to advance/reset
                eventHandlers = 'onclick="handleSOS()"';
            }

            const cardBg = state.powerSaving ? 'bg-black border-slate-800' : (isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm');
            const textColor = isDark ? 'text-slate-200' : 'text-slate-800';

            return `
            <section class="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden ${bgClass} transition-colors duration-500 animate-fade-in">
                
                ${state.sosActive && state.sosStage === 1 ? `
                <div class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <div class="w-64 h-64 bg-red-600/20 rounded-full animate-ping-slow absolute"></div>
                    <div class="w-48 h-48 bg-red-600/30 rounded-full animate-ping absolute delay-75"></div>
                </div>` : ''}

                <div class="z-10 w-full max-w-xs flex flex-col items-center gap-6">
                    <div class="text-center space-y-2 mt-4">
                        <h2 class="${isDark ? 'text-slate-400' : 'text-slate-500'} text-[10px] uppercase tracking-widest font-bold">Current Status</h2>
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusBg}">
                            <i data-lucide="${statusIcon}" class="w-4 h-4 ${statusColor}"></i>
                            <span class="text-sm font-black tracking-wide ${statusColor}">${statusText}</span>
                        </div>
                    </div>

                    <button ${eventHandlers} class="w-56 h-56 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl relative overflow-hidden ${btnClass}">
                        <div id="sos-hold-overlay" class="absolute inset-0 bg-red-600 rounded-full scale-0 pointer-events-none"></div>
                        
                        <div class="relative z-10 flex flex-col items-center">
                            ${state.sosStage === 3 ? `
                                <i data-lucide="check-circle-2" class="w-14 h-14 mb-2 text-blue-400"></i>
                                <span class="font-bold text-xl tracking-wider text-blue-100">SAFE</span>
                                <span class="text-xs text-blue-400/70 mt-1 uppercase">Tap to reset</span>
                            ` : state.sosStage === 2 ? `
                                <i data-lucide="loader-2" class="w-14 h-14 mb-2 animate-spin text-red-400"></i>
                                <span class="font-bold text-xl tracking-wider text-red-100">WAITING</span>
                                <span class="text-xs text-red-400/70 mt-1 uppercase">Tap if Rescued</span>
                            ` : `
                                <i data-lucide="shield-alert" class="w-14 h-14 mb-2 ${state.sosActive ? 'animate-bounce' : ''}"></i>
                                <span class="font-black text-3xl tracking-wider">SOS</span>
                                <span class="text-xs opacity-70 mt-1 uppercase font-semibold">Hold 3s</span>
                            `}
                        </div>
                    </button>

                    <div class="w-full grid grid-cols-2 gap-3">
                        <article class="${cardBg} border p-3 rounded-xl flex flex-col justify-between backdrop-blur-md">
                            <div class="flex items-center gap-2 text-blue-400 mb-2">
                                <i data-lucide="map-pin" class="w-4 h-4"></i>
                                <span class="text-xs font-bold uppercase">Location</span>
                            </div>
                            <div>
                                <div class="font-mono ${textColor} text-xs">${state.location.lat.toFixed(4)}, ${state.location.lng.toFixed(4)}</div>
                                <div class="text-green-400 text-[10px] font-bold mt-1">±3m Accuracy</div>
                            </div>
                        </article>

                        <button onclick="toggleMedical(true)" class="${cardBg} border p-3 rounded-xl flex flex-col justify-between backdrop-blur-md hover:opacity-80 transition-opacity text-left relative overflow-hidden group shadow-sm">
                            <div class="flex items-center gap-2 text-red-400 mb-2 w-full">
                                <i data-lucide="file-heart" class="w-4 h-4"></i>
                                <span class="text-xs font-bold uppercase">Medical ID</span>
                                <i data-lucide="edit-2" class="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                            <div class="w-full">
                                <div class="${textColor} text-xs truncate font-medium w-full">${state.medicalData.name}</div>
                                <div class="text-slate-500 text-[10px] font-bold mt-1 truncate">Type ${state.medicalData.bloodType} • ${shortCondition}</div>
                            </div>
                        </button>
                    </div>
                </div>
            </section>`;
        }

        // --- Government Screen Renders ---

        function renderGovDashboard() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm';
            const textColor = isDark ? 'text-white' : 'text-slate-900';
            
            const filteredIncidents = state.incidents.filter(inc => {
                if (state.govFilter === 'All') return true;
                return inc.status === state.govFilter;
            });

            const incidentList = filteredIncidents.length > 0 ? filteredIncidents.map((inc, idx) => {
                const statusColor = inc.status === 'Active' ? 'text-red-400' : 'text-green-400';
                const icon = inc.type === 'SOS' ? 'shield-alert' : inc.type === 'Flood' ? 'cloud-rain' : 'file-heart';
                
                return `
                <article onclick="openIncidentDetails(${inc.id})" class="${cardBg} border p-3 rounded-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm animate-slide-up-fade" style="animation-delay: ${idx * 60}ms; opacity: 0;">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-full ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}">
                            <i data-lucide="${icon}" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-sm font-bold ${textColor}">${inc.user}</h3>
                                <span class="text-[9px] ${inc.status === 'Active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} px-1.5 py-0.5 rounded font-bold uppercase">${inc.status}</span>
                            </div>
                            <p class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <i data-lucide="map-pin" class="w-3 h-3"></i> 
                                ${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)} • ${inc.time}
                            </p>
                        </div>
                    </div>
                    ${inc.status === 'Active' ? `
                    <button onclick="event.stopPropagation(); acknowledgeIncident(${inc.id})" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-xs font-bold">
                        ACK
                    </button>` : ''}
                </article>`;
            }).join('') : `<div class="text-center py-8 text-slate-500 text-xs italic">No ${state.govFilter.toLowerCase()} incidents found.</div>`;

            const filterBtnClass = (f) => state.govFilter === f ? (isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-800') : 'text-slate-500 hover:opacity-70';

            return `
            <section class="flex-1 flex flex-col p-4 ${bgClass} transition-colors duration-500 animate-fade-in overflow-hidden">
                <header class="flex justify-between items-end mb-4">
                    <div>
                        <h2 class="text-xl font-bold ${textColor} tracking-tight">Command Center</h2>
                        <p class="text-xs text-slate-400">Monitoring Sector 4</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-red-500">${state.incidents.filter(i => i.status === 'Active').length}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-bold">Active Alerts</div>
                    </div>
                </header>

                <!-- Broadcast Button -->
                <button onclick="toggleBroadcastModal(true)" class="w-full bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl font-bold mb-4 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95">
                    <i data-lucide="megaphone" class="w-4 h-4"></i>
                    BROADCAST ALERT
                </button>

                <div class="flex gap-2 mb-4">
                    <div class="flex-1 ${cardBg} border p-3 rounded-lg">
                        <div class="text-xs text-slate-400 uppercase font-bold">Rescuers</div>
                        <div class="text-lg font-mono ${textColor}">12</div>
                    </div>
                    <div class="flex-1 ${cardBg} border p-3 rounded-lg">
                        <div class="text-xs text-slate-400 uppercase font-bold">Shelters</div>
                        <div class="text-lg font-mono ${textColor}">3/4</div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto space-y-3 no-scrollbar pb-4">
                    <nav class="sticky top-0 ${bgClass} py-2 z-10 flex justify-between items-center border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} mb-2 transition-colors duration-500">
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest text-balance">Incoming Feed</h3>
                        <div class="flex ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'} p-0.5 rounded-lg border">
                            <button onclick="setGovFilter('All')" class="px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterBtnClass('All')}">ALL</button>
                            <button onclick="setGovFilter('Active')" class="px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterBtnClass('Active')}">ACTIVE</button>
                            <button onclick="setGovFilter('Resolved')" class="px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterBtnClass('Resolved')}">RESOLVED</button>
                        </div>
                    </nav>
                    ${incidentList}
                </div>
            </section>`;
        }

        // --- Shared Screens ---

        function renderChat() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const borderClass = state.powerSaving ? 'border-slate-800' : (isDark ? 'border-slate-700' : 'border-slate-200');
            const title = state.role === 'government' ? 'Dispatch Channel' : 'Barangay Mesh #1';
            
            let messagesHTML = state.messages.map((msg, idx) => {
                if (msg.isSystem) {
                    return `<div class="flex w-full justify-center animate-slide-up-fade" style="animation-delay: ${idx * 40}ms; opacity: 0;"><span class="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">${msg.text}</span></div>`;
                }
                const align = msg.isMe ? 'justify-end' : 'justify-start';
                const bubbleColor = msg.isMe ? 'bg-blue-600 text-white rounded-br-none' : `${state.powerSaving ? 'bg-slate-900 border-slate-800' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm')} rounded-bl-none border`;
                
                return `
                <div class="flex w-full ${align} animate-slide-up-fade" style="animation-delay: ${idx * 40}ms; opacity: 0;">
                    <div class="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md ${bubbleColor}">
                        ${!msg.isMe ? `<p class="text-xs text-slate-400 mb-1 font-bold">${msg.sender}</p>` : ''}
                        <p>${msg.text}</p>
                        <p class="text-[10px] text-right mt-1 opacity-60">${msg.time}</p>
                    </div>
                </div>`;
            }).join('');

            return `
            <div class="flex-1 flex flex-col w-full overflow-hidden ${bgClass} transition-colors duration-500 animate-fade-in">
                <div class="${bgClass} ${borderClass} p-4 shadow-sm border-b flex justify-between items-center transition-colors">
                    <div>
                        <h3 class="font-bold ${isDark ? 'text-white' : 'text-slate-900'}">${title}</h3>
                        <p class="text-xs text-green-400 flex items-center gap-1">
                            <i data-lucide="wifi" class="w-3 h-3"></i> 12 Active Nodes
                        </p>
                    </div>
                </div>

                <div id="chat-container" class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    ${messagesHTML}
                </div>

                <div class="p-3 border-t flex gap-2 ${bgClass} ${borderClass} transition-colors">
                    <input type="text" id="chat-input" placeholder="${state.role === 'government' ? 'Broadcast alert...' : 'Message off-grid...'}" class="flex-1 bg-transparent border ${borderClass} ${isDark ? 'text-white' : 'text-slate-900'} rounded-full px-4 text-sm focus:border-blue-500 transition-colors h-10" onkeydown="if(event.key === 'Enter') sendChat()">
                    <button onclick="sendChat()" class="bg-blue-600 hover:bg-blue-500 text-white p-2 w-10 h-10 rounded-full transition-colors flex items-center justify-center">
                        <i data-lucide="send" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>`;
        }

        function renderMap() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const gridColor = isDark ? '#334155' : '#cbd5e1';
            
            return `
            <div class="flex-1 flex flex-col items-center justify-center relative overflow-hidden ${bgClass} transition-colors duration-500 animate-fade-in">
                <!-- Top Controls -->
                <div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div class="flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-lg">
                        <i data-lucide="navigation" class="w-3 h-3 text-blue-400"></i>
                        <span class="text-xs font-bold text-white">Shelter: 1.2km</span>
                    </div>
                </div>
                
                <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button onclick="recenterMap()" class="w-8 h-8 bg-slate-800/90 backdrop-blur-md rounded-full border border-slate-700 shadow-lg flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-90" title="Recenter View">
                        <i data-lucide="crosshair" class="w-4 h-4"></i>
                    </button>
                    <button class="w-8 h-8 bg-slate-800/90 backdrop-blur-md rounded-full border border-slate-700 shadow-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                        <i data-lucide="layers" class="w-4 h-4"></i>
                    </button>
                    <button class="w-8 h-8 bg-slate-800/90 backdrop-blur-md rounded-full border border-slate-700 shadow-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                        <i data-lucide="compass" class="w-4 h-4"></i>
                    </button>
                </div>

                <div id="map-viewport" class="relative w-full h-full flex items-center justify-center overflow-hidden touch-none cursor-grab">
                    <div id="map-layer" class="absolute w-full h-full flex items-center justify-center transition-transform duration-75 origin-center pointer-events-auto" style="transform: translate(${state.mapState.x}px, ${state.mapState.y}px) scale(${state.mapState.scale});">
                        <!-- Grid Background (Expanded for panning) -->
                        <div class="absolute w-[400%] h-[400%] opacity-20 pointer-events-none" style="background-image: radial-gradient(circle, ${gridColor} 1.5px, transparent 1.5px); background-size: 32px 32px;"></div>
                        
                        <!-- Topographical lines simulation (SVG) -->
                        <svg class="absolute w-[200%] h-[200%] opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0,100 Q 150,50 380,150 T 700,100" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M 0,200 Q 200,150 380,250 T 700,200" fill="none" stroke="currentColor" stroke-width="2"/>
                        <path d="M 0,300 Q 100,350 380,300 T 700,400" fill="none" stroke="currentColor" stroke-width="2"/>
                    </svg>

                    <!-- Mesh Network Connections (SVG Lines) -->
                    <svg class="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Connect User to Node 4 -->
                        <line x1="50%" y1="50%" x2="25%" y2="33.3%" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" class="opacity-50 animate-pulse"/>
                        <!-- Connect User to Node 9 -->
                        <line x1="50%" y1="50%" x2="66.6%" y2="66.6%" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" class="opacity-50 animate-pulse"/>
                        <!-- Connect Node 4 to Shelter -->
                        <line x1="25%" y1="33.3%" x2="85%" y2="20%" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 4" class="opacity-30 animate-pulse"/>
                    </svg>
                    
                    <!-- Safe Zone -->
                    <div class="absolute top-10 right-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <!-- Danger Zone (Improved) -->
                    <div class="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-blue-900/40 to-transparent border-t border-blue-500/30 backdrop-blur-[2px] flex items-start justify-center pt-3 z-10 pointer-events-none">
                        <div class="bg-blue-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-2">
                            <i data-lucide="waves" class="w-3 h-3 text-blue-400 animate-pulse"></i>
                            <span class="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Flood Risk Area • +2.4m</span>
                        </div>
                    </div>

                    <!-- Radar Rings & Sweep -->
                    <div class="absolute w-80 h-80 border border-slate-700/40 rounded-full opacity-50 pointer-events-none"></div>
                    <div class="absolute w-56 h-56 border border-slate-700/60 rounded-full opacity-50 pointer-events-none"></div>
                    <div class="absolute w-32 h-32 border border-slate-700/80 rounded-full opacity-50 pointer-events-none"></div>
                    <!-- Conic Sweep -->
                    <div class="absolute w-80 h-80 rounded-full pointer-events-none animate-[spin_4s_linear_infinite]" style="background: conic-gradient(from 0deg, transparent 70%, rgba(59, 130, 246, 0.1) 95%, rgba(59, 130, 246, 0.4) 100%);"></div>

                    <!-- User Dot -->
                    <div class="relative z-10 flex flex-col items-center group cursor-pointer">
                        <div class="w-12 h-12 absolute bg-blue-500/20 rounded-full animate-ping-slow pointer-events-none"></div>
                        <div class="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-blue-500/80 mt-1 transform rotate-45 group-hover:rotate-90 transition-transform"></div>
                        <span class="absolute top-6 text-[9px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">You are here</span>
                    </div>

                    <!-- Nodes -->
                    <div class="absolute top-1/3 left-1/4 flex flex-col items-center group cursor-pointer z-10">
                        <div class="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span class="text-[9px] text-slate-300 mt-1 font-mono bg-slate-900/60 px-1 rounded backdrop-blur-sm">Node 4</span>
                        <!-- Node Info Tooltip -->
                        <div class="absolute bottom-6 bg-slate-800 border border-slate-700 text-white text-[8px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Signal: 98%<br>Batt: 72%</div>
                    </div>
                    <div class="absolute bottom-1/3 right-1/3 flex flex-col items-center group cursor-pointer z-10">
                        <div class="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span class="text-[9px] text-slate-300 mt-1 font-mono bg-slate-900/60 px-1 rounded backdrop-blur-sm">Node 9</span>
                        <!-- Node Info Tooltip -->
                        <div class="absolute bottom-6 bg-slate-800 border border-slate-700 text-white text-[8px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Signal: 85%<br>Batt: 41%</div>
                    </div>

                    <!-- Additional Gov Markers (Simulated) -->
                    ${state.role === 'government' ? `
                    <div class="absolute top-[45%] left-12 flex flex-col items-center z-10 cursor-pointer group">
                         <div class="w-5 h-5 bg-red-500/30 rounded-full animate-ping absolute pointer-events-none"></div>
                         <div class="w-3 h-3 bg-red-500 rounded-full relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                         <span class="text-[9px] text-red-400 mt-1 font-bold bg-slate-900/90 px-1.5 py-0.5 rounded border border-red-900/50 backdrop-blur-sm">SOS</span>
                         <div class="absolute bottom-7 bg-red-950/90 border border-red-800 text-white text-[9px] p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">ID: 101<br>Active: 2m</div>
                    </div>
                    ` : ''}

                    <!-- Shelter -->
                    <div class="absolute top-[20%] right-[15%] flex flex-col items-center z-10 cursor-pointer group">
                        <div class="bg-emerald-600 p-1.5 rounded-lg text-white shadow-[0_0_15px_rgba(5,150,105,0.6)] border border-emerald-400 group-hover:scale-110 transition-transform">
                            <i data-lucide="tent" class="w-4 h-4"></i>
                        </div>
                        <span class="text-[9px] text-emerald-400 font-bold mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-emerald-900/50 backdrop-blur-sm whitespace-nowrap">EVAC CENTER</span>
                    </div>
                </div>
                </div>
            </div>`;
        }

        function renderSettings() {
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const cardBg = state.powerSaving ? 'bg-yellow-900/20 border-yellow-600/50' : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm');
            const toggleBg = state.powerSaving ? 'bg-yellow-500' : 'bg-slate-600';
            const toggleDot = state.powerSaving ? 'left-7' : 'left-1';
            const textColor = isDark ? 'text-white' : 'text-slate-900';
            const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';
            
            return `
            <div class="flex-1 flex flex-col p-6 space-y-6 ${bgClass} transition-colors duration-500 animate-fade-in">
                <h2 class="text-xl font-bold ${textColor} mb-2">Settings</h2>
                
                <div class="p-4 rounded-xl border flex items-center justify-between ${cardBg} transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-full ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}">
                            <i data-lucide="${isDark ? 'moon' : 'sun'}" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm ${textColor}">Appearance</h3>
                            <p class="text-xs ${subTextColor}">${isDark ? 'Dark Mode' : 'Light Mode'}</p>
                        </div>
                    </div>
                    <button onclick="toggleDarkMode()" class="w-12 h-6 rounded-full transition-colors relative ${isDark ? 'bg-blue-600' : 'bg-slate-400'}">
                        <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDark ? 'left-7' : 'left-1'}"></div>
                    </button>
                </div>

                <div class="p-4 rounded-xl border flex items-center justify-between ${cardBg} transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-full ${state.powerSaving ? 'bg-yellow-600 text-black' : 'bg-slate-700 text-yellow-400'}">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm ${state.powerSaving ? 'text-yellow-400' : 'text-white'}">Ultra Power Saving</h3>
                            <p class="text-xs ${subTextColor}">OLED Dark Mode + Low Refresh</p>
                        </div>
                    </div>
                    <button onclick="togglePowerSaving()" class="w-12 h-6 rounded-full transition-colors relative ${toggleBg}">
                        <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${toggleDot}"></div>
                    </button>
                </div>

                <div class="space-y-3">
                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Local Environment</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="${cardBg} border p-3 rounded-lg">
                            <div class="flex items-center gap-2 text-slate-400 mb-1">
                                <i data-lucide="thermometer" class="w-3 h-3"></i>
                                <span class="text-xs">Temp</span>
                            </div>
                            <span class="text-lg font-mono ${textColor}">28°C</span>
                        </div>
                        <div class="${cardBg} border p-3 rounded-lg">
                            <div class="flex items-center gap-2 text-slate-400 mb-1">
                                <i data-lucide="cloud-rain" class="w-3 h-3"></i>
                                <span class="text-xs">Pressure</span>
                            </div>
                            <span class="text-lg font-mono ${textColor}">998 hPa</span>
                        </div>
                    </div>
                </div>

                <div class="${cardBg} border p-4 rounded-xl">
                    <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Device Info</h3>
                    <div class="flex justify-between text-sm py-1 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                        <span class="text-slate-400">Node ID</span>
                        <span class="${textColor} font-mono">LN-Alpha-882</span>
                    </div>
                    <div class="flex justify-between text-sm py-1 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
                        <span class="text-slate-400">Firmware</span>
                        <span class="${textColor} font-mono">v2.1.0 (Stable)</span>
                    </div>
                    <div class="flex justify-between text-sm py-1 pt-2">
                        <span class="text-slate-400">LoRa Freq</span>
                        <span class="text-green-400 font-mono">915 MHz</span>
                    </div>
                </div>
            </div>`;
        }

        function renderScreen() {
            const mainContent = document.getElementById('main-content');
            const bottomNav = document.getElementById('bottom-nav');
            
            // Theme Logic
            const isDark = state.darkMode;
            const bgClass = state.powerSaving ? 'bg-black' : (isDark ? 'bg-slate-900' : 'bg-slate-50');
            const textClass = isDark ? 'text-slate-100' : 'text-slate-900';
            
            mainContent.className = `flex-1 flex flex-col overflow-hidden ${textClass} ${bgClass} transition-colors duration-500`;
            
            const navBg = state.powerSaving ? 'bg-black border-slate-800' : (isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200');
            bottomNav.className = `${navBg} backdrop-blur border-t px-6 py-4 flex justify-between items-center pb-8 transition-colors duration-500 z-30`;

            let contentHTML = getStatusBarHTML() + getEmergencyBannerHTML();

            // Logic for Government vs Resident View
            if (state.activeTab === 'sos') {
                if (state.role === 'government') {
                    contentHTML += renderGovDashboard();
                } else {
                    contentHTML += renderResidentSOS();
                }
            }
            else if (state.activeTab === 'chat') contentHTML += renderChat();
            else if (state.activeTab === 'map') contentHTML += renderMap();
            else if (state.activeTab === 'settings') contentHTML += renderSettings();

            mainContent.innerHTML = contentHTML;
            refreshIcons();
            
            if (state.activeTab === 'chat') {
                const container = document.getElementById('chat-container');
                if(container) container.scrollTop = container.scrollHeight;
            } else if (state.activeTab === 'map') {
                initMapEvents();
            }
        }

        // --- Interaction Logic ---

        function switchTab(tab) {
            state.activeTab = tab;
            renderScreen();
            updateNavHighlight();
        }

        function updateNavHighlight() {
            // Reset all icons
            ['chat', 'map', 'settings', 'right'].forEach(t => {
                const btn = document.getElementById(`btn-${t}`);
                if(btn) btn.className = "flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all active:scale-90";
            });
            const sosBtn = document.getElementById('btn-sos');
            const sosBtnColor = state.role === 'government' ? 'bg-slate-700' : 'bg-red-600'; // Gov doesn't have red button unless needed
            
            sosBtn.className = "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 bg-slate-700 text-slate-400 hover:bg-slate-600 transition-transform";

            // Highlight active
            if (state.activeTab === 'sos') {
                if (state.role === 'government') {
                    sosBtn.className = "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 bg-blue-600 text-white scale-110 transition-transform";
                } else {
                    sosBtn.className = "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 bg-red-600 text-white scale-110 transition-transform";
                }
            } else {
                const activeBtn = document.getElementById(`btn-${state.activeTab}`);
                if(activeBtn) activeBtn.className = "flex flex-col items-center gap-1 text-blue-500 transition-all active:scale-90";
            }
        }

        // --- SOS Hold Logic ---

        function startSOSHold(e) {
            e.preventDefault();
            e.stopPropagation();
            if (state.sosActive || state.sosStage > 0) return; 

            state.isHolding = true;
            const overlay = document.getElementById('sos-hold-overlay');
            if (overlay) {
                overlay.classList.remove('scale-0', 'animate-fill-up');
                void overlay.offsetWidth; // Trigger reflow
                overlay.classList.add('animate-fill-up');
            }

            state.sosHoldTimer = setTimeout(() => {
                state.isHolding = false;
                if (state.sosStage === 0) handleSOS();
            }, 3000);
        }

        function cancelSOSHold() {
            if (state.sosHoldTimer) {
                clearTimeout(state.sosHoldTimer);
                state.sosHoldTimer = null;
            }
            state.isHolding = false;
            const overlay = document.getElementById('sos-hold-overlay');
            if (overlay) {
                overlay.classList.remove('animate-fill-up');
                overlay.classList.add('scale-0');
                void overlay.offsetWidth; // Trigger reflow for smooth reset
            }
        }

        function handleSOS() {
            if (state.role === 'government') return; // Gov doesn't press SOS here

            if (state.sosStage === 2) {
                // From Pending to Rescued
                state.sosStage = 3;
                renderScreen();
            } else if (state.sosStage === 3) {
                // From Rescued to Safe (Reset)
                state.sosActive = false;
                state.sosStage = 0;
                renderScreen();
            } else {
                // Activate SOS
                state.sosActive = true;
                state.sosStage = 1;
                renderScreen();
                
                setTimeout(() => {
                    state.sosStage = 2;
                    renderScreen();
                    
                    setTimeout(() => {
                         state.messages.push({ 
                            id: Date.now(), 
                            sender: 'LGU Command', 
                            text: `SOS RECEIVED. Medical ID #9921 (${state.medicalData.bloodType}) Downloaded. Team is approaching from North.`, 
                            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                            isMe: false 
                        });
                    }, 2000);

                }, 3000);
            }
            renderScreen();
        }

        function toggleMedical(show) {
            const modal = document.getElementById('medical-modal');
            modal.classList.toggle('hidden', !show);
            refreshIcons();
        }

        function saveMedical() {
            state.medicalData.name = document.getElementById('input-name').value;
            state.medicalData.bloodType = document.getElementById('input-blood').value;
            state.medicalData.age = document.getElementById('input-age').value;
            state.medicalData.allergies = document.getElementById('input-allergies').value;
            state.medicalData.condition = document.getElementById('input-condition').value;
            toggleMedical(false);
            saveState();
            if(state.activeTab === 'sos' && state.role === 'resident') renderScreen();
        }

        function togglePowerSaving() {
            state.powerSaving = !state.powerSaving;
            saveState();
            renderScreen();
        }

        function toggleDarkMode() {
            state.darkMode = !state.darkMode;
            saveState();
            renderScreen();
        }

        function sendChat() {
            const input = document.getElementById('chat-input');
            const txt = input.value.trim();
            if (!txt) return;

            state.messages.push({
                id: Date.now(),
                sender: state.role === 'government' ? 'Command Center' : 'Me',
                text: txt,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                isMe: true
            });
            input.value = '';
            renderScreen();
        }

        function toggleBroadcastModal(show) {
            const modal = document.getElementById('broadcast-modal');
            if (show) {
                modal.classList.remove('hidden');
                document.getElementById('input-broadcast').value = '';
            } else {
                modal.classList.add('hidden');
            }
        }

        function sendBroadcast() {
            const msg = document.getElementById('input-broadcast').value;
            if (msg.trim()) {
                state.broadcastMessage = msg;
                toggleBroadcastModal(false);
                renderScreen();
            }
        }

        function clearBroadcast() {
            state.broadcastMessage = null;
            renderScreen();
        }

        function setGovFilter(filter) {
            state.govFilter = filter;
            renderScreen();
        }

        function acknowledgeIncident(id) {
            const incident = state.incidents.find(i => i.id === id);
            if (incident) {
                incident.status = 'Resolved';
                renderScreen();
            }
        }

        function toggleIncidentModal(show) {
            const modal = document.getElementById('incident-details-modal');
            if (show) {
                modal.classList.remove('hidden');
            } else {
                modal.classList.add('hidden');
            }
        }

        function openIncidentDetails(id) {
            const inc = state.incidents.find(i => i.id === id);
            if (!inc) return;

            const content = document.getElementById('incident-modal-content');
            const icon = inc.type === 'SOS' ? 'shield-alert' : inc.type === 'Flood' ? 'cloud-rain' : 'file-heart';
            const color = inc.type === 'SOS' ? 'text-red-500' : inc.type === 'Flood' ? 'text-blue-500' : 'text-pink-500';
            const bg = inc.type === 'SOS' ? 'bg-red-500/20' : inc.type === 'Flood' ? 'bg-blue-500/20' : 'bg-pink-500/20';

            content.innerHTML = `
                <div class="flex flex-col items-center mb-6">
                    <div class="${bg} p-4 rounded-full ${color} mb-3">
                        <i data-lucide="${icon}" class="w-8 h-8"></i>
                    </div>
                    <h3 class="text-white font-bold text-lg">${inc.user}</h3>
                    <p class="text-slate-400 text-xs text-center mt-1 uppercase tracking-widest font-bold">${inc.type} ALERT • ${inc.time}</p>
                </div>

                <div class="space-y-3">
                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                        <span class="text-slate-400 text-xs uppercase font-bold">Status</span>
                        <span class="${inc.status === 'Active' ? 'text-red-400' : 'text-green-400'} font-bold text-sm uppercase">${inc.status}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <p class="text-slate-500 text-[10px] uppercase mb-1">Age</p>
                            <p class="text-white font-mono">${inc.details.age}</p>
                        </div>
                        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <p class="text-slate-500 text-[10px] uppercase mb-1">Blood Type</p>
                            <p class="text-white font-mono">${inc.details.blood}</p>
                        </div>
                    </div>

                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p class="text-slate-500 text-[10px] uppercase mb-1">Medical Condition</p>
                        <p class="text-white text-sm font-medium">${inc.details.condition}</p>
                    </div>

                    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p class="text-slate-500 text-[10px] uppercase mb-1">History / Notes</p>
                        <p class="text-slate-300 text-xs">${inc.details.history}</p>
                    </div>
                </div>

                ${inc.status === 'Active' ? `
                <button onclick="acknowledgeIncident(${inc.id}); toggleIncidentModal(false)" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold mt-6 text-sm flex justify-center items-center gap-2 transition-all">
                  <i data-lucide="check-circle" class="w-4 h-4"></i> Acknowledge Incident
                </button>` : `
                <button onclick="toggleIncidentModal(false)" class="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold mt-6 text-sm transition-all">
                  Close Details
                </button>`}
            `;
            
            toggleIncidentModal(true);
            if (window.lucide) lucide.createIcons();
        }

// Icon rendering helper with RAF
function refreshIcons() {
    if (window.lucide) {
        requestAnimationFrame(() => lucide.createIcons());
    }
}

    function recenterMap() {
        state.mapState = { x: 0, y: 0, scale: 1 };
        mapDragState.currentX = 0;
        mapDragState.currentY = 0;
        const layer = document.getElementById('map-layer');
        if (layer) {
            layer.style.transform = `translate(0px, 0px) scale(1)`;
        }
    }

    // --- Map Interaction Logic ---
    let mapDragState = { active: false, initialX: 0, initialY: 0, currentX: 0, currentY: 0, initialPinch: 0, baseScale: 1 };

    function initMapEvents() {
        const viewport = document.getElementById('map-viewport');
        const layer = document.getElementById('map-layer');
        if (!viewport || !layer) return;

        // Reset local drag state to match global state
        mapDragState.currentX = state.mapState.x;
        mapDragState.currentY = state.mapState.y;

        function updateTransform() {
            state.mapState.x = mapDragState.currentX;
            state.mapState.y = mapDragState.currentY;
            layer.style.transform = `translate(${state.mapState.x}px, ${state.mapState.y}px) scale(${state.mapState.scale})`;
        }

        // --- Touch Events (Mobile) ---
        viewport.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                mapDragState.active = true;
                mapDragState.initialX = e.touches[0].clientX - mapDragState.currentX;
                mapDragState.initialY = e.touches[0].clientY - mapDragState.currentY;
            } else if (e.touches.length === 2) {
                mapDragState.active = false; // Stop panning while zooming
                mapDragState.initialPinch = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                mapDragState.baseScale = state.mapState.scale;
            }
        }, { passive: false });

        viewport.addEventListener('touchmove', e => {
            e.preventDefault(); // Prevent standard page scroll
            if (mapDragState.active && e.touches.length === 1) {
                mapDragState.currentX = e.touches[0].clientX - mapDragState.initialX;
                mapDragState.currentY = e.touches[0].clientY - mapDragState.initialY;
                updateTransform();
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                if (mapDragState.initialPinch > 0) {
                    let newScale = mapDragState.baseScale * (dist / mapDragState.initialPinch);
                    state.mapState.scale = Math.min(Math.max(0.4, newScale), 4); // clamp zoom level
                    updateTransform();
                }
            }
        }, { passive: false });

        viewport.addEventListener('touchend', e => {
            if (e.touches.length < 2) mapDragState.initialPinch = 0;
            if (e.touches.length === 0) mapDragState.active = false;
        });

        // --- Mouse Events (Desktop testing) ---
        viewport.addEventListener('mousedown', e => {
            mapDragState.active = true;
            mapDragState.initialX = e.clientX - mapDragState.currentX;
            mapDragState.initialY = e.clientY - mapDragState.currentY;
        });
        viewport.addEventListener('mousemove', e => {
            if (!mapDragState.active) return;
            e.preventDefault();
            mapDragState.currentX = e.clientX - mapDragState.initialX;
            mapDragState.currentY = e.clientY - mapDragState.initialY;
            updateTransform();
        });
        viewport.addEventListener('mouseup', () => mapDragState.active = false);
        viewport.addEventListener('mouseleave', () => mapDragState.active = false);
        viewport.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            state.mapState.scale = Math.min(Math.max(0.4, state.mapState.scale + delta), 4);
            updateTransform();
        }, { passive: false });
    }

// Initialize App
window.onload = init;
