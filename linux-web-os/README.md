# Linux Web OS

A simulated Linux desktop environment that runs entirely in your web browser.

## Features

- **Desktop Environment**: Classic desktop with icons and draggable windows
- **Terminal**: Functional command-line interface with common Linux commands
- **File Browser**: Navigate through a simulated file system
- **Text Editor**: Create and edit text files with save functionality
- **Settings**: Customize appearance with dark mode and background colors

## Applications

### Terminal
The terminal supports various Linux-like commands:
- `help` - Show available commands
- `ls` - List directory contents
- `cd [path]` - Change directory
- `pwd` - Print working directory
- `cat [file]` - Display file content
- `mkdir [name]` - Create directory
- `touch [file]` - Create file
- `whoami` - Display current user
- `date` - Display current date/time
- `uname -a` - System information
- `echo [text]` - Display text
- `clear` - Clear terminal
- `exit` - Close terminal

### File Browser
- Navigate through folders (Documents, Downloads, Pictures, Music)
- View files with appropriate icons based on file type
- Click on folders to navigate into them
- Click on files to view their content

### Text Editor
- Create and edit text files
- Save files to browser's localStorage
- Clear editor content

### Settings
- Toggle dark mode
- Change desktop background color
- View system information

## How to Use

1. Open `index.html` in any modern web browser
2. Click on desktop icons to open applications
3. Drag windows by their title bars to reposition them
4. Close windows using the × button

## Technical Details

- Pure HTML, CSS, and JavaScript (no external dependencies)
- Responsive design that adapts to different screen sizes
- Simulated file system stored in memory
- LocalStorage for persistent text editor saves

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge
- Firefox
- Safari
- Opera

## File Structure

```
linux-web-os/
├── index.html      # Main HTML file
├── style.css       # Stylesheet
└── script.js       # JavaScript logic
```

## Demo Commands to Try

In the terminal, try these commands:
```bash
help
ls
cd Documents
ls
pwd
cat ../readme.txt
whoami
uname -a
mkdir test_folder
touch new_file.txt
ls
```

Enjoy your Linux Web OS experience!
