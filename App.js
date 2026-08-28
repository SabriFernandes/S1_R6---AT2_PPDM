import React, { useState, useEffect, useRef } from "react";
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image} from "react-native";

import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function GpsScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Permissão da câmera
    const [cameraPermission, requestCameraPermission] =
        useCameraPermissions();

    // Referência da câmera
    const cameraRef = useRef(null);

    // Foto capturada
    const [capturedPhoto, setCapturedPhoto] = useState(null);

    // Captura a localização atual
    const fetchCurrentLocation = async () => {

        try {
            setLoading(true);
            setErrorMsg(null);

            // Solicita permissão para localização
            let { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg(
                    "A permissão para acesso à localização foi negada."
                );
                setLoading(false);
                return;
            }
            // Obtém a localização atual
            let currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });

            setLocation(currentLocation);

        } catch (error) {
            setErrorMsg(
                "Não foi possível obter a localização."
            );

        } finally {
            setLoading(false);

        }
    };
    // Tira a foto
    const takePicture = async () => {

        try {

            if (!cameraRef.current) {
                return;
            }
            // Verifica se existe localização
            if (!location) {
                setErrorMsg(
                    "Primeiro capture a localização."
                );
                return;
            }
            const photo =
                await cameraRef.current.takePictureAsync();
            setCapturedPhoto(photo.uri);

        } catch (error) {
            setErrorMsg(
                "Não foi possível tirar a foto."
            );
        }
    };
    // Enquanto a permissão da câmera está carregando
    if (!cameraPermission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Caso a câmera não tenha permissão
    if (!cameraPermission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Precisamos da sua permissão para acessar a câmera.
                </Text>
                <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestCameraPermission}
                >
                    <Text style={styles.buttonText}>
                        Conceder Permissão da Câmera
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>
                Rastreamento do GPS
            </Text>


            {/* CÂMERA OU FOTO */}

            {capturedPhoto ? (
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: capturedPhoto }}
                        style={styles.previewImage}
                    />
                    {/* Coordenadas sobre a foto */}

                    {location && (
                        <View style={styles.coordinatesOverlay}>

                            <Text style={styles.overlayText}>
                                Latitude:{" "}
                                {location.coords.latitude.toFixed(6)}
                            </Text>
                            <Text style={styles.overlayText}>
                                Longitude:{" "}
                                {location.coords.longitude.toFixed(6)}
                            </Text>
                        </View>

                    )}

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => setCapturedPhoto(null)}
                    >
                        <Text style={styles.buttonText}>
                            Tirar outra foto
                        </Text>
                    </TouchableOpacity>
                </View>

            ) : (

                <>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                    />
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takePicture}
                    >
                        <Text style={styles.buttonText}>
                            Tirar Foto
                        </Text>
                    </TouchableOpacity>
                </>

            )}

            {/* BOTÃO DO GPS */}
            <TouchableOpacity
                style={styles.fetchCurrentLocation}
                onPress={fetchCurrentLocation}
            >
                <Text style={styles.buttonText}>
                    Capturar coordenada
                </Text>

            </TouchableOpacity>
            {/* CARREGANDO */}

            {loading && (
                <ActivityIndicator
                    size="large"
                    style={{ marginTop: 20 }}
                />

            )}
            {/* ERRO */}

            {errorMsg && (

                <Text style={styles.errorText}>
                    {errorMsg}
                </Text>

            )}


            {/* INFORMAÇÕES DA LOCALIZAÇÃO */}

            {location && (

                <View style={styles.card}>
                    <Text style={styles.label}>
                        Latitude
                    </Text>
                    <Text>
                        {location.coords.latitude}
                    </Text>
                    <Text style={styles.label}>
                        Longitude
                    </Text>
                    <Text>
                        {location.coords.longitude}
                    </Text>
                    <Text style={styles.label}>
                        Precisão
                    </Text>

                    <Text>
                        {location.coords.accuracy}
                    </Text>

                </View>

            )}

        </View>
    );
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F8F5F0",
        padding: 20,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },

    camera: {
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
    },

    captureButton: {
        backgroundColor: "#2196F3",
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    fetchCurrentLocation: {
        backgroundColor: "#1E3A5F",
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    retryButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        marginTop: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    errorText: {
        color: "#c13535",
        textAlign: "center",
        marginTop: 15,
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginTop: 15,
        borderRadius: 10,
    },

    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5,
    },

    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    permissionText: {
        textAlign: "center",
        marginBottom: 20,
        fontSize: 16,
    },

    permissionButton: {
        backgroundColor: "#2196F3",
        padding: 15,
        borderRadius: 10,
    },

    previewContainer: {
        flex: 1,
        position: "relative",
    },

    previewImage: {
        flex: 1,
        width: "100%",
        borderRadius: 10,
    },

    coordinatesOverlay: {
        position: "absolute",
        bottom: 80,
        left: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        padding: 12,
        borderRadius: 8,
    },

    overlayText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

});