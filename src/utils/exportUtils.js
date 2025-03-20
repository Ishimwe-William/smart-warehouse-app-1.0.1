// src/utils/exportUtils.js
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Converts an array of data objects to CSV format
 * @param {Array} dataArray - Array of data objects to convert
 * @param {Array} headers - Array of header names
 * @param {Array} keys - Array of object keys corresponding to headers
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (dataArray, headers, keys) => {
    if (!dataArray || dataArray.length === 0) {
        return '';
    }

    // Create header row
    const headerRow = headers;

    // Create data rows by mapping each item to its corresponding keys
    const dataRows = dataArray.map(item =>
        keys.map(key => {
            const value = item[key];
            // Handle cases where values might contain commas
            return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
        })
    );

    // Combine all rows
    const allRows = [headerRow, ...dataRows];

    // Convert to CSV format
    const csvContent = allRows.map(row => row.join(',')).join('\n');

    return csvContent;
};

/**
 * Export data to a CSV file and share it
 * @param {Array} data - Array of data objects to export
 * @param {Array} headers - Array of header names for CSV
 * @param {Array} keys - Array of object keys corresponding to headers
 * @param {string} filePrefix - Prefix for the filename
 * @returns {Promise<void>}
 */
export const exportDataToCSV = async (data, headers, keys, filePrefix = 'exported_data') => {
    if (!data || data.length === 0) {
        Alert.alert('No Data', 'There is no data to export.');
        return false;
    }

    try {
        const csvContent = convertToCSV(data, headers, keys);
        const timestamp = new Date().getTime();
        const fileName = `${filePrefix}_${timestamp}.csv`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;

        // Write CSV content to a file
        await FileSystem.writeAsStringAsync(fileUri, csvContent);

        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
            // Share the file
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Save Data as CSV',
                UTI: 'public.comma-separated-values-text' // For iOS
            });
            return true;
        } else {
            Alert.alert('Sharing not available', 'Sharing is not available on this device.');
            return false;
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        Alert.alert('Export Error', 'Failed to export data. Please try again.');
        return false;
    }
};

/**
 * Export warehouse data specifically formatted for temperature and humidity
 * @param {Array} data - Warehouse data array
 * @param {string} timeframe - Current timeframe for filename
 * @returns {Promise<boolean>} Success status
 */
export const exportWarehouseData = async (data, timeframe) => {
    if (!data || data.length === 0) {
        Alert.alert('No Data', 'There is no data to export.');
        return false;
    }

    const headers = ['Date', 'Temperature (°C)', 'Humidity (%)'];
    const keys = ['createdAt', 'temperature', 'humidity'];
    return exportDataToCSV(data, headers, keys, `warehouse_data_${timeframe}`);
};

/**
 * Export any tabular data to CSV with custom formatting
 * @param {Object} options - Export options
 * @param {Array} options.data - Data array to export
 * @param {Array} options.headers - Column headers
 * @param {Array} options.keys - Data object keys to extract
 * @param {string} options.filename - Base filename without extension
 * @param {Function} options.transform - Optional function to transform data before export
 * @returns {Promise<boolean>} Success status
 */
export const exportCustomData = async ({
                                           data,
                                           headers,
                                           keys,
                                           filename = 'exported_data',
                                           transform = null
                                       }) => {
    if (!data || data.length === 0) {
        Alert.alert('No Data', 'There is no data to export.');
        return false;
    }

    // Apply transformation if provided
    const processedData = transform ? data.map(transform) : data;

    return exportDataToCSV(processedData, headers, keys, filename);
};

/**
 * Export data to Excel format (XLSX)
 * Note: This requires additional libraries like xlsx
 * To implement, install: npm install xlsx
 *
 * This is a placeholder for future implementation
 */
export const exportToExcel = async (data, filename = 'exported_data') => {
    // This would require additional libraries like xlsx
    Alert.alert(
        'Feature Not Available',
        'Excel export requires additional setup. Please use CSV export for now.'
    );
    return false;
};