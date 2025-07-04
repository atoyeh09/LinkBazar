const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

class FileService {
    constructor() {
        this.exportsPath = path.join(__dirname, '../exports');
        this.ensureExportsDirectory();
    }

    async ensureExportsDirectory() {
        try {
            await fs.access(this.exportsPath);
        } catch (error) {
            await fs.mkdir(this.exportsPath, { recursive: true });
        }
    }

    // CSV Export Methods
    async exportToCSV(data, filename, headers) {
        const filePath = path.join(this.exportsPath, `${filename}.csv`);
        
        const csvWriter = createCsvWriter({
            path: filePath,
            header: headers
        });

        await csvWriter.writeRecords(data);
        return filePath;
    }

    async exportUsersToCSV(users) {
        const headers = [
            { id: '_id', title: 'ID' },
            { id: 'username', title: 'Username' },
            { id: 'email', title: 'Email' },
            { id: 'role', title: 'Role' },
            { id: 'isVerified', title: 'Verified' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'lastLogin', title: 'Last Login' }
        ];

        const processedUsers = users.map(user => ({
            ...user.toObject(),
            createdAt: user.createdAt.toISOString(),
            lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never'
        }));

        return await this.exportToCSV(processedUsers, `users_export_${Date.now()}`, headers);
    }

    async exportListingsToCSV(listings) {
        const headers = [
            { id: '_id', title: 'ID' },
            { id: 'title', title: 'Title' },
            { id: 'category', title: 'Category' },
            { id: 'price', title: 'Price' },
            { id: 'condition', title: 'Condition' },
            { id: 'location', title: 'Location' },
            { id: 'seller', title: 'Seller' },
            { id: 'status', title: 'Status' },
            { id: 'createdAt', title: 'Created At' }
        ];

        const processedListings = listings.map(listing => ({
            _id: listing._id,
            title: listing.title,
            category: listing.category,
            price: listing.price,
            condition: listing.condition,
            location: listing.location,
            seller: listing.seller?.username || 'Unknown',
            status: listing.status,
            createdAt: listing.createdAt.toISOString()
        }));

        return await this.exportToCSV(processedListings, `listings_export_${Date.now()}`, headers);
    }

    // Excel Export Methods
    async exportToExcel(data, filename, worksheetName = 'Sheet1') {
        const filePath = path.join(this.exportsPath, `${filename}.xlsx`);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);

        if (data.length > 0) {
            // Add headers
            const headers = Object.keys(data[0]);
            worksheet.addRow(headers);

            // Style headers
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Add data rows
            data.forEach(item => {
                worksheet.addRow(Object.values(item));
            });

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = Math.max(column.width || 10, 15);
            });
        }

        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    async exportUsersToExcel(users) {
        const processedUsers = users.map(user => ({
            ID: user._id.toString(),
            Username: user.username,
            Email: user.email,
            Role: user.role,
            Verified: user.isVerified ? 'Yes' : 'No',
            'Created At': user.createdAt.toISOString(),
            'Last Login': user.lastLogin ? user.lastLogin.toISOString() : 'Never'
        }));

        return await this.exportToExcel(processedUsers, `users_export_${Date.now()}`, 'Users');
    }

    async exportListingsToExcel(listings) {
        const processedListings = listings.map(listing => ({
            ID: listing._id.toString(),
            Title: listing.title,
            Category: listing.category,
            Price: listing.price,
            Condition: listing.condition,
            Location: listing.location,
            Seller: listing.seller?.username || 'Unknown',
            Status: listing.status,
            'Created At': listing.createdAt.toISOString()
        }));

        return await this.exportToExcel(processedListings, `listings_export_${Date.now()}`, 'Listings');
    }

    async exportAnalyticsToExcel(analyticsData) {
        const workbook = new ExcelJS.Workbook();
        
        // Overview sheet
        const overviewSheet = workbook.addWorksheet('Overview');
        overviewSheet.addRow(['Metric', 'Value']);
        overviewSheet.addRow(['Total Users', analyticsData.totalUsers || 0]);
        overviewSheet.addRow(['Active Users', analyticsData.activeUsers || 0]);
        overviewSheet.addRow(['Total Listings', analyticsData.totalListings || 0]);
        overviewSheet.addRow(['Active Listings', analyticsData.activeListings || 0]);
        overviewSheet.addRow(['Total Revenue', analyticsData.totalRevenue || 0]);

        // Style overview sheet
        const headerRow = overviewSheet.getRow(1);
        headerRow.font = { bold: true };
        overviewSheet.columns.forEach(column => {
            column.width = 20;
        });

        // User analytics sheet if data exists
        if (analyticsData.userAnalytics && analyticsData.userAnalytics.length > 0) {
            const userSheet = workbook.addWorksheet('User Analytics');
            userSheet.addRow(Object.keys(analyticsData.userAnalytics[0]));
            analyticsData.userAnalytics.forEach(item => {
                userSheet.addRow(Object.values(item));
            });
        }

        // Listing analytics sheet if data exists
        if (analyticsData.listingAnalytics && analyticsData.listingAnalytics.length > 0) {
            const listingSheet = workbook.addWorksheet('Listing Analytics');
            listingSheet.addRow(Object.keys(analyticsData.listingAnalytics[0]));
            analyticsData.listingAnalytics.forEach(item => {
                listingSheet.addRow(Object.values(item));
            });
        }

        const filePath = path.join(this.exportsPath, `analytics_export_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }

    // JSON Export Methods
    async exportToJSON(data, filename) {
        const filePath = path.join(this.exportsPath, `${filename}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return filePath;
    }

    // Utility Methods
    async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        } catch (error) {
            return null;
        }
    }

    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = await fs.readdir(this.exportsPath);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(this.exportsPath, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await this.deleteFile(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up old files:', error);
        }
    }
}

module.exports = new FileService();
