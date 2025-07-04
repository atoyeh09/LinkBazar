import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { ReportGenerator } from '../components/reports';
import Card from '../components/ui/Card';

const Reports = () => {
    const { user } = useContext(AuthContext);

    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600">
                        You don't have permission to access reports. 
                        Only administrators and sellers can generate reports.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
                    <p className="mt-2 text-gray-600">
                        Generate PDF reports and export data in various formats
                    </p>
                </div>

                {/* Report Generator */}
                <ReportGenerator userRole={user.role} />

                {/* Information Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">PDF Reports</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Professional formatted reports with charts and analytics</li>
                            <li>• User summaries and platform analytics</li>
                            <li>• Listing catalogs with detailed information</li>
                            <li>• Downloadable and printable formats</li>
                        </ul>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Exports</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• CSV format for data analysis and import</li>
                            <li>• Excel spreadsheets with formatted data</li>
                            <li>• Filtered exports by category, status, or role</li>
                            <li>• Compatible with external tools and systems</li>
                        </ul>
                    </Card>
                </div>

                {/* Usage Guidelines */}
                <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Usage Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <h4 className="font-medium mb-2">For Administrators:</h4>
                            <ul className="space-y-1">
                                <li>• Access to all user and platform data</li>
                                <li>• Generate comprehensive analytics reports</li>
                                <li>• Export user lists and verification status</li>
                                <li>• Monitor platform performance metrics</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">For Sellers:</h4>
                            <ul className="space-y-1">
                                <li>• Generate catalogs of your listings</li>
                                <li>• Export your product and classified data</li>
                                <li>• Create professional listing presentations</li>
                                <li>• Track your selling performance</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* File Management Notice */}
                <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                File Management Notice
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Generated files are automatically cleaned up after 24 hours for security and storage optimization. 
                                    Please download your reports promptly after generation.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
