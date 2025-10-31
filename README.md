# AgentiX - AI-Powered Document Processing Platform

AgentiX is an intelligent document processing and procurement management platform that leverages AI to automate invoice processing, document matching, and supplier management workflows.

## Overview

AgentiX streamlines the procurement process by automatically processing invoices, packing lists, and bills of lading, then matching them with purchase orders and ERP systems. The platform uses AI to identify discrepancies, suggest actions, and facilitate communication between buyers and vendors.

## Key Features

### 📊 **Dashboard & Analytics**
- Real-time document processing metrics
- Interactive charts showing monthly document trends
- Supplier distribution analysis
- Processing accuracy tracking (96.1% system accuracy)
- Top performing suppliers visualization

### 📄 **Document Processing**
- **Invoice Processing**: Automatic extraction and validation of invoice data
- **Packing List Management**: Processing and matching of packing lists
- **Bill of Lading Integration**: Handling of shipping documents
- **Multi-format Support**: PDF, image, and text document processing

### 🔍 **Intelligent Matching**
- **Three-way Matching**: Automatic matching of invoices, packing lists, and purchase orders
- **ERP Integration**: Seamless integration with enterprise resource planning systems
- **Exception Handling**: Smart detection of mismatches and discrepancies
- **Status Tracking**: Real-time status updates (Match, Partial Match, Mismatch)

### 🤖 **AI-Powered Actions**
- **Smart Notifications**: Automated buyer and vendor notifications
- **Email Templates**: Pre-configured email templates for different scenarios
- **PO Amendment Requests**: Automatic generation of purchase order amendments
- **Exception Resolution**: AI-suggested actions for resolving discrepancies

### 📈 **Reporting & Insights**
- **Pending Review Management**: Track documents requiring manual review
- **Summary Reports**: Comprehensive reporting on document processing
- **Analytics Dashboard**: Visual insights into supplier performance and trends
- **Export Capabilities**: Export data for external analysis

### 🔧 **Workflow Management**
- **Review Status Tracking**: Pending, In Progress, Approved, Rejected statuses
- **Document Audit Trail**: Complete history of document processing
- **User-friendly Interface**: Modern, responsive design with intuitive navigation
- **Real-time Updates**: Live data refresh every 5 seconds

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner for toast notifications
- **Icons**: Tabler Icons
- **Backend**: Next.js API routes
- **Database**: Integration ready for various database systems

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agentix
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard
- Access real-time metrics and analytics
- View document processing trends
- Monitor supplier performance

### Document Review
- Review pending documents requiring attention
- Update review statuses
- Trigger AI actions for exception handling

### Analytics
- Analyze monthly document trends
- Review supplier distribution
- Track processing accuracy
- Monitor top performing suppliers

## API Endpoints

- `/api/invoices` - Invoice data management
- `/api/packing` - Packing list processing
- `/api/send-email` - Email notification system
- `/api/ai-actions` - AI-powered action triggers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

# DEMO APP

To try the app, you can visit this:
master.d2gsbftap58rgk.amplifyapp.com