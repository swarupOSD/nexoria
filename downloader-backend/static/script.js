document.addEventListener('DOMContentLoaded', () => {
    
    // --- Initial Load ---
    loadProfile();
    loadSettings();
    loadStats();

    async function loadStats() {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            document.getElementById('stat-total-dls').textContent = data.total_downloads;
            document.getElementById('stat-total-storage').textContent = data.total_storage;
            document.getElementById('stat-last-dl').textContent = data.last_download;
        } catch(e) {}
    }

    // --- Navigation (SPA) ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetId = link.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            loadStats();
            if (targetId === 'history-view') loadHistory();
            if (targetId === 'library-view') loadLibrary();
            if (targetId === 'settings-view') loadSettings();
            if (targetId === 'profile-view') loadProfileForm();
        });
    });

    // --- Library & Media Player Logic ---
    const mediaGrid = document.getElementById('media-library-grid');
    const playerModal = document.getElementById('media-player-modal');
    const playerContainer = document.getElementById('media-player-container');
    const playerCloseBtn = document.getElementById('close-player-btn');
    const playerTitle = document.getElementById('now-playing-title');

    async function loadLibrary() {
        try {
            const res = await fetch('/api/media');
            const files = await res.json();
            mediaGrid.innerHTML = '';
            
            if(files.length === 0) {
                mediaGrid.innerHTML = '<p style="color:var(--text-muted);">No media found in library.</p>';
                return;
            }

            files.forEach(f => {
                const card = document.createElement('div');
                card.style.background = 'rgba(255,255,255,0.05)';
                card.style.padding = '15px';
                card.style.borderRadius = '12px';
                card.style.cursor = 'pointer';
                card.style.textAlign = 'center';
                card.style.transition = 'transform 0.2s';
                
                card.onmouseover = () => card.style.transform = 'scale(1.05)';
                card.onmouseout = () => card.style.transform = 'scale(1)';

                let icon = 'fa-file-video';
                let color = 'var(--primary)';
                if(f.category === 'Music') { icon = 'fa-music'; color = '#00f0ff'; }
                if(f.category === 'GIFs') { icon = 'fa-image'; color = '#ff00aa'; }
                
                card.innerHTML = `
                    <i class="fa-solid ${icon}" style="font-size:3rem; color:${color}; margin-bottom:10px;"></i>
                    <p style="font-size:0.85rem; color:var(--text); word-break:break-all;">${f.name.substring(0, 20)}...</p>
                    <small style="color:var(--text-muted);">${f.category}</small>
                `;
                
                card.addEventListener('click', () => openPlayer(f));
                mediaGrid.appendChild(card);
            });
        } catch(e) {}
    }

    function openPlayer(file) {
        playerTitle.textContent = file.name;
        playerContainer.innerHTML = '';
        const fileUrl = `/download-file/${encodeURIComponent(file.path)}`;
        
        if (file.name.endsWith('.mp3') || file.name.endsWith('.m4a')) {
            playerContainer.innerHTML = `<audio controls autoplay style="width:100%;"><source src="${fileUrl}" type="audio/mpeg"></audio>`;
        } else if (file.name.endsWith('.mp4')) {
            playerContainer.innerHTML = `<video controls autoplay style="width:100%; max-height:70vh;"><source src="${fileUrl}" type="video/mp4"></video>`;
        } else if (file.name.endsWith('.gif')) {
            playerContainer.innerHTML = `<img src="${fileUrl}" style="width:100%; max-height:70vh; object-fit:contain;">`;
        }
        
        playerModal.style.display = 'flex';
    }

    playerCloseBtn.addEventListener('click', () => {
        playerContainer.innerHTML = ''; // Stop playback
        playerModal.style.display = 'none';
    });

    // --- Mode Toggle (Single vs Search vs Batch) ---
    const modeSingleBtn = document.getElementById('single-mode-btn');
    const modeSearchBtn = document.getElementById('search-mode-btn');
    const modeBatchBtn = document.getElementById('batch-mode-btn');
    const gifTabBtn = document.getElementById('gif-tab-btn');
    const singleInputArea = document.getElementById('single-input-area');
    const searchInputArea = document.getElementById('search-input-area');
    const searchResultsArea = document.getElementById('search-results-area');
    const batchForm = document.getElementById('batch-form');
    const gifInputArea = document.getElementById('gif-input-area');

    function resetModes() {
        modeSingleBtn.classList.remove('active'); modeSearchBtn.classList.remove('active'); modeBatchBtn.classList.remove('active'); gifTabBtn.classList.remove('active');
        singleInputArea.style.display = 'none'; searchInputArea.style.display = 'none'; searchResultsArea.style.display = 'none';
        batchForm.style.display = 'none'; gifInputArea.style.display = 'none';
    }

    modeSingleBtn.addEventListener('click', () => {
        resetModes(); modeSingleBtn.classList.add('active'); singleInputArea.style.display = 'block';
    });
    modeSearchBtn.addEventListener('click', () => {
        resetModes(); modeSearchBtn.classList.add('active'); searchInputArea.style.display = 'block';
    });
    modeBatchBtn.addEventListener('click', () => {
        resetModes(); modeBatchBtn.classList.add('active'); batchForm.style.display = 'block';
    });
    gifTabBtn.addEventListener('click', () => {
        resetModes(); gifTabBtn.classList.add('active'); gifInputArea.style.display = 'block';
    });

    // --- DOM Elements (Home) ---
    const fetchBtn = document.getElementById('fetch-btn');
    const urlInput = document.getElementById('yt-url');
    // step1 is no longer a single form, just assign it to something that exists so we don't null reference
    const step1 = document.getElementById('single-input-area');
    const step2 = document.getElementById('step-2');
    const backBtn = document.getElementById('back-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Dark Mode</span>';
    }
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Dark Mode</span>';
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Light Mode</span>';
        }
    });

    // Formats
    const videoFormatList = document.getElementById('video-format-list');
    const audioFormatList = document.getElementById('audio-format-list');
    
    // Preview
    const playPreviewBtn = document.getElementById('play-preview-btn');
    const iframeContainer = document.getElementById('iframe-container');
    const previewIframe = document.getElementById('preview-iframe');
    const singleVideoCard = document.getElementById('single-video-card');
    let currentVideoId = '';
    
    // Trimming Elements
    const enableTrim = document.getElementById('trim-checkbox');
    const trimInputs = document.getElementById('trim-inputs-div');
    const startTimeInput = document.getElementById('trim-start');
    const endTimeInput = document.getElementById('trim-end');

    // Progress Elements
    const progressContainer = document.getElementById('progress-container');
    const statusText = document.getElementById('status-text');
    const percentageText = document.getElementById('percentage-text');
    const progressFill = document.getElementById('progress-fill');
    const postActions = document.getElementById('post-actions');
    const newDownloadBtn = document.getElementById('new-download-btn');
    
    let currentUrl = '';
    let selectedFormat = null;
    let isAudio = false;
    let isGif = false;
    let pollInterval = null;
    let currentTitle = '';
    let currentThumbnail = '';
    let autoClickGif = false;

    // --- Platform Selectors ---
    const ytPlatformBtn = document.getElementById('yt-platform-btn');
    const igPlatformBtn = document.getElementById('ig-platform-btn');
    const fbPlatformBtn = document.getElementById('fb-platform-btn');
    const platformIcon = document.getElementById('platform-icon');
    
    function resetPlatforms() {
        [ytPlatformBtn, igPlatformBtn, fbPlatformBtn].forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.color = 'var(--text)';
        });
    }

    ytPlatformBtn.addEventListener('click', () => {
        resetPlatforms();
        ytPlatformBtn.classList.add('active');
        ytPlatformBtn.style.background = 'var(--primary)';
        ytPlatformBtn.style.color = 'white';
        platformIcon.className = 'fa-brands fa-youtube input-icon';
        platformIcon.style.color = 'var(--primary)';
        urlInput.placeholder = 'Paste YouTube link here...';
        fetchBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Fetch YouTube Info';
        document.getElementById('search-mode-btn').style.display = 'inline-block';
    });

    igPlatformBtn.addEventListener('click', () => {
        resetPlatforms();
        igPlatformBtn.classList.add('active');
        igPlatformBtn.style.background = 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
        igPlatformBtn.style.color = 'white';
        platformIcon.className = 'fa-brands fa-instagram input-icon';
        platformIcon.style.color = '#e6683c';
        urlInput.placeholder = 'Paste Instagram Reel/IGTV link here...';
        fetchBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Fetch Instagram Info';
        document.getElementById('search-mode-btn').style.display = 'none';
    });

    fbPlatformBtn.addEventListener('click', () => {
        resetPlatforms();
        fbPlatformBtn.classList.add('active');
        fbPlatformBtn.style.background = '#1877f2';
        fbPlatformBtn.style.color = 'white';
        platformIcon.className = 'fa-brands fa-facebook input-icon';
        platformIcon.style.color = '#1877f2';
        urlInput.placeholder = 'Paste Facebook Video link here...';
        fetchBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Fetch Facebook Info';
        document.getElementById('search-mode-btn').style.display = 'none';
    });

    // --- GIF Fetch Action ---
    const fetchGifBtn = document.getElementById('fetch-gif-btn');
    const gifUrlInput = document.getElementById('gif-yt-url');
    
    fetchGifBtn.addEventListener('click', () => {
        if(!gifUrlInput.value.trim()) return Swal.fire({icon: 'warning', title: 'Oops...', text: 'Please enter a valid YouTube URL!'});
        urlInput.value = gifUrlInput.value.trim();
        autoClickGif = true;
        fetchBtn.click();
    });

    // --- Trimming Toggle ---
    enableTrim.addEventListener('change', (e) => {
        trimInputs.style.display = e.target.checked ? 'flex' : 'none';
    });

    // --- Fetch Info (Single) ---
    fetchBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Please enter a valid YouTube URL!', background: '#0f172a', color: '#fff', confirmButtonColor: '#ff0055' });
            return;
        }

        currentUrl = url;
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching...';
        
        try {
            const response = await fetch('/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await response.json();
            
            if (response.ok && !data.is_playlist) {
                currentTitle = data.title;
                currentThumbnail = data.thumbnail;
                currentVideoId = data.id; // Save ID for iframe
                document.getElementById('video-thumbnail').src = data.thumbnail;
                document.getElementById('video-title').textContent = data.title;
                document.getElementById('video-channel').textContent = data.channel || 'Unknown';
                
                videoFormatList.innerHTML = '';
                audioFormatList.innerHTML = '';

                data.formats.forEach((fmt) => {
                    const div = document.createElement('div');
                    div.className = 'format-item';
                    const icon = fmt.type === 'audio' ? 'fa-music' : 'fa-video';
                    
                    div.innerHTML = `
                        <div class="left">
                            <i class="fa-solid ${icon}"></i>
                            <span class="res">${fmt.resolution}</span>
                        </div>
                        <span class="size">${fmt.size}</span>
                    `;
                    
                    div.addEventListener('click', () => {
                        document.querySelectorAll('.format-item').forEach(el => el.classList.remove('selected'));
                        div.classList.add('selected');
                        selectedFormat = fmt.id;
                        isAudio = fmt.type === 'audio';
                        isGif = false;
                        downloadBtn.disabled = false;
                    });

                    if (fmt.type === 'audio') {
                        audioFormatList.appendChild(div);
                    } else {
                        videoFormatList.appendChild(div);
                    }
                });

                document.querySelector('.mode-toggle').style.display = 'none';
                singleInputArea.style.display = 'none';
                searchInputArea.style.display = 'none';
                searchResultsArea.style.display = 'none';
                gifInputArea.style.display = 'none';
                document.getElementById('single-video-preview').style.display = 'block';
                document.getElementById('playlist-area').style.display = 'none';
                step2.style.display = 'block';
                downloadBtn.disabled = true;
                selectedFormat = null;

                if (autoClickGif) {
                    setTimeout(() => { document.getElementById('gif-maker-btn').click(); }, 100);
                    autoClickGif = false;
                }
            } else if (data.is_playlist) {
                // Handle Playlist
                currentTitle = data.title;
                document.querySelector('.mode-toggle').style.display = 'none';
                singleInputArea.style.display = 'none';
                searchInputArea.style.display = 'none';
                searchResultsArea.style.display = 'none';
                document.getElementById('single-video-preview').style.display = 'none';
                
                const plArea = document.getElementById('playlist-area');
                const plList = document.getElementById('playlist-list');
                plArea.style.display = 'block';
                plList.innerHTML = '';
                
                playlistEntries = data.entries; // Global array to store
                
                data.entries.forEach((entry, idx) => {
                    const div = document.createElement('div');
                    div.className = 'format-item';
                    div.innerHTML = `<label style="display:flex; gap:10px; align-items:center; width:100%; cursor:pointer;">
                        <input type="checkbox" class="pl-checkbox" value="${idx}" checked>
                        <span>${entry.title}</span>
                    </label>`;
                    plList.appendChild(div);
                });
                
                step2.style.display = 'block';
                downloadBtn.disabled = false;
                selectedFormat = 'best'; // Default best for playlist
            } else {
                Swal.fire({ icon: 'error', title: 'Fetch Failed', text: data.error, background: '#0f172a', color: '#fff' });
            }
        } catch (error) {
            Swal.fire('Error', 'Connection failed.', 'error');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Fetch Info';
        }
    });

    playPreviewBtn.addEventListener('click', () => {
        if(currentVideoId) {
            singleVideoCard.style.display = 'none';
            iframeContainer.style.display = 'block';
            previewIframe.src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1`;
        }
    });

    backBtn.addEventListener('click', resetHome);
    newDownloadBtn.addEventListener('click', resetHome);

    // --- Share to Mobile Action ---
    const shareMobileBtn = document.getElementById('share-mobile-btn');
    if(shareMobileBtn) {
        shareMobileBtn.addEventListener('click', async () => {
            shareMobileBtn.disabled = true;
            shareMobileBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
            
            try {
                const res = await fetch('/api/local-ip');
                const data = await res.json();
                const ip = data.ip || '127.0.0.1';
                const filename = shareMobileBtn.dataset.filename;
                
                if(!filename) {
                    Swal.fire('Oops', 'Could not locate the file.', 'error');
                    return;
                }
                
                const downloadUrl = `http://${ip}:5000/download-file/${encodeURIComponent(filename)}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(downloadUrl)}`;
                
                document.getElementById('qr-code-img').src = qrUrl;
                document.getElementById('qr-code-area').style.display = 'block';
            } catch(e) {
                Swal.fire('Error', 'Could not fetch local IP address.', 'error');
            }
            
            shareMobileBtn.innerHTML = '<i class="fa-solid fa-mobile-screen-button"></i> Share to Mobile';
            shareMobileBtn.disabled = false;
        });
    }

    // --- Stats & History Loading ---
    let playlistEntries = [];

    document.getElementById('select-all-playlist-btn').addEventListener('click', () => {
        document.querySelectorAll('.pl-checkbox').forEach(cb => cb.checked = true);
    });
    document.getElementById('deselect-all-playlist-btn').addEventListener('click', () => {
        document.querySelectorAll('.pl-checkbox').forEach(cb => cb.checked = false);
    });

    // --- Make Ringtone Mode ---
    const ringtoneBtn = document.getElementById('ringtone-maker-btn');
    ringtoneBtn.addEventListener('click', () => {
        enableTrim.checked = true;
        trimInputs.style.display = 'flex';
        startTimeInput.value = '00:00:00';
        endTimeInput.value = '00:00:30';
        
        // Auto select best audio
        const audioItems = audioFormatList.querySelectorAll('.format-item');
        if(audioItems.length > 0) audioItems[0].click();
        isGif = false;
        Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'Ringtone Mode Activated', showConfirmButton: false, timer: 1500});
    });

    // --- Make GIF Mode ---
    const gifBtn = document.getElementById('gif-maker-btn');
    gifBtn.addEventListener('click', () => {
        enableTrim.checked = true;
        trimInputs.style.display = 'flex';
        startTimeInput.value = '00:00:00';
        endTimeInput.value = '00:00:05';
        
        // Auto select low res video for GIF
        const videoItems = videoFormatList.querySelectorAll('.format-item');
        let selected = null;
        // Try to pick something around 360p or 480p to avoid massive GIFs
        videoItems.forEach(item => {
            if (item.innerText.includes('480p') || item.innerText.includes('360p')) {
                selected = item;
            }
        });
        if(!selected && videoItems.length > 0) selected = videoItems[videoItems.length - 1]; // Pick smallest if not found
        if(selected) selected.click();
        isGif = true;
        Swal.fire({toast: true, position: 'top-end', icon: 'info', title: 'GIF Mode Activated', showConfirmButton: false, timer: 1500});
    });

    // --- Search Feature ---
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-query');
    const searchList = document.getElementById('search-list');
    
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if(!query) return;
        searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
        try {
            const res = await fetch('/api/search', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query})});
            const data = await res.json();
            searchList.innerHTML = '';
            data.results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-card';
                div.style.display = 'flex'; div.style.flexDirection = 'row'; div.style.cursor = 'pointer';
                div.innerHTML = `<img src="${item.thumbnail}" style="width:120px; height:80px; object-fit:cover;">
                                 <div class="details" style="flex:1;"><h4>${item.title}</h4></div>`;
                div.addEventListener('click', () => {
                    urlInput.value = item.url;
                    modeSingleBtn.click();
                    fetchBtn.click();
                });
                searchList.appendChild(div);
            });
            searchResultsArea.style.display = 'block';
        } catch(e){}
        searchBtn.innerHTML = '<i class="fa-solid fa-search"></i> Search YouTube';
        searchBtn.disabled = false;
    });

    function resetHome() {
        step2.style.display = 'none';
        progressContainer.style.display = 'none';
        postActions.style.display = 'none';
        document.querySelector('.mode-toggle').style.display = 'inline-flex';
        modeSingleBtn.click();
        urlInput.value = '';
        singleVideoCard.style.display = 'flex';
        iframeContainer.style.display = 'none';
        previewIframe.src = '';
        document.getElementById('playlist-area').style.display = 'none';
        document.getElementById('schedule-time').value = '';
        if(pollInterval) clearInterval(pollInterval);
    }

    // --- Start Download (Single / Playlist) ---
    downloadBtn.addEventListener('click', async () => {
        if (!selectedFormat) return;

        let startTime = enableTrim.checked ? startTimeInput.value.trim() : null;
        let endTime = enableTrim.checked ? endTimeInput.value.trim() : null;
        let scheduleTime = document.getElementById('schedule-time').value;

        // Check if playlist
        let urlsToDownload = [];
        if (document.getElementById('playlist-area').style.display === 'block') {
            document.querySelectorAll('.pl-checkbox:checked').forEach(cb => {
                urlsToDownload.push(playlistEntries[cb.value].url);
            });
            if(urlsToDownload.length === 0) return Swal.fire('Oops', 'Select at least one video.', 'warning');
        } else {
            urlsToDownload.push(currentUrl);
        }

        step2.style.display = 'none';
        
        if (urlsToDownload.length > 1) {
            // Forward to batch logic internally
            batchUrls.value = urlsToDownload.join('\n');
            modeBatchBtn.click();
            document.getElementById('batch-download-btn').click();
            return;
        }
        
        progressContainer.style.display = 'block';
        postActions.style.display = 'none';
        statusText.textContent = scheduleTime ? `Scheduled for ${scheduleTime}` : 'Starting download...';
        percentageText.textContent = '0%';
        progressFill.style.width = '0%';
        
        const volumeBoost = document.getElementById('volume-boost-checkbox') ? document.getElementById('volume-boost-checkbox').checked : false;
        const downloadSubtitles = document.getElementById('subtitle-checkbox') ? document.getElementById('subtitle-checkbox').checked : false;
        const aiTranscribe = document.getElementById('ai-transcribe-checkbox') ? document.getElementById('ai-transcribe-checkbox').checked : false;
        
        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: urlsToDownload[0], format_id: selectedFormat, type: isGif ? 'gif' : (isAudio ? 'audio' : 'video'),
                    start_time: startTime, end_time: endTime, title: currentTitle, thumbnail: currentThumbnail,
                    schedule_time: scheduleTime, volume_boost: volumeBoost, download_subtitles: downloadSubtitles,
                    ai_transcription: aiTranscribe
                })
            });
            if (response.ok) {
                pollInterval = setInterval(pollProgress, 1000);
            }
        } catch (error) {}
    });

    async function pollProgress() {
        try {
            const response = await fetch(`/progress?url=${encodeURIComponent(currentUrl)}`);
            const data = await response.json();
            let prog = data.progress;

            if (typeof prog === 'string' && prog.startsWith('Completed')) {
                clearInterval(pollInterval);
                let filename = prog.split('|')[1] || '';
                statusText.textContent = 'Download Complete!';
                percentageText.textContent = '100%';
                progressFill.style.width = '100%';
                document.getElementById('progress-speed').textContent = 'Done';
                document.getElementById('progress-eta').textContent = '0s';
                postActions.style.display = 'flex';
                
                // Store filename for mobile share
                document.getElementById('share-mobile-btn').dataset.filename = filename;
                document.getElementById('qr-code-area').style.display = 'none';
                Swal.fire({icon: 'success', title: 'Complete!', timer: 2000, showConfirmButton: false});
            } else if (typeof prog === 'string' && prog.startsWith('Error')) {
                clearInterval(pollInterval);
                showError(prog);
            } else if (prog.percent && prog.percent.startsWith('Error')) {
                clearInterval(pollInterval);
                showError(prog.percent);
            } else {
                let percentStr = typeof prog === 'string' ? prog : prog.percent;
                const numMatch = percentStr.match(/[\d.]+/);
                if (numMatch) {
                    let p = parseFloat(numMatch[0]);
                    if(p > 100) p = 100;
                    statusText.textContent = 'Downloading...';
                    percentageText.textContent = p + '%';
                    progressFill.style.width = p + '%';
                }
                if (prog.speed) document.getElementById('progress-speed').textContent = prog.speed;
                if (prog.eta) document.getElementById('progress-eta').textContent = prog.eta;
            }
        } catch (error) {}
    }

    function showError(msg) {
        statusText.textContent = msg;
        postActions.style.display = 'flex';
    }

    // --- Batch Download ---
    const batchDownloadBtn = document.getElementById('batch-download-btn');
    const batchUrls = document.getElementById('batch-urls');
    const batchProgressContainer = document.getElementById('batch-progress-container');
    const batchList = document.getElementById('batch-list');
    const batchOverallStatus = document.getElementById('batch-overall-status');
    const batchNewBtn = document.getElementById('batch-new-btn');
    let batchPoll = null;

    batchDownloadBtn.addEventListener('click', async () => {
        const urls = batchUrls.value.trim();
        if(!urls) return Swal.fire('Oops', 'Enter some URLs first!', 'warning');

        batchForm.style.display = 'none';
        document.querySelector('.mode-toggle').style.display = 'none';
        batchProgressContainer.style.display = 'block';
        batchList.innerHTML = '';
        batchNewBtn.style.display = 'none';

        try {
            const res = await fetch('/batch-download', {
                method: 'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({urls})
            });
            if(res.ok) {
                batchPoll = setInterval(pollBatch, 1000);
            }
        } catch(e){}
    });

    async function pollBatch() {
        try {
            const res = await fetch('/progress?url=batch');
            const data = await res.json();
            batchOverallStatus.textContent = data.status;
            
            batchList.innerHTML = '';
            let allDone = true;
            for(const [u, status] of Object.entries(data.urls)) {
                batchList.innerHTML += `<div class="batch-item"><span class="b-url">${u.substring(0,40)}...</span><span class="b-status">${status}</span></div>`;
                if(status !== 'Completed' && !status.startsWith('Error')) allDone = false;
            }

            if(data.status === 'All Completed' || allDone) {
                clearInterval(batchPoll);
                batchNewBtn.style.display = 'block';
                Swal.fire('Success', 'Batch Process Completed!', 'success');
            }
        } catch(e){}
    }

    batchNewBtn.addEventListener('click', () => {
        batchProgressContainer.style.display = 'none';
        batchForm.style.display = 'block';
        document.querySelector('.mode-toggle').style.display = 'inline-flex';
        batchUrls.value = '';
    });


    // --- Global Settings ---
    const settingPath = document.getElementById('setting-path');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const changeFolderBtn = document.getElementById('change-folder-btn');
    
    // Custom Folder Modal Elements
    const folderModal = document.getElementById('folder-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const folderBackBtn = document.getElementById('folder-back-btn');
    const currentFolderPath = document.getElementById('current-folder-path');
    const folderList = document.getElementById('folder-list');
    const selectFolderBtn = document.getElementById('select-folder-btn');
    
    let currentBrowserPath = '';
    let parentBrowserPath = '';

    async function loadSettings() {
        try {
            const res = await fetch('/api/settings');
            if(!res.ok) return;
            const settings = await res.json();
            settingPath.value = settings.download_path || '';
        } catch (e) {}
    }

    async function fetchFolders(path) {
        folderList.innerHTML = '<li><i class="fa-solid fa-spinner fa-spin"></i> Loading...</li>';
        try {
            const res = await fetch('/api/list-dir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            currentBrowserPath = data.current;
            parentBrowserPath = data.parent;
            currentFolderPath.value = currentBrowserPath || 'This PC (Drives)';
            
            folderBackBtn.disabled = !currentBrowserPath; // Disabled if at root
            folderList.innerHTML = '';
            
            if (data.dirs.length === 0) {
                folderList.innerHTML = '<li style="color:var(--text-muted);">Empty folder or access denied.</li>';
                return;
            }
            
            data.dirs.forEach(dir => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid ${currentBrowserPath ? 'fa-folder' : 'fa-hard-drive'}"></i> ${dir}`;
                li.addEventListener('click', () => {
                    const newPath = currentBrowserPath ? `${currentBrowserPath}\\${dir}`.replace(/\\\\/g, '\\') : dir;
                    fetchFolders(newPath);
                });
                folderList.appendChild(li);
            });
            
        } catch (e) {
            folderList.innerHTML = `<li style="color:red;">Error: ${e.message}</li>`;
        }
    }

    changeFolderBtn.addEventListener('click', () => {
        folderModal.style.display = 'flex';
        fetchFolders(settingPath.value || '');
    });

    closeModalBtn.addEventListener('click', () => {
        folderModal.style.display = 'none';
    });
    
    folderBackBtn.addEventListener('click', () => {
        if (!folderBackBtn.disabled) fetchFolders(parentBrowserPath);
    });
    
    selectFolderBtn.addEventListener('click', () => {
        if (currentBrowserPath) {
            settingPath.value = currentBrowserPath;
            folderModal.style.display = 'none';
        } else {
            Swal.fire('Info', 'Please select a specific folder or drive.', 'info');
        }
    });

    saveSettingsBtn.addEventListener('click', async () => {
        const newPath = settingPath.value.trim();
        try {
            await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ download_path: newPath }) });
            Swal.fire({icon: 'success', title: 'Saved', timer: 1500});
        } catch (e) {}
    });

    // --- Profile Settings ---
    const profileAvatar = document.getElementById('profile-avatar');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileBioInput = document.getElementById('profile-bio-input');
    const profileGenderInput = document.getElementById('profile-gender-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const pickImageBtn = document.getElementById('pick-image-btn');
    const hiddenAvatarUpload = document.getElementById('hidden-avatar-upload');

    const sidebarName = document.getElementById('sidebar-name');
    const sidebarBio = document.getElementById('sidebar-bio');
    const sidebarAvatarIcon = document.getElementById('sidebar-avatar-icon');
    const sidebarAvatarImg = document.getElementById('sidebar-avatar-img');

    // ... (rest of profile load methods remain same)

    async function loadProfile() {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            updateSidebarProfile(data);
        } catch (e) {}
    }

    async function loadProfileForm() {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            profileAvatar.value = data.avatar || '';
            profileNameInput.value = data.name || '';
            profileBioInput.value = data.bio || '';
            profileGenderInput.value = data.gender || 'Not Specified';
        } catch (e) {}
    }

    function updateSidebarProfile(data) {
        sidebarName.textContent = data.name || 'Pro User';
        sidebarBio.textContent = data.bio || 'Downloading master';
        if (data.avatar && data.avatar.trim() !== '') {
            sidebarAvatarIcon.style.display = 'none';
            sidebarAvatarImg.style.display = 'block';
            sidebarAvatarImg.src = data.avatar;
        } else {
            sidebarAvatarIcon.style.display = 'block';
            sidebarAvatarImg.style.display = 'none';
        }
    }

    pickImageBtn.addEventListener('click', () => {
        hiddenAvatarUpload.click();
    });
    
    hiddenAvatarUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        pickImageBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) profileAvatar.value = data.url;
        } catch(err) {}
        pickImageBtn.innerHTML = '<i class="fa-solid fa-image"></i> Browse PC';
    });

    saveProfileBtn.addEventListener('click', async () => {
        const data = {
            avatar: profileAvatar.value.trim(),
            name: profileNameInput.value.trim(),
            bio: profileBioInput.value.trim(),
            gender: profileGenderInput.value
        };
        try {
            await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            updateSidebarProfile(data);
            Swal.fire({icon: 'success', title: 'Profile Updated!', timer: 1500});
        } catch (e) {}
    });

    async function loadHistory() {
        const grid = document.getElementById('history-grid');
        grid.innerHTML = '<p>Loading history...</p>';
        try {
            const res = await fetch('/api/history');
            const history = await res.json();
            if (history.length === 0) return grid.innerHTML = '<p>No downloads yet.</p>';
            grid.innerHTML = '';
            history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-card';
                div.innerHTML = `
                    <img src="${item.thumbnail}" alt="Thumb">
                    <div class="details">
                        <h4>${item.title}</h4>
                        <p>${item.type} • ${item.date}</p>
                        ${item.file_path ? `
                        <div class="history-actions">
                            <button class="secondary-btn" onclick="playFile('${item.file_path.replace(/\\/g, '\\\\')}')"><i class="fa-solid fa-play"></i> Play</button>
                            <button class="secondary-btn" onclick="openFolder('${item.file_path.replace(/\\/g, '\\\\')}')"><i class="fa-solid fa-folder-open"></i> Folder</button>
                        </div>` : ''}
                    </div>`;
                grid.appendChild(div);
            });
        } catch (e) { grid.innerHTML = '<p>Error loading history.</p>'; }
    }

    window.playFile = async (path) => {
        try { await fetch('/api/play-file', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({path})}); } catch(e){}
    };
    window.openFolder = async (path) => {
        try { await fetch('/api/open-folder', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({path})}); } catch(e){}
    };
});
