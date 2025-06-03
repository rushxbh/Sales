 🏢 Sales & Inventory Management System

A complete desktop application for managing sales and inventory operations, specifically designed for plywood, hardware, and laminate businesses.

 ✨ Features

 📊 Core Functionality
- Product Management - Complete catalog with SKU, pricing, and stock tracking
- Inventory Control - Real-time stock levels with low stock alerts
- Sales Processing - Invoice generation with GST compliance
- Purchase Management - Purchase orders and supplier management
- Customer Management - Complete customer database with credit limits
- Quotation System - Professional quotations with conversion to invoices

 📈 Business Intelligence
- Real-time Analytics - Sales trends and inventory insights
- Advanced Reports - Profit analysis, stock reports, customer ledgers
- Visual Charts - Interactive charts and graphs
- Export Capabilities - PDF reports and CSV data export

 🔧 Advanced Features
- Multi-user Support - Role-based access control (Admin, Sales, Inventory, Viewer)
- Email/SMS Notifications - Automated alerts and notifications
- Barcode Scanning - Product identification and stock management
- Data Import/Export - CSV import/export for bulk operations
- Backup & Restore - Automated database backups
- Auto-updates - Seamless application updates

 🛡️ Security & Compliance
- User Authentication - Secure login with encrypted passwords
- Audit Trail - Complete activity logging
- GST Compliance - Indian tax compliance features
- Data Encryption - Secure data storage

 🚀 Quick Start

 📋 Prerequisites

Before installing, ensure you have:

