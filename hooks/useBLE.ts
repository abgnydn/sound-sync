import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { bleConfig } from '@/config/ble';

let bleManager: BleManager | null = null;

// Only initialize on native platforms
if (Platform.OS !== 'web') {
  bleManager = new BleManager();
}

export function useBLE() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Map<string, any>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Clean up BLE manager when component unmounts
      if (bleManager && Platform.OS !== 'web') {
        bleManager.destroy();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'web') {
      setError('Bluetooth is not supported on web');
      return false;
    }
    
    try {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const granted = await requestAndroidPermissions();
        if (!granted) {
          setError('Bluetooth permissions denied');
          return false;
        }
      }
      
      // iOS doesn't require explicit permissions for BLE scanning
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      setError('Error requesting permissions');
      return false;
    }
  };

  const requestAndroidPermissions = async () => {
    // This is a simplified version as we can't implement actual Android permission requests
    // without react-native-permissions
    console.log('Would request Android BLE permissions here');
    return true;
  };

  const scanForPeripherals = async () => {
    if (Platform.OS === 'web' || !bleManager) {
      console.log('BLE scanning not supported on web');
      return;
    }
    
    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;
      
      setIsScanning(true);
      setError(null);
      
      // Clear previous devices
      setDevices(new Map());
      
      bleManager.startDeviceScan(
        null, // Scan for all services
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            setError(error.message);
            stopScan();
            return;
          }
          
          if (device && device.name) {
            // Check if it's a SoundSync device
            if (device.name.includes('SoundSync')) {
              setDevices(prevDevices => {
                const newDevices = new Map(prevDevices);
                newDevices.set(device.id, device);
                return newDevices;
              });
            }
          }
        }
      );
      
      // Stop scan after duration
      setTimeout(stopScan, bleConfig.scanDuration);
    } catch (error) {
      console.error('BLE scan error:', error);
      setError('Failed to start BLE scan');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (Platform.OS === 'web' || !bleManager) return;
    
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (deviceId: string) => {
    if (Platform.OS === 'web' || !bleManager) {
      setError('BLE connections not supported on web');
      return null;
    }
    
    try {
      const device = await bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect to device');
      return null;
    }
  };

  return {
    isScanning,
    devices: Array.from(devices.values()),
    error,
    scanForPeripherals,
    stopScan,
    connectToDevice,
  };
}