# Reports and Exports Documentation

## Overview

The LinkBzaar platform now includes comprehensive PDF generation and file export capabilities for both administrators and sellers. This feature allows users to generate professional reports and export data in various formats.

## Features

### PDF Reports
- **User Reports**: Detailed user information and platform statistics
- **Analytics Reports**: Platform performance metrics and trends
- **Listing Catalogs**: Professional product and classified listings catalogs
- **Seller Performance Reports**: Individual seller analytics and performance metrics
- **Invoice Generation**: Professional invoice templates (ready for future implementation)

### File Exports
- **CSV Exports**: Data in comma-separated values format for analysis
- **Excel Exports**: Formatted spreadsheets with multiple worksheets
- **JSON Exports**: Raw data exports for backup and integration

## API Endpoints

### PDF Generation

#### User Reports
```
GET /api/reports/pdf/users/:userId?
```
- **Access**: Admin only
- **Parameters**: 
  - `userId` (optional): Specific user ID, or omit for summary report
- **Response**: PDF file download

#### Analytics Reports
```
GET /api/reports/pdf/analytics?period=30
```
- **Access**: Admin only
- **Query Parameters**:
  - `period`: Number of days (7, 30, 90)
- **Response**: PDF file download

#### Listing Catalogs
```
GET /api/reports/pdf/listings?type=all&category=&status=active&limit=50
```
- **Access**: Admin and Seller
- **Query Parameters**:
  - `type`: 'all', 'classified', 'product'
  - `category`: Filter by category
  - `status`: Filter by status
  - `limit`: Maximum number of listings
- **Response**: PDF file download
- **Note**: Sellers only see their own listings

#### Seller Performance Reports
```
GET /api/reports/pdf/seller/:sellerId?period=30
```
- **Access**: Admin and Seller
- **Parameters**:
  - `sellerId` (optional for admin): Specific seller ID
  - `period`: Number of days for analysis
- **Response**: PDF file download
- **Note**: Sellers can only generate their own reports

### File Exports

#### User Exports
```
GET /api/reports/export/users/csv?role=&verified=
GET /api/reports/export/users/excel?role=&verified=
```
- **Access**: Admin only
- **Query Parameters**:
  - `role`: Filter by user role
  - `verified`: Filter by verification status
- **Response**: File download

#### Listing Exports
```
GET /api/reports/export/listings/csv?type=all&category=&status=
GET /api/reports/export/listings/excel?type=all&category=&status=
```
- **Access**: Admin and Seller
- **Query Parameters**:
  - `type`: 'all', 'classified', 'product'
  - `category`: Filter by category
  - `status`: Filter by status
- **Response**: File download
- **Note**: Sellers only export their own listings

### Utility Endpoints

#### Cleanup Old Files
```
POST /api/reports/cleanup
```
- **Access**: Admin only
- **Description**: Removes files older than 24 hours

#### Test PDF Generation (Development)
```
GET /api/reports/test/pdf
```
- **Access**: No authentication required
- **Description**: Generates a test PDF for development purposes

## Frontend Integration

### Reports Page
The reports functionality is accessible through:
- **Admin Dashboard**: Quick Actions → "Reports & Exports"
- **Seller Dashboard**: Quick Actions → "Reports & Exports"
- **Direct URL**: `/reports`

### ReportGenerator Component
Located at `client/src/components/reports/ReportGenerator.jsx`

Key features:
- Role-based button visibility
- Dynamic button labels based on user role
- Loading states and error handling
- Automatic file download
- Toast notifications

## File Management

### Storage
- Generated files are stored in `server/exports/`
- Files are automatically cleaned up after 24 hours
- Temporary files are deleted after download

### Security
- All endpoints require authentication
- Role-based access control
- Sellers can only access their own data
- File cleanup prevents storage bloat

## PDF Templates

Templates are located in `server/templates/pdf/`:

### Available Templates
1. **user-report.hbs**: User information and statistics
2. **analytics-report.hbs**: Platform analytics with charts
3. **listing-catalog.hbs**: Product and classified listings
4. **seller-report.hbs**: Seller performance metrics
5. **invoice.hbs**: Professional invoice template

### Template Features
- Responsive design
- Professional styling
- Handlebars helpers for formatting
- Support for charts and graphs
- Company branding

## Dependencies

### Backend
- `puppeteer`: PDF generation from HTML
- `handlebars`: Template engine
- `csv-writer`: CSV file generation
- `exceljs`: Excel file generation
- `moment`: Date formatting

### Frontend
- `axios`: HTTP requests
- React components for UI

## Configuration

### Environment Variables
No additional environment variables required. The system uses existing authentication and database configurations.

### File Paths
- Templates: `server/templates/pdf/`
- Exports: `server/exports/`
- Services: `server/services/`

## Usage Examples

### Generate Analytics Report (Admin)
```javascript
// Frontend
const response = await axios.get('/api/reports/pdf/analytics?period=30', {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob'
});
```

### Export Seller Listings (Seller)
```javascript
// Frontend
const response = await axios.get('/api/reports/export/listings/excel?type=all', {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob'
});
```

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions for the requested resource
- **404 Not Found**: User or resource not found
- **500 Internal Server Error**: PDF generation or file export failure

### Error Responses
```json
{
  "message": "Failed to generate PDF report",
  "error": "Detailed error message"
}
```

## Performance Considerations

### PDF Generation
- Large datasets may take longer to process
- Puppeteer requires significant memory for complex reports
- Consider implementing pagination for large catalogs

### File Exports
- Excel files with multiple worksheets may be slower
- CSV exports are generally faster than Excel
- Automatic cleanup prevents disk space issues

## Future Enhancements

### Planned Features
1. **Scheduled Reports**: Automatic report generation
2. **Email Delivery**: Send reports via email
3. **Custom Templates**: User-defined report templates
4. **Chart Integration**: Dynamic chart generation in PDFs
5. **Bulk Operations**: Generate multiple reports at once

### Template Improvements
1. **Interactive Elements**: Clickable links in PDFs
2. **Advanced Styling**: More sophisticated layouts
3. **Localization**: Multi-language support
4. **Custom Branding**: User-specific branding options

## Troubleshooting

### Common Issues
1. **PDF Generation Fails**: Check Puppeteer installation and memory limits
2. **File Download Issues**: Verify file permissions and disk space
3. **Template Errors**: Check Handlebars syntax and data structure
4. **Authentication Errors**: Verify JWT token and user permissions

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` to see detailed error messages and file generation logs.