1. Node.js 18+ - [Download from nodejs.org](https://nodejs.org/)
2. Git - [Download from git-scm.com](https://git-scm.com/)
3. Windows 10+, macOS 10.14+, or Linux

 📥 Installation

 Method 1: Download Release (Recommended)
1. Go to [Releases](https://github.com/your-username/sales-inventory-app/releases)
2. Download the installer for your platform:
   - Windows: `Sales-Inventory-Setup-1.0.0.exe`
   - macOS: `Sales-Inventory-1.0.0.dmg`
   - Linux: `Sales-Inventory-1.0.0.AppImage`
3. Run the installer and follow the setup wizard

 Method 2: Build from Source

\`\`\`bash
 Clone the repository
git clone https://github.com/your-username/sales-inventory-app.git
cd sales-inventory-app

 Install dependencies
npm install

 Initialize database
npm run db:init

 Start development mode
npm run dev
\`\`\`

 🔑 First Login

Default Credentials:
- Username: `admin`
- Password: `admin123`

⚠️ IMPORTANT: Change the default password immediately after first login!

 📖 Detailed Setup Guide

 🛠️ Development Setup

1. Clone and Install
\`\`\`bash
git clone https://github.com/your-username/sales-inventory-app.git
cd sales-inventory-app
npm install
\`\`\`

2. Environment Configuration
\`\`\`bash
 Copy environment template
cp .env.example .env.local

 Edit .env.local with your settings
nano .env.local
\`\`\`

3. Database Setup
\`\`\`bash
 Initialize database with tables and default data
npm run db:init

 (Optional) Create additional admin user
npm run create-admin

 (Optional) Seed with sample data
npm run db:seed
\`\`\`

4. Development Server
\`\`\`bash
 Start development mode (hot reload enabled)
npm run dev

 Or start components separately
npm run dev:next     Next.js frontend
npm run dev:electron  Electron app
\`\`\`

 🏗️ Production Build

\`\`\`bash
 Build the application
npm run build

 Create installer packages
npm run electron:dist

 Platform-specific builds
npm run electron:dist:win     Windows
npm run electron:dist:mac     macOS  
npm run electron:dist:linux   Linux
\`\`\`

 🗄️ Database Configuration

The application uses SQLite database stored in:
- Windows: `%APPDATA%/sales-inventory-management/database/`
- macOS: `~/Library/Application Support/sales-inventory-management/database/`
- Linux: `~/.config/sales-inventory-management/database/`

 Database Commands
\`\`\`bash
npm run db:init      Initialize new database
npm run db:reset     Reset database (⚠️ deletes all data)
npm run db:migrate   Run database migrations
npm run db:seed      Add sample data
\`\`\`

 📧 Email Configuration

Configure SMTP settings in the application or `.env.local`:

\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
\`\`\`

 📱 SMS Configuration

Configure Twilio for SMS notifications:

\`\`\`env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

 📚 User Guide

 👥 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full system access, user management, settings |
| Sales | Create invoices, manage customers, view reports |
| Inventory | Manage products, update stock, view inventory reports |
| Viewer | Read-only access to reports and data |

 🛍️ Basic Workflow

1. Setup
   - Configure company settings
   - Add product categories
   - Create user accounts

2. Inventory Management
   - Add products with SKU and pricing
   - Set reorder levels for low stock alerts
   - Update stock levels as needed

3. Customer Management
   - Add customer information
   - Set credit limits and payment terms
   - Maintain contact details

4. Sales Process
   - Create quotations for potential sales
   - Convert quotations to invoices
   - Process payments and track receivables

5. Reporting
   - Generate sales reports
   - Monitor inventory levels
   - Analyze profit margins

 📊 Key Features Guide

 Product Management
- Add products with detailed information
- Organize by categories
- Set pricing and tax rates
- Track stock levels automatically

 Invoice Generation
- Professional invoice templates
- GST-compliant formatting
- Email delivery to customers
- Payment tracking

 Inventory Control
- Real-time stock tracking
- Low stock alerts
- Stock movement history
- Barcode scanning support

 Reporting & Analytics
- Sales performance dashboards
- Inventory valuation reports
- Customer payment analysis
- Profit margin tracking

 🔧 Configuration

 ⚙️ Application Settings

Access settings through the application menu:

1. Company Information
   - Company name and address
   - GST registration details
   - Contact information

2. Tax Configuration
   - Default tax rates
   - HSN code management
   - Tax-inclusive pricing

3. Invoice Settings
   - Invoice numbering format
   - Payment terms
   - Invoice templates

4. Notification Settings
   - Email SMTP configuration
   - SMS provider settings
   - Alert preferences

 🔐 Security Settings

1. User Management
   - Create user accounts
   - Assign roles and permissions
   - Password policies

2. Backup Configuration
   - Automatic backup frequency
   - Backup retention period
   - Backup location

3. Audit Logging
   - Activity tracking
   - User action logs
   - Data change history

 🆘 Troubleshooting

 Common Issues

 Database Issues
\`\`\`bash
 Reset database if corrupted
npm run db:reset
npm run db:init

 Check database location
 Windows: %APPDATA%/sales-inventory-management/database/
 macOS: ~/Library/Application Support/sales-inventory-management/database/
 Linux: ~/.config/sales-inventory-management/database/
\`\`\`

 Build Issues
\`\`\`bash
 Clear build cache
npm run clean
npm install
npm run build
\`\`\`

 Permission Issues
- Run as administrator (Windows)
- Check file permissions (Linux/macOS)
- Ensure antivirus isn't blocking the application

 Performance Issues
- Close unnecessary applications
- Ensure sufficient disk space
- Check system requirements

 Log Files

Application logs are stored in:
- Windows: `%APPDATA%/sales-inventory-management/logs/`
- macOS: `~/Library/Application Support/sales-inventory-management/logs/`
- Linux: `~/.config/sales-inventory-management/logs/`

 Getting Help

1. Documentation: Check this README and in-app help
2. Issues: Report bugs on [GitHub Issues](https://github.com/your-username/sales-inventory-app/issues)
3. Support: Contact support at support@yourcompany.com

 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

 Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

 Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add documentation for new features

 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/) and [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database powered by [SQLite](https://sqlite.org/)

 📞 Support

For technical support or business inquiries:

- Email: support@yourcompany.com
- Website: https://yourcompany.com
- Documentation: https://docs.yourcompany.com

---

Made with ❤️ for small and medium businesses
