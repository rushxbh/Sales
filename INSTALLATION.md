# 📦 Complete Installation Guide

This guide provides step-by-step instructions for installing and setting up the Sales & Inventory Management System.

## 🎯 System Requirements

### **Minimum Requirements**
- **Operating System**: Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Node.js**: 18.0+ (for development)
- **Internet**: Required for initial setup and updates

### **Recommended Requirements**
- **RAM**: 8GB or more
- **Storage**: SSD with 2GB free space
- **Node.js**: 20.0+ (for development)
- **Display**: 1920x1080 or higher resolution

## 🚀 Installation Methods

### **Method 1: Pre-built Installer (Recommended)**

#### **Windows Installation**

1. **Download the Installer**
   - Go to [Releases](https://github.com/your-username/sales-inventory-app/releases)
   - Download `Sales-Inventory-Setup-1.0.0.exe`

2. **Run the Installer**
   - Right-click the downloaded file and select "Run as administrator"
   - If Windows Defender shows a warning, click "More info" → "Run anyway"
   - Follow the installation wizard:
     - Accept the license agreement
     - Choose installation directory (default: `C:\Program Files\Sales & Inventory Management`)
     - Select additional tasks (desktop shortcut, start menu entry)
     - Click "Install"

3. **First Launch**
   - Launch from desktop shortcut or Start menu
   - The application will initialize the database automatically
   - Login with default credentials: `admin` / `admin123`

#### **macOS Installation**

1. **Download the DMG**
   - Download `Sales-Inventory-1.0.0.dmg`

2. **Install the Application**
   - Double-click the DMG file to mount it
   - Drag "Sales & Inventory Management" to the Applications folder
   - If macOS shows "App can't be opened because it is from an unidentified developer":
     - Right-click the app and select "Open"
     - Click "Open" in the dialog

3. **First Launch**
   - Open from Applications folder or Launchpad
   - Grant necessary permissions when prompted
   - Login with default credentials: `admin` / `admin123`

#### **Linux Installation**

1. **Download AppImage**
   - Download `Sales-Inventory-1.0.0.AppImage`

2. **Make Executable and Run**
   \`\`\`bash
   chmod +x Sales-Inventory-1.0.0.AppImage
   ./Sales-Inventory-1.0.0.AppImage
   \`\`\`

3. **Optional: Install to System**
   \`\`\`bash
   # Move to applications directory
   sudo mv Sales-Inventory-1.0.0.AppImage /opt/sales-inventory
   
   # Create desktop entry
   cat > ~/.local/share/applications/sales-inventory.desktop << EOF
   [Desktop Entry]
   Name=Sales & Inventory Management
   Exec=/opt/sales-inventory
   Icon=sales-inventory
   Type=Application
   Categories=Office;
   EOF
   \`\`\`

### **Method 2: Build from Source**

#### **Prerequisites Installation**

1. **Install Node.js**
   - **Windows**: Download from [nodejs.org](https://nodejs.org/) and run installer
   - **macOS**: 
     \`\`\`bash
     # Using Homebrew
     brew install node
     
     # Or download from nodejs.org
     \`\`\`
   - **Linux**:
     \`\`\`bash
     # Ubuntu/Debian
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs
     
     # CentOS/RHEL
     curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
     sudo yum install -y nodejs
     \`\`\`

2. **Install Git**
   - **Windows**: Download from [git-scm.com](https://git-scm.com/)
   - **macOS**: `brew install git` or download from git-scm.com
   - **Linux**: `sudo apt-get install git` (Ubuntu) or `sudo yum install git` (CentOS)

3. **Verify Installation**
   \`\`\`bash
   node --version  # Should show v18.0.0 or higher
   npm --version   # Should show 9.0.0 or higher
   git --version   # Should show git version
   \`\`\`

#### **Source Code Setup**

1. **Clone Repository**
   \`\`\`bash
   git clone https://github.com/your-username/sales-inventory-app.git
   cd sales-inventory-app
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   # Install all dependencies
   npm install
   
   # This may take 5-10 minutes depending on your internet connection
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit configuration (optional for basic setup)
   # nano .env.local  # Linux/macOS
   # notepad .env.local  # Windows
   \`\`\`

4. **Database Initialization**
   \`\`\`bash
   # Initialize database with default data
   npm run db:init
   
   # You should see:
   # ✅ Database tables created successfully
   # ✅ Default data inserted successfully
   # 🎉 Database initialization completed successfully!
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   # Start the application in development mode
   npm run dev
   
   # This will:
   # 1. Start Next.js development server on http://localhost:3000
   # 2. Launch Electron application automatically
   \`\`\`

6. **Build Production Version**
   \`\`\`bash
   # Build the application
   npm run build
   
   # Create installer for your platform
   npm run electron:dist
   
   # Installers will be created in the 'dist' directory
   \`\`\`

## 🗄️ Database Setup

### **Automatic Setup (Recommended)**

The application automatically creates and configures the SQLite database on first run.

**Database Location:**
- **Windows**: `%APPDATA%\sales-inventory-management\database\inventory.db`
- **macOS**: `~/Library/Application Support/sales-inventory-management/database/inventory.db`
- **Linux**: `~/.config/sales-inventory-management/database/inventory.db`

### **Manual Database Setup**

If you need to manually initialize the database:

\`\`\`bash
# Initialize fresh database
npm run db:init

# Reset existing database (⚠️ This deletes all data!)
npm run db:reset

# Create additional admin user
npm run create-admin

# Add sample data for testing
npm run db:seed
\`\`\`

### **Database Backup**

The application includes automatic backup functionality:

1. **Automatic Backups**: Created daily by default
2. **Manual Backup**: Available through the application menu
3. **Backup Location**: `database/backups/` directory

## ⚙️ Configuration

### **Company Settings**

After installation, configure your company information:

1. **Login** with admin credentials
2. **Go to Settings** → Company Information
3. **Update the following**:
   - Company name and address
   - Phone and email
   - GST registration number
   - Tax rates and preferences

### **User Management**

Create additional users for your team:

1. **Go to Settings** → User Management
2. **Click "Add User"**
3. **Assign appropriate roles**:
   - **Admin**: Full access
   - **Sales**: Invoice and customer management
   - **Inventory**: Product and stock management
   - **Viewer**: Read-only access

### **Email Configuration (Optional)**

To enable email notifications:

1. **Go to Settings** → Notifications → Email
2. **Configure SMTP settings**:
   - **Gmail**: Use App Passwords
   - **Outlook**: Use standard credentials
   - **Custom SMTP**: Enter server details

### **SMS Configuration (Optional)**

To enable SMS notifications:

1. **Sign up for Twilio** (or another SMS provider)
2. **Go to Settings** → Notifications → SMS
3. **Enter your credentials**:
   - Account SID
   - Auth Token
   - Phone Number

## 🔧 Troubleshooting

### **Installation Issues**

#### **Windows Issues**

**Problem**: "Windows protected your PC" message
**Solution**: 
1. Click "More info"
2. Click "Run anyway"
3. Or temporarily disable Windows Defender

**Problem**: Installation fails with permission error
**Solution**: 
1. Right-click installer
2. Select "Run as administrator"

#### **macOS Issues**

**Problem**: "App can't be opened because it is from an unidentified developer"
**Solution**:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog

**Problem**: App crashes on startup
**Solution**:
1. Check Console app for error messages
2. Ensure macOS version is 10.14 or higher

#### **Linux Issues**

**Problem**: AppImage won't run
**Solution**:
\`\`\`bash
# Make executable
chmod +x Sales-Inventory-1.0.0.AppImage

# Install FUSE if needed
sudo apt-get install fuse
\`\`\`

**Problem**: Missing dependencies
**Solution**:
\`\`\`bash
# Install required libraries
sudo apt-get install libgtk-3-0 libxss1 libasound2
\`\`\`

### **Database Issues**

#### **Database Corruption**

If the database becomes corrupted:

\`\`\`bash
# For source installation
npm run db:reset
npm run db:init

# For installed version
# Delete database file and restart application
# Windows: %APPDATA%\sales-inventory-management\database\
# macOS: ~/Library/Application Support/sales-inventory-management/database/
# Linux: ~/.config/sales-inventory-management/database/
\`\`\`

#### **Permission Issues**

If you get database permission errors:

**Windows**:
1. Run application as administrator
2. Check antivirus settings

**macOS/Linux**:
\`\`\`bash
# Fix permissions
chmod 755 ~/.config/sales-inventory-management/
chmod 644 ~/.config/sales-inventory-management/database/inventory.db
\`\`\`

### **Performance Issues**

#### **Slow Startup**

1. **Check available disk space** (need at least 500MB)
2. **Close other applications** to free up RAM
3. **Restart the application**
4. **Check antivirus** isn't scanning the application

#### **Database Performance**

If the application becomes slow with large amounts of data:

1. **Backup your data**
2. **Restart the application**
3. **Consider archiving old data**

### **Network Issues**

#### **Email Not Working**

1. **Check internet connection**
2. **Verify SMTP settings**
3. **For Gmail**: Use App Passwords, not regular password
4. **Check firewall settings**

#### **Updates Not Working**

1. **Check internet connection**
2. **Temporarily disable antivirus**
3. **Check proxy settings**

## 📞 Getting Help

### **Log Files**

If you encounter issues, check the log files:

**Location**:
- **Windows**: `%APPDATA%\sales-inventory-management\logs\`
- **macOS**: `~/Library/Application Support/sales-inventory-management/logs/`
- **Linux**: `~/.config/sales-inventory-management/logs/`

**Files**:
- `combined.log`: All application logs
- `error.log`: Error messages only

### **Support Channels**

1. **Documentation**: Check README.md and this installation guide
2. **GitHub Issues**: [Report bugs](https://github.com/your-username/sales-inventory-app/issues)
3. **Email Support**: support@yourcompany.com
4. **Community Forum**: [discussions](https://github.com/your-username/sales-inventory-app/discussions)

### **Before Contacting Support**

Please provide:
1. **Operating system** and version
2. **Application version**
3. **Error messages** (from log files)
4. **Steps to reproduce** the issue
5. **Screenshots** if applicable

---

**🎉 Congratulations! Your Sales & Inventory Management System is now ready to use!**

**Next Steps:**
1. Change the default admin password
2. Configure your company settings
3. Add your first products
4. Create customer records
5. Start processing sales!
\`\`\`

```text file="LICENSE"
MIT License

Copyright (c) 2024 Sales & Inventory Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
