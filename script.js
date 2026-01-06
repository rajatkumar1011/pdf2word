pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        background: '#030712',
                        surface: '#0B1221',
                        primary: {
                            400: '#818cf8',
                            500: '#6366f1',
                            600: '#4f46e5',
                            glow: 'rgba(99, 102, 241, 0.5)'
                        },
                        accent: {
                            teal: '#2dd4bf',
                            pink: '#f472b6'
                        }
                    },
                    animation: {
                        'spin-slow': 'spin 8s linear infinite',
                        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        'slide-in-right': 'slide-in-right 0.3s ease-out',
                    },
                    keyframes: {
                        'pulse-glow': {
                            '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
                            '50%': { opacity: .7, boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)' },
                        },
                        'slide-up': {
                            '0%': { transform: 'translateY(20px)', opacity: 0 },
                            '100%': { transform: 'translateY(0)', opacity: 1 },
                        },
                        'slide-in-right': {
                            '0%': { transform: 'translateX(100%)', opacity: 0 },
                            '100%': { transform: 'translateX(0)', opacity: 1 },
                        }
                    },
                    backgroundImage: {
                        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                    }
                }
            }
        }
    


        /* --- VISUALS: BACKGROUND PARTICLES --- */
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, ' : 'rgba(45, 212, 191, '; 
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if(this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if(this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (Math.random() * 0.3 + 0.1) + ')';
                ctx.fill();
            }
        }

        for(let i=0; i<60; i++) particles.push(new Particle());

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, index) => {
                p.update();
                p.draw();
                // Connections
                for(let j=index; j<particles.length; j++){
                    const dx = p.x - particles[j].x;
                    const dy = p.y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if(dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - dist/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        /* --- VISUALS: CUSTOM CURSOR --- */
        const cursor = document.getElementById('custom-cursor');
        
        // Track Mouse Movement
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Hover Effect Logic
        // Use event delegation for better performance and dynamic elements
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest('button') || 
                e.target.closest('a') || 
                e.target.closest('input') || 
                e.target.closest('.group') ||
                e.target.tagName === 'I') {
                cursor.classList.add('hovering');
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest('button') || 
                e.target.closest('a') || 
                e.target.closest('input') || 
                e.target.closest('.group') ||
                e.target.tagName === 'I') {
                cursor.classList.remove('hovering');
            }
        });

        /* --- APP LOGIC --- */
        const fileInput = document.getElementById('file-input');
        const viewUpload = document.getElementById('view-upload');
        const viewPreview = document.getElementById('view-preview');
        const viewProcessing = document.getElementById('view-processing');
        const viewSuccess = document.getElementById('view-success');
        
        let currentFile = null;
        let pdfDoc = null;
        let convertedBlob = null;
        let sessionCount = 0;

        // --- Drag & Drop ---
        const dropArea = viewUpload;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

        dropArea.addEventListener('drop', handleDrop, false);
        dropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            if (files.length > 0 && files[0].type === 'application/pdf') {
                loadPreview(files[0]);
            } else {
                showToast("Invalid file type. Please upload a PDF.", "error");
            }
        }

        // --- Preview Logic ---
        async function loadPreview(file) {
            currentFile = file;
            
            // UI Update
            viewUpload.classList.add('hidden');
            viewPreview.classList.remove('hidden');
            
            // Metadata
            document.getElementById('meta-filename').innerText = file.name;
            document.getElementById('meta-size').innerHTML = `<i class="fa-regular fa-hdd mr-1"></i> ${(file.size / 1024 / 1024).toFixed(2)} MB`;

            try {
                const arrayBuffer = await file.arrayBuffer();
                pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
                
                document.getElementById('meta-pages').innerHTML = `<i class="fa-regular fa-file mr-1"></i> ${pdfDoc.numPages} Pages`;

                // Render Page 1
                const page = await pdfDoc.getPage(1);
                const viewport = page.getViewport({scale: 1.5});
                const canvas = document.getElementById('pdf-preview-canvas');
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

            } catch (err) {
                console.error(err);
                showToast("Failed to load PDF preview", "error");
                resetApp();
            }
        }

        // --- Conversion Logic ---
        async function startConversion() {
            if(!pdfDoc) return;

            viewPreview.classList.add('hidden');
            viewProcessing.classList.remove('hidden');

            const term = document.getElementById('terminal-content');
            const log = (msg) => {
                const line = document.createElement('div');
                line.innerText = `> ${msg}`;
                term.appendChild(line);
                term.scrollTop = term.scrollHeight;
            };

            let docContent = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Export</title>
                <style>body{font-family:'Calibri',sans-serif;}</style></head><body>
            `;

            log("Starting Text Extraction Engine...");
            log(`Analyzing ${pdfDoc.numPages} pages...`);

            try {
                for(let i=1; i<=pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    // Simple progress simulation
                    const progress = Math.round((i / pdfDoc.numPages) * 100);
                    document.getElementById('progress-percent').innerText = progress;
                    
                    log(`Page ${i}: Vectorizing ${textContent.items.length} text items...`);
                    
                    let lastY = -1;
                    let pageText = "";
                    
                    textContent.items.forEach(item => {
                        // Safety check: ensure transform exists before accessing it
                        const hasTransform = item.transform && item.transform.length >= 6;
                        const currentY = hasTransform ? item.transform[5] : lastY;

                        if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
                            pageText += "<br/>";
                        } else {
                            pageText += " ";
                        }
                        pageText += item.str;
                        if (hasTransform) lastY = currentY;
                    });

                    docContent += `<p>${pageText}</p><br clear='all' style='page-break-before:always' />`;
                    
                    // Delay for visual effect
                    if(pdfDoc.numPages < 10) await new Promise(r => setTimeout(r, 150));
                }

                docContent += "</body></html>";
                log("Recompiling document structure...");
                log("Finalizing binary blob...");

                convertedBlob = new Blob(['\ufeff', docContent], {
                    type: 'application/msword'
                });

                await new Promise(r => setTimeout(r, 500)); // Final polish delay
                
                viewProcessing.classList.add('hidden');
                viewSuccess.classList.remove('hidden');
                
                addToHistory(currentFile.name);
                showToast("Conversion successful!", "success");

            } catch (e) {
                log("CRITICAL ERROR: " + e.message);
                showToast("Conversion failed.", "error");
                setTimeout(resetApp, 2000);
            }
        }

        // --- Utils & Helpers ---
        function downloadFile() {
            if (!convertedBlob) return;
            const url = window.URL.createObjectURL(convertedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', currentFile.name.replace('.pdf', '.doc'));
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }

        function resetApp() {
            fileInput.value = '';
            currentFile = null;
            pdfDoc = null;
            convertedBlob = null;
            
            // Reset Views
            viewSuccess.classList.add('hidden');
            viewProcessing.classList.add('hidden');
            viewPreview.classList.add('hidden');
            viewUpload.classList.remove('hidden');
            
            // Reset Terminal
            document.getElementById('terminal-content').innerHTML = '<div>> System initialized</div>';
        }

        function addToHistory(filename) {
            sessionCount++;
            document.getElementById('stat-count').innerText = sessionCount;
            
            const list = document.getElementById('history-list');
            if(sessionCount === 1) list.innerHTML = ''; // Clear empty state

            const item = document.createElement('div');
            item.className = 'p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3 animate-slide-in-right';
            item.innerHTML = `
                <div class="w-8 h-8 rounded bg-blue-900/30 flex items-center justify-center text-blue-400">
                    <i class="fa-solid fa-file-word"></i>
                </div>
                <div class="overflow-hidden">
                    <div class="text-xs font-medium text-white truncate w-32">${filename}</div>
                    <div class="text-[10px] text-slate-500">Just now</div>
                </div>
                <div class="ml-auto text-green-400 text-xs"><i class="fa-solid fa-check"></i></div>
            `;
            list.insertBefore(item, list.firstChild);
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const colors = type === 'error' ? 'border-red-500/50 text-red-200 bg-red-900/80' : 
                          type === 'success' ? 'border-green-500/50 text-green-200 bg-green-900/80' : 
                          'border-indigo-500/50 text-indigo-200 bg-indigo-900/80';

            toast.className = `min-w-[200px] p-4 rounded-xl border backdrop-blur-md shadow-xl flex items-center gap-3 animate-slide-in-right ${colors}`;
            toast.innerHTML = `
                <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle'}"></i>
                <span class="text-sm font-medium">${message}</span>
            `;
            
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
