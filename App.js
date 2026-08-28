import React, { useState, useRef } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

export default function App() {
    const [cameraPermission, requestCameraPermission] =
        useCameraPermissions();

    const [location, setLocation] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const cameraRef = useRef(null);

    // CAPTURAR LOCALIZAÇÃO

    async function getLocation() {
        try {
            setLoading(true);
            setErrorMsg('');

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg(
                    'Permissão de localização negada.'
                );
                setLoading(false);
                return null;
            }

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            setLocation(currentLocation);

            return currentLocation;

        } catch (error) {
            setErrorMsg(
                'Não foi possível obter a localização.'
            );

            return null;

        } finally {
            setLoading(false);
        }
    }

    // TIRAR FOTO

    async function takePicture() {
        if (!cameraRef.current) {
            return;
        }

        try {
            setErrorMsg('');

            // Obtém a localização antes de tirar a foto
            const currentLocation = location || await getLocation();

            if (!currentLocation) {
                return;
            }

            const result =
                await cameraRef.current.takePictureAsync();

            setPhoto({
                uri: result.uri,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

        } catch (error) {
            setErrorMsg(
                'Não foi possível tirar a foto.'
            );
        }
    }

    // PERMISSÃO DA CÂMERA

    if (!cameraPermission) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!cameraPermission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.title}>
                    Permissão da câmera
                </Text>

                <Text style={styles.text}>
                    Precisamos acessar a câmera para tirar
                    uma foto do local.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={requestCameraPermission}
                >
                    <Text style={styles.buttonText}>
                        Permitir câmera
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // FOTO CAPTURADA
    if (photo) {
        return (
            <View style={styles.container}>

                <View style={styles.photoContainer}>

                    <Image
                        source={{ uri: photo.uri }}
                        style={styles.photo}
                    />

                    {/* COORDENADAS SOBRE A FOTO */}
                    <View style={styles.coordinates}>
                        <Text style={styles.coordinateText}>
                            Latitude: {photo.latitude.toFixed(6)}
                        </Text>

                        <Text style={styles.coordinateText}>
                            Longitude: {photo.longitude.toFixed(6)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setPhoto(null)}
                >
                    <Text style={styles.buttonText}>
                        Tirar outra foto
                    </Text>
                </TouchableOpacity>

            </View>
        );
    }

    // CÂMERA

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Localização e Foto
            </Text>

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
            />

            {loading && (
                <ActivityIndicator
                    size="large"
                    style={styles.loading}
                />
            )}

            {errorMsg !== '' && (
                <Text style={styles.error}>
                    {errorMsg}
                </Text>
            )}

            {location && (
                <View style={styles.locationCard}>

                    <Text style={styles.locationText}>
                        Latitude:{' '}
                        {location.coords.latitude.toFixed(6)}
                    </Text>

                    <Text style={styles.locationText}>
                        Longitude:{' '}
                        {location.coords.longitude.toFixed(6)}
                    </Text>

                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={takePicture}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    Tirar foto
                </Text>
            </TouchableOpacity>

        </View>
    );
}


// ESTILOS

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },

    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },

    camera: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },

    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    loading: {
        margin: 15,
    },

    error: {
        color: '#c13535',
        textAlign: 'center',
        marginTop: 10,
    },

    locationCard: {
        padding: 10,
        marginTop: 10,
        backgroundColor: '#eee',
        borderRadius: 8,
    },

    locationText: {
        fontSize: 15,
        marginBottom: 5,
    },

    photoContainer: {
        flex: 1,
        position: 'relative',
    },

    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 10,
    },

    coordinates: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 8,
    },

    coordinateText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

});