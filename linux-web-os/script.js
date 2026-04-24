// Linux Web OS - Main JavaScript

// File System Simulation
const fileSystem = {
    '/home/user': {
        type: 'folder',
        children: {
            'Documents': { type: 'folder', children: {} },
            'Downloads': { type: 'folder', children: {} },
            'Pictures': { type: 'folder', children: {} },
            'Music': { type: 'folder', children: {} },
            'readme.txt': { type: 'file', content: 'Welcome to Linux Web OS!' },
            'notes.txt': { type: 'file', content: 'My important notes...' }
        }
    },
    '/home/user/Documents': {
        type: 'folder',
        children: {
            'project.txt': { type: 'file', content: 'Project documentation' },
            'report.pdf': { type: 'file', content: '[PDF Content]' }
        }
    },
    '/home/user/Downloads': {
        type: 'folder',
        children: {}
    },
    '/home/user/Pictures': {
        type: 'folder',
        children: {
            'photo1.jpg': { type: 'file', content: '[Image]' },
            'photo2.jpg': { type: 'file', content: '[Image]' }
        }
    },
    '/home/user/Music': {
        type: 'folder',
        children: {
            'song.mp3': { type: 'file', content: '[Audio]' }
        }
    }
};

let currentPath = '/home/user';
let terminalHistory = [];
let historyIndex = -1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Terminal input handler
    const terminalInput = document.getElementById('terminal-input');
    terminalInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            executeCommand(this.value);
            this.value = '';
        }
    });
    
    // Terminal input handler for history
    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < terminalHistory.length - 1) {
                historyIndex++;
                this.value = terminalHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                this.value = terminalHistory[historyIndex];
            } else if (historyIndex === 0) {
                historyIndex = -1;
                this.value = '';
            }
        }
    });
    
    // Load system info
    loadSystemInfo();
    
    // Make windows draggable
    makeDraggable(document.getElementById('terminal-window'));
    makeDraggable(document.getElementById('file-browser-window'));
    makeDraggable(document.getElementById('text-editor-window'));
    makeDraggable(document.getElementById('settings-window'));
});

// Clock functionality
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('clock').textContent = now.toLocaleDateString('en-US', options);
}

// Window management
function openTerminal() {
    const window = document.getElementById('terminal-window');
    window.style.display = 'flex';
    window.style.top = '100px';
    window.style.left = '150px';
    document.getElementById('terminal-input').focus();
}

function openFileBrowser() {
    const window = document.getElementById('file-browser-window');
    window.style.display = 'flex';
    window.style.top = '120px';
    window.style.left = '200px';
    renderFileList(currentPath);
}

function openTextEditor() {
    const window = document.getElementById('text-editor-window');
    window.style.display = 'flex';
    window.style.top = '140px';
    window.style.left = '250px';
}

function openSettings() {
    const window = document.getElementById('settings-window');
    window.style.display = 'flex';
    window.style.top = '160px';
    window.style.left = '300px';
}

function closeWindow(windowId) {
    document.getElementById(windowId).style.display = 'none';
}

