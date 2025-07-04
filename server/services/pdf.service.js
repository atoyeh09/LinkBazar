const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
    constructor() {
        this.browser = null;
        this.templatesPath = path.join(__dirname, '../templates/pdf');
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async generatePDF(templateName, data, options = {}) {
        try {
            const browser = await this.initBrowser();
            const page = await browser.newPage();

            // Load and compile template
            const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
            const templateContent = await fs.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateContent);
            
            // Generate HTML with data
            const html = template(data);
            
            // Set content and generate PDF
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                },
                ...options
            };

            const pdfBuffer = await page.pdf(pdfOptions);
            await page.close();

            return pdfBuffer;
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    }

    async generateUserReport(userData) {
        const data = {
            title: 'User Report',
            generatedAt: new Date().toLocaleString(),
            user: userData,
            totalUsers: userData.totalUsers || 0,
            activeUsers: userData.activeUsers || 0,
            newUsersThisMonth: userData.newUsersThisMonth || 0
        };

        return await this.generatePDF('user-report', data);
    }

    async generateAnalyticsReport(analyticsData) {
        const data = {
            title: 'Platform Analytics Report',
            generatedAt: new Date().toLocaleString(),
            analytics: analyticsData,
            period: analyticsData.period || 'Last 30 days'
        };

        return await this.generatePDF('analytics-report', data);
    }

    async generateListingCatalog(listings) {
        const data = {
            title: 'Listing Catalog',
            generatedAt: new Date().toLocaleString(),
            listings: listings,
            totalListings: listings.length
        };

        return await this.generatePDF('listing-catalog', data);
    }

    async generateSellerReport(sellerData) {
        const data = {
            title: 'Seller Performance Report',
            generatedAt: new Date().toLocaleString(),
            seller: sellerData,
            period: sellerData.period || 'Last 30 days'
        };

        return await this.generatePDF('seller-report', data);
    }

    async generateInvoice(invoiceData) {
        const data = {
            title: 'Invoice',
            generatedAt: new Date().toLocaleString(),
            invoice: invoiceData,
            invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`
        };

        return await this.generatePDF('invoice', data);
    }

    // Helper method to register Handlebars helpers
    registerHelpers() {
        handlebars.registerHelper('formatDate', function(date) {
            return new Date(date).toLocaleDateString();
        });

        handlebars.registerHelper('formatCurrency', function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });

        handlebars.registerHelper('formatNumber', function(number) {
            return new Intl.NumberFormat().format(number);
        });

        handlebars.registerHelper('eq', function(a, b) {
            return a === b;
        });

        handlebars.registerHelper('gt', function(a, b) {
            return a > b;
        });

        handlebars.registerHelper('lt', function(a, b) {
            return a < b;
        });
    }
}

// Register helpers on module load
const pdfService = new PDFService();
pdfService.registerHelpers();

module.exports = pdfService;
