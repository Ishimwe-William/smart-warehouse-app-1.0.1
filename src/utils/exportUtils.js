import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { StorageAccessFramework } from 'expo-file-system';

/**
 * Converts an array of objects to a CSV string
 */
export const convertToCSV = (dataArray, headers, keys) => {
    if (!dataArray || dataArray.length === 0) return '';

    const headerRow = headers;
    const dataRows = dataArray.map(item =>
        keys.map(key => {
            const value = item[key];
            return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
        })
    );

    const allRows = [headerRow, ...dataRows];
    return allRows.map(row => row.join(',')).join('\n');
};

/**
 * Save file to Media Library (alternative to Downloads)
 */
const saveToMediaLibrary = async (content, fileName) => {
    try {
        // Request permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Storage permission is required to save the file');
            return false;
        }

        // Create a temporary file
        const tempFileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(tempFileUri, content);

        // Save to media library
        const asset = await MediaLibrary.createAssetAsync(tempFileUri);
        await MediaLibrary.createAlbumAsync('CSVExports', asset, false);

        Alert.alert('Success', 'File saved to media library in the CSVExports album');
        return true;
    } catch (error) {
        console.error('MediaLibrary save error:', error);
        return false;
    }
};

/**
 * Share file using system dialog
 */
const shareFile = async (content, fileName, mimeType) => {
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, content);

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: 'Share CSV File',
            UTI: 'public.comma-separated-values-text'
        });
        return true;
    } else {
        Alert.alert('Sharing Not Available', 'Cannot share file on this device.');
        return false;
    }
};

/**
 * Export and share data as CSV
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
        const mimeType = 'text/csv';

        if (Platform.OS === 'android') {
            try {
                // Let user explicitly choose where to save the file
                Alert.alert(
                    "Choose Folder",
                    "Please select a folder OTHER THAN Downloads when the file picker opens. Downloads folder may not be writable.",
                    [{ text: "OK", onPress: async () => {
                            try {
                                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                                if (!permissions.granted) {
                                    console.log("Permission denied or dialog canceled");
                                    return await shareFile(csvContent, fileName, mimeType);
                                }

                                console.log("Selected directory:", permissions.directoryUri);

                                // Check if the user selected the problematic Downloads directory
                                if (permissions.directoryUri.includes('com.android.providers.downloads.documents/tree/downloads')) {
                                    Alert.alert(
                                        "Cannot use Downloads folder",
                                        "The Downloads folder is not writable on this device. Please use the share option instead.",
                                        [{ text: "Share File", onPress: () => shareFile(csvContent, fileName, mimeType) }]
                                    );
                                    return false;
                                }

                                // Otherwise try to write to the selected directory
                                try {
                                    const fileUri = await StorageAccessFramework.createFileAsync(
                                        permissions.directoryUri,
                                        fileName,
                                        mimeType
                                    );

                                    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                                        encoding: FileSystem.EncodingType.UTF8
                                    });

                                    Alert.alert('Success', `CSV file saved as ${fileName}`);
                                    return true;
                                } catch (createFileError) {
                                    console.error('Error creating file:', createFileError);
                                    return await shareFile(csvContent, fileName, mimeType);
                                }
                            } catch (err) {
                                console.error('Error with permissions or saving:', err);
                                return await shareFile(csvContent, fileName, mimeType);
                            }
                        }}]
                );
                return true; // Return true as we've handled showing UI to the user
            } catch (error) {
                console.error('Overall export error:', error);
                return await shareFile(csvContent, fileName, mimeType);
            }
        } else {
            // iOS or fallback
            return await shareFile(csvContent, fileName, mimeType);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        Alert.alert('Export Error', 'Failed to export data.');
        return false;
    }
};

/**
 * Export warehouse temperature/humidity data
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