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
    makeDraggable(document.getElementById('budget-window'));
    makeDraggable(document.getElementById('expense-window'));
    makeDraggable(document.getElementById('savings-window'));
    makeDraggable(document.getElementById('reports-window'));
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trans-date').value = today;
    
    // Load financial data
    loadFinancialData();
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

function openBudgetTracker() {
    const window = document.getElementById('budget-window');
    window.style.display = 'flex';
    window.style.top = '80px';
    window.style.left = '100px';
    updateBudgetDisplay();
}

function openExpenseManager() {
    const window = document.getElementById('expense-window');
    window.style.display = 'flex';
    window.style.top = '100px';
    window.style.left = '150px';
    updateExpenseDisplay();
}

function openSavingsGoal() {
    const window = document.getElementById('savings-window');
    window.style.display = 'flex';
    window.style.top = '120px';
    window.style.left = '200px';
    updateSavingsDisplay();
}

function openFinancialReports() {
    const window = document.getElementById('reports-window');
    window.style.display = 'flex';
    window.style.top = '140px';
    window.style.left = '250px';
    generateReport();
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

// ============================================
// PERSONAL FINANCE APPLICATIONS
// ============================================

// Financial Data Storage
let transactions = [];
let savingsGoals = [];

// Load financial data from localStorage
function loadFinancialData() {
    const savedTransactions = localStorage.getItem('webos_transactions');
    const savedGoals = localStorage.getItem('webos_savings_goals');
    
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        // Add some sample transactions for demonstration
        transactions = [
            { id: 1, description: 'Monthly Salary', amount: 5000, type: 'income', category: 'salary', date: new Date().toISOString().split('T')[0] },
            { id: 2, description: 'Grocery Shopping', amount: 150, type: 'expense', category: 'food', date: new Date().toISOString().split('T')[0] },
            { id: 3, description: 'Electric Bill', amount: 80, type: 'expense', category: 'utilities', date: new Date().toISOString().split('T')[0] },
            { id: 4, description: 'Bus Pass', amount: 50, type: 'expense', category: 'transport', date: new Date().toISOString().split('T')[0] }
        ];
        saveFinancialData();
    }
    
    if (savedGoals) {
        savingsGoals = JSON.parse(savedGoals);
    } else {
        // Add sample savings goal
        savingsGoals = [
            { id: 1, name: 'Emergency Fund', target: 10000, current: 3500, deadline: '2025-12-31' },
            { id: 2, name: 'Vacation', target: 3000, current: 800, deadline: '2025-06-30' }
        ];
        saveFinancialData();
    }
    
    updateBudgetDisplay();
    updateExpenseDisplay();
    updateSavingsDisplay();
}

// Save financial data to localStorage
function saveFinancialData() {
    localStorage.setItem('webos_transactions', JSON.stringify(transactions));
    localStorage.setItem('webos_savings_goals', JSON.stringify(savingsGoals));
}

// Add Transaction
function addTransaction() {
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const type = document.getElementById('trans-type').value;
    const category = document.getElementById('trans-category').value;
    const date = document.getElementById('trans-date').value;
    
    if (!desc || !amount || !date) {
        alert('Please fill in all fields');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        description: desc,
        amount: amount,
        type: type,
        category: category,
        date: date
    };
    
    transactions.unshift(transaction);
    saveFinancialData();
    
    // Clear form
    document.getElementById('trans-desc').value = '';
    document.getElementById('trans-amount').value = '';
    
    updateBudgetDisplay();
    updateExpenseDisplay();
    updateSavingsDisplay();
    
    alert('Transaction added successfully!');
}

// Update Budget Display
function updateBudgetDisplay() {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(trans => {
        if (trans.type === 'income') {
            totalIncome += trans.amount;
        } else {
            totalExpenses += trans.amount;
        }
    });
    
    const balance = totalIncome - totalExpenses;
    
    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('balance-amount').textContent = `$${balance.toFixed(2)}`;
    
    // Update transactions list
    const container = document.getElementById('transactions-container');
    container.innerHTML = '';
    
    transactions.slice(0, 10).forEach(trans => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <div class="trans-info">
                <span class="trans-desc">${trans.description}</span>
                <span class="trans-date">${trans.date}</span>
            </div>
            <span class="trans-amount ${trans.type}">${trans.type === 'income' ? '+' : '-'}$${trans.amount.toFixed(2)}</span>
        `;
        container.appendChild(div);
    });
}

// Update Expense Display
function updateExpenseDisplay() {
    const categoryTotals = {};
    let totalExpenses = 0;
    
    transactions.filter(t => t.type === 'expense').forEach(trans => {
        if (!categoryTotals[trans.category]) {
            categoryTotals[trans.category] = 0;
        }
        categoryTotals[trans.category] += trans.amount;
        totalExpenses += trans.amount;
    });
    
    // Update category breakdown
    const breakdownContainer = document.getElementById('category-breakdown');
    breakdownContainer.innerHTML = '';
    
    Object.keys(categoryTotals).forEach(category => {
        const percentage = ((categoryTotals[category] / totalExpenses) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <div class="category-header">
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <span>$${categoryTotals[category].toFixed(2)} (${percentage}%)</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
        `;
        breakdownContainer.appendChild(div);
    });
    
    // Monthly stats
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = transactions.filter(t => {
        const transDate = new Date(t.date);
        return t.type === 'expense' && transDate.getMonth() === currentMonth;
    }).reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('monthly-stats').innerHTML = `
        <p><strong>This Month's Expenses:</strong> $${monthlyExpenses.toFixed(2)}</p>
        <p><strong>Average Daily:</strong> $${(monthlyExpenses / new Date().getDate()).toFixed(2)}</p>
    `;
}

// Update Savings Display
function updateSavingsDisplay() {
    const container = document.getElementById('goals-container');
    container.innerHTML = '';
    
    let totalTarget = 0;
    let totalCurrent = 0;
    
    savingsGoals.forEach(goal => {
        totalTarget += goal.target;
        totalCurrent += goal.current;
        
        const percentage = ((goal.current / goal.target) * 100).toFixed(1);
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <div class="goal-header">
                <h4>${goal.name}</h4>
                <button onclick="deleteGoal(${goal.id})" class="delete-btn">×</button>
            </div>
            <p class="goal-deadline">Deadline: ${goal.deadline}</p>
            <div class="goal-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <p>${percentage}% complete</p>
            </div>
            <div class="goal-amounts">
                <span>$${goal.current.toLocaleString()}</span>
                <span>/</span>
                <span>$${goal.target.toLocaleString()}</span>
            </div>
        `;
        container.appendChild(div);
    });
    
    // Update total progress
    const totalPercentage = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : 0;
    document.getElementById('total-savings-progress').style.width = `${Math.min(totalPercentage, 100)}%`;
    document.getElementById('savings-percentage').textContent = `${totalPercentage}% achieved ($${totalCurrent.toLocaleString()} / $${totalTarget.toLocaleString()})`;
}

// Add Savings Goal
function addSavingsGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const current = parseFloat(document.getElementById('goal-current').value) || 0;
    const deadline = document.getElementById('goal-deadline').value;
    
    if (!name || !target || !deadline) {
        alert('Please fill in all required fields');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name: name,
        target: target,
        current: current,
        deadline: deadline
    };
    
    savingsGoals.push(goal);
    saveFinancialData();
    
    // Clear form
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-current').value = '';
    document.getElementById('goal-deadline').value = '';
    
    updateSavingsDisplay();
    alert('Savings goal created successfully!');
}

// Delete Goal
function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        savingsGoals = savingsGoals.filter(g => g.id !== id);
        saveFinancialData();
        updateSavingsDisplay();
    }
}

// Generate Report
function generateReport() {
    const period = document.getElementById('report-period').value;
    const now = new Date();
    let filteredTransactions = [];
    
    if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'month') {
        filteredTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === now.getMonth() && transDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        filteredTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getFullYear() === now.getFullYear();
        });
    } else {
        filteredTransactions = transactions;
    }
    
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(1) : 0;
    
    document.getElementById('report-content').innerHTML = `
        <div class="report-grid">
            <div class="report-stat">
                <label>Total Income</label>
                <p class="income">$${income.toFixed(2)}</p>
            </div>
            <div class="report-stat">
                <label>Total Expenses</label>
                <p class="expense">$${expenses.toFixed(2)}</p>
            </div>
            <div class="report-stat">
                <label>Net Savings</label>
                <p class="${netSavings >= 0 ? 'income' : 'expense'}">$${netSavings.toFixed(2)}</p>
            </div>
            <div class="report-stat">
                <label>Savings Rate</label>
                <p>${savingsRate}%</p>
            </div>
        </div>
        <div class="report-summary-text">
            <p><strong>Analysis:</strong> ${getFinancialAdvice(netSavings, savingsRate)}</p>
        </div>
    `;
    
    // Net worth display
    const totalAssets = savingsGoals.reduce((sum, g) => sum + g.current, 0);
    document.getElementById('net-worth-display').innerHTML = `
        <p><strong>Current Net Worth:</strong> $${(totalAssets + netSavings).toLocaleString()}</p>
        <p><strong>Total Saved in Goals:</strong> $${totalAssets.toLocaleString()}</p>
    `;
}

// Get Financial Advice
function getFinancialAdvice(netSavings, savingsRate) {
    if (savingsRate >= 20) {
        return "Excellent! You're saving more than 20% of your income. Keep up the great work!";
    } else if (savingsRate >= 10) {
        return "Good job! You're on track, but try to increase your savings rate to 20%.";
    } else if (netSavings >= 0) {
        return "You're breaking even or saving a little. Look for ways to reduce expenses.";
    } else {
        return "Warning: You're spending more than you earn. Review your budget immediately!";
    }
}

// Export to CSV
function exportToCSV() {
    let csv = 'ID,Description,Amount,Type,Category,Date\n';
    transactions.forEach(t => {
        csv += `${t.id},"${t.description}",${t.amount},${t.type},${t.category},${t.date}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Clear All Data
function clearAllData() {
    if (confirm('WARNING: This will delete ALL your financial data. Are you sure?')) {
        localStorage.removeItem('webos_transactions');
        localStorage.removeItem('webos_savings_goals');
        transactions = [];
        savingsGoals = [];
        updateBudgetDisplay();
        updateExpenseDisplay();
        updateSavingsDisplay();
        alert('All data has been cleared.');
    }
}