// Draggable windows
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Terminal functionality
function executeCommand(command) {
    const output = document.getElementById('terminal-output');
    const prompt = document.getElementById('prompt');
    
    terminalHistory.unshift(command);
    historyIndex = -1;
    
    output.innerHTML += `<div>${prompt.textContent}${command}</div>`;
    
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();
    
    switch(cmd) {
        case 'help':
            output.innerHTML += `<div>Available commands:
  help     - Show this help message
  clear    - Clear terminal
  ls       - List directory contents
  cd       - Change directory
  pwd      - Print working directory
  cat      - Display file content
  mkdir    - Create directory
  touch    - Create file
  whoami   - Display current user
  date     - Display current date/time
  uname    - System information
  echo     - Display text
  exit     - Close terminal</div><br>`;
            break;
            
        case 'clear':
            output.innerHTML = '';
            return;
            
        case 'ls':
            const dir = fileSystem[currentPath];
            if (dir && dir.children) {
                const items = Object.keys(dir.children).map(name => {
                    const item = dir.children[name];
                    return item.type === 'folder' ? `<span style="color: #667eea">📁 ${name}/</span>` : `📄 ${name}`;
                });
                output.innerHTML += `<div>${items.join('<br>')}</div><br>`;
            }
            break;
            
        case 'pwd':
            output.innerHTML += `<div>${currentPath}</div><br>`;
            break;
            
        case 'cd':
            const targetPath = args[1] || '/home/user';
            if (targetPath === '..') {
                const parts = currentPath.split('/');
                parts.pop();
                const newPath = parts.join('/') || '/';
                if (fileSystem[newPath]) {
                    currentPath = newPath;
                } else {
                    output.innerHTML += `<div style="color: #ff6b6b">cd: no such directory</div><br>`;
                }
            } else if (targetPath === '~' || targetPath === '/home/user') {
                currentPath = '/home/user';
            } else if (fileSystem[targetPath] && fileSystem[targetPath].type === 'folder') {
                currentPath = targetPath;
            } else {
                output.innerHTML += `<div style="color: #ff6b6b">cd: no such directory</div><br>`;
            }
            document.getElementById('prompt').textContent = `user@linux:${currentPath}$ `;
            output.innerHTML += `<div>Changed to ${currentPath}</div><br>`;
            break;
            
        case 'cat':
            if (args[1]) {
                const fileName = args[1];
                const dir = fileSystem[currentPath];
                if (dir && dir.children && dir.children[fileName]) {
                    if (dir.children[fileName].type === 'file') {
                        output.innerHTML += `<div>${dir.children[fileName].content}</div><br>`;
                    } else {
                        output.innerHTML += `<div style="color: #ff6b6b">cat: ${fileName}: Is a directory</div><br>`;
                    }
                } else {
                    output.innerHTML += `<div style="color: #ff6b6b">cat: ${fileName}: No such file</div><br>`;
                }
            } else {
                output.innerHTML += `<div>Usage: cat [filename]</div><br>`;
            }
            break;
            
        case 'whoami':
            output.innerHTML += `<div>user</div><br>`;
            break;
            
        case 'date':
            output.innerHTML += `<div>${new Date().toString()}</div><br>`;
            break;
            
        case 'uname':
            if (args[1] === '-a') {
                output.innerHTML += `<div>Linux web-os 5.15.0-web x86_64 GNU/Linux</div><br>`;
            } else {
                output.innerHTML += `<div>Linux</div><br>`;
            }
            break;
            
        case 'echo':
            output.innerHTML += `<div>${args.slice(1).join(' ')}</div><br>`;
            break;
            
        case 'mkdir':
            if (args[1]) {
                const dir = fileSystem[currentPath];
                if (dir && dir.children) {
                    dir.children[args[1]] = { type: 'folder', children: {} };
                    output.innerHTML += `<div>Directory '${args[1]}' created</div><br>`;
                }
            } else {
                output.innerHTML += `<div>Usage: mkdir [directory_name]</div><br>`;
            }
            break;
            
        case 'touch':
            if (args[1]) {
                const dir = fileSystem[currentPath];
                if (dir && dir.children) {
                    dir.children[args[1]] = { type: 'file', content: '' };
                    output.innerHTML += `<div>File '${args[1]}' created</div><br>`;
                }
            } else {
                output.innerHTML += `<div>Usage: touch [filename]</div><br>`;
            }
            break;
            
        case 'exit':
            closeWindow('terminal-window');
            break;
            
        case '':
            break;
            
        default:
            output.innerHTML += `<div style="color: #ff6b6b">${cmd}: command not found. Type 'help' for available commands.</div><br>`;
    }
    
    output.scrollTop = output.scrollHeight;
}

// File Browser functionality
function renderFileList(path) {
    const fileList = document.getElementById('file-list');
    const filePath = document.getElementById('file-path');
    
    filePath.textContent = path;
    fileList.innerHTML = '';
    
    const dir = fileSystem[path];
    if (dir && dir.children) {
        Object.keys(dir.children).forEach(name => {
            const item = dir.children[name];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'file-item';
            itemDiv.onclick = () => {
                if (item.type === 'folder') {
                    currentPath = path + '/' + name;
                    renderFileList(currentPath);
                } else {
                    alert(`File: ${name}\nContent: ${item.content}`);
                }
            };
            
            const icon = item.type === 'folder' ? '📁' : getFileIcon(name);
            itemDiv.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${name}</div>
            `;
            fileList.appendChild(itemDiv);
        });
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'txt': '📄',
        'pdf': '📕',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'mp3': '🎵',
        'wav': '🎵',
        'mp4': '🎬',
        'avi': '🎬',
        'js': '📜',
        'html': '🌐',
        'css': '🎨'
    };
    return icons[ext] || '📄';
}

// Text Editor functionality
function saveFile() {
    const content = document.getElementById('text-editor-area').value;
    localStorage.setItem('webos_saved_file', content);
    alert('File saved successfully! (Stored in browser localStorage)');
}

function clearEditor() {
    document.getElementById('text-editor-area').value = '';
}

// Settings functionality
function toggleDarkMode() {
    const checkbox = document.getElementById('dark-mode-toggle');
    if (checkbox.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function changeBgColor(color) {
    const desktop = document.getElementById('desktop');
    desktop.style.background = `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -30)} 100%)`;
}

function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function loadSystemInfo() {
    const info = document.getElementById('system-info');
    info.innerHTML = `
        <strong>Operating System:</strong> Linux Web OS<br>
        <strong>Kernel Version:</strong> 5.15.0-web<br>
        <strong>Architecture:</strong> x86_64<br>
        <strong>Browser:</strong> ${navigator.userAgent.split('(')[0].trim()}<br>
        <strong>Screen Resolution:</strong> ${screen.width} x ${screen.height}<br>
        <strong>Memory:</strong> ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'}<br>
        <strong>CPU Cores:</strong> ${navigator.hardwareConcurrency || 'N/A'}
    `;
}
