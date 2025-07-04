import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Select from '../ui/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../ui/Toast';
import axios from 'axios';

const ReportGenerator = ({ userRole = 'admin' }) => {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const downloadFile = async (url, filename) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Create blob link to download
            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            showToast('File downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast(error.response?.data?.message || 'Failed to download file', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (type, params = {}) => {
        const endpoints = {
            userReport: '/api/reports/pdf/users',
            analytics: '/api/reports/pdf/analytics',
            listings: '/api/reports/pdf/listings',
            sellerReport: '/api/reports/pdf/seller'
        };

        const queryString = new URLSearchParams(params).toString();
        const url = `${endpoints[type]}${queryString ? `?${queryString}` : ''}`;
        const filename = `${type}-report-${Date.now()}.pdf`;

        await downloadFile(url, filename);
    };

    const exportData = async (type, format, params = {}) => {
        const endpoints = {
            users: `/api/reports/export/users/${format}`,
            listings: `/api/reports/export/listings/${format}`
        };

        const queryString = new URLSearchParams(params).toString();
        const url = `${endpoints[type]}${queryString ? `?${queryString}` : ''}`;
        const filename = `${type}-export-${Date.now()}.${format}`;

        await downloadFile(url, filename);
    };

    const testPDF = async () => {
        await downloadFile('/api/reports/test/pdf', 'test-report.pdf');
    };

    return (
        <div className="space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex items-center space-x-3">
                        <LoadingSpinner />
                        <span>Generating report...</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* PDF Reports */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">PDF Reports</h3>
                    <div className="space-y-3">
                        {userRole === 'admin' && (
                            <>
                                <Button
                                    onClick={() => generatePDF('userReport')}
                                    className="w-full"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    User Summary Report
                                </Button>
                                <Button
                                    onClick={() => generatePDF('analytics', { period: '30' })}
                                    className="w-full"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    Analytics Report (30 days)
                                </Button>
                                <Button
                                    onClick={() => generatePDF('analytics', { period: '90' })}
                                    className="w-full"
                                    variant="secondary"
                                    disabled={loading}
                                >
                                    Analytics Report (90 days)
                                </Button>
                            </>
                        )}
                        {(userRole === 'seller' || userRole === 'admin') && (
                            <Button
                                onClick={() => generatePDF('sellerReport', { period: '30' })}
                                className="w-full"
                                variant="primary"
                                disabled={loading}
                            >
                                {userRole === 'seller' ? 'My Performance Report' : 'Seller Performance Report'}
                            </Button>
                        )}
                        <Button
                            onClick={() => generatePDF('listings', { type: 'all', status: 'active' })}
                            className="w-full"
                            variant="primary"
                            disabled={loading}
                        >
                            Active Listings Catalog
                        </Button>
                        <Button
                            onClick={() => generatePDF('listings', { type: 'classified' })}
                            className="w-full"
                            variant="secondary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Classified Ads' : 'Classified Ads Catalog'}
                        </Button>
                        <Button
                            onClick={() => generatePDF('listings', { type: 'product' })}
                            className="w-full"
                            variant="secondary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Products' : 'Products Catalog'}
                        </Button>
                    </div>
                </Card>

                {/* CSV Exports */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">CSV Exports</h3>
                    <div className="space-y-3">
                        {userRole === 'admin' && (
                            <>
                                <Button
                                    onClick={() => exportData('users', 'csv')}
                                    className="w-full"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    All Users
                                </Button>
                                <Button
                                    onClick={() => exportData('users', 'csv', { role: 'seller' })}
                                    className="w-full"
                                    variant="secondary"
                                    disabled={loading}
                                >
                                    Sellers Only
                                </Button>
                                <Button
                                    onClick={() => exportData('users', 'csv', { verified: 'true' })}
                                    className="w-full"
                                    variant="secondary"
                                    disabled={loading}
                                >
                                    Verified Users
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => exportData('listings', 'csv', { type: 'all' })}
                            className="w-full"
                            variant="primary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Listings' : 'All Listings'}
                        </Button>
                        <Button
                            onClick={() => exportData('listings', 'csv', { status: 'active' })}
                            className="w-full"
                            variant="secondary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Active Listings' : 'Active Listings'}
                        </Button>
                    </div>
                </Card>

                {/* Excel Exports */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Excel Exports</h3>
                    <div className="space-y-3">
                        {userRole === 'admin' && (
                            <>
                                <Button
                                    onClick={() => exportData('users', 'excel')}
                                    className="w-full"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    Users Spreadsheet
                                </Button>
                                <Button
                                    onClick={() => exportData('users', 'excel', { role: 'seller' })}
                                    className="w-full"
                                    variant="secondary"
                                    disabled={loading}
                                >
                                    Sellers Spreadsheet
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => exportData('listings', 'excel')}
                            className="w-full"
                            variant="primary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Listings Spreadsheet' : 'Listings Spreadsheet'}
                        </Button>
                        <Button
                            onClick={() => exportData('listings', 'excel', { type: 'classified' })}
                            className="w-full"
                            variant="secondary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Classified Ads' : 'Classified Ads Only'}
                        </Button>
                        <Button
                            onClick={() => exportData('listings', 'excel', { type: 'product' })}
                            className="w-full"
                            variant="secondary"
                            disabled={loading}
                        >
                            {userRole === 'seller' ? 'My Products' : 'Products Only'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Test Section (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <Card className="p-6 border-dashed border-2 border-gray-300">
                    <h3 className="text-lg font-semibold mb-4 text-gray-600">Development Testing</h3>
                    <Button
                        onClick={testPDF}
                        className="w-full"
                        variant="outline"
                        disabled={loading}
                    >
                        Test PDF Generation
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default ReportGenerator;
