import { usePedido } from "@/hooks/usePedido";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Signature from "react-native-signature-canvas";

const estadosDisponibles = [
  { label: "PENDIENTE", value: 1 },
  { label: "EN CAMINO", value: 2 },
  { label: "ENTREGADO", value: 3 },
  { label: "ANULADO", value: 4 },
  { label: "ASIGNADO", value: 5 },
];

export default function DetallePedidoScreen() {
  const { id } = useLocalSearchParams();
  const { obtenerPedidoPorId, error, loading, actualizarPedidoConImagenes } =
    usePedido();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pedido, setPedido] = useState<any>(null);
  const [estado, setEstado] = useState<number>(2);
  const [imagen, setImagen] = useState<string | null>(null);
  const [firma, setFirma] = useState<string | null>(null);
  const [estadoOriginal, setEstadoOriginal] = useState<number>(2);
  const [isSigning, setIsSigning] = useState(false);

  const sigRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPedido = async () => {
      if (!id) return;
      const data = await obtenerPedidoPorId(String(id));
      if (data && isMounted) {
        setPedido(data);
        setEstado(Number(data.estadoPedidoId) || 2);
        setEstadoOriginal(Number(data.estadoPedidoId) || 2);
        setFirma(data.firmaCliente || null);
        setImagen(data.fotografiaEntrega || null);
      }
    };
    fetchPedido();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleOK = (signature: string) => {
    setFirma(signature);
  };

  const handleEnd = () => {
    if (sigRef.current) {
      sigRef.current.readSignature();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  const handleBorrarFirma = () => setFirma(null);
  const handleBorrarImagen = () => setImagen(null);

  const handleGuardar = async () => {
    if (
      estado === estadoOriginal &&
      !imagen &&
      (!firma || firma.trim() === "")
    ) {
      Alert.alert("Sin cambios", "No se ha modificado ningún dato.");
      return;
    }
    try {
      const ok = await actualizarPedidoConImagenes(
        id as string,
        imagen,
        firma,
        String(estado)
      );
      if (ok) {
        Alert.alert("Éxito", "Estado actualizado con éxito.");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "No se pudo actualizar el pedido.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar el pedido.");
      console.error(e);
    }
  };

  const handleStartSigning = () => setIsSigning(true);
  const handleEndSigning = () => setIsSigning(false);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff", paddingBottom: insets.bottom }}
    >
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          Cargando pedido...
        </Text>
      ) : error ? (
        <Text style={{ color: "#e74c3c", textAlign: "center", marginTop: 40 }}>
          {error}
        </Text>
      ) : !pedido ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No se encontró el pedido.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: 40 + insets.bottom },
          ]}
          scrollEnabled={!isSigning}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>ACTUALIZAR ESTADO</Text>
          <Text style={styles.label}>Cliente: {pedido.nombre}</Text>
          <Text style={styles.label}>Dirección: {pedido.direccion}</Text>

          <Text style={styles.label}>Estado del Pedido</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={estado}
              onValueChange={(itemValue) => setEstado(Number(itemValue))}
              itemStyle={{ color: "black" }}
            >
              {estadosDisponibles.map((estado) => (
                <Picker.Item
                  label={estado.label}
                  value={estado.value}
                  key={estado.value}
                  color="black"
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Fotografía de Entrega</Text>
          <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
            {imagen ? (
              <View style={{ width: "100%", height: "100%" }}>
                <Image source={{ uri: imagen }} style={styles.imagePreview} />
                <TouchableOpacity
                  onPress={handleBorrarImagen}
                  style={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 2,
                  }}
                >
                  <Text style={{ color: "#e74c3c", fontWeight: "bold" }}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={{ color: "#888" }}>Upload</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Firma del Cliente</Text>
          <View style={styles.firmaContainer}>
            {firma ? (
              <View style={styles.firmaFixed}>
                <Image source={{ uri: firma }} style={styles.firmaFixed} />
                <TouchableOpacity
                  onPress={handleBorrarFirma}
                  style={styles.firmaDelete}
                >
                  <Text style={{ color: "#e74c3c", fontWeight: "bold" }}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Signature
                ref={sigRef}
                onOK={handleOK}
                onEnd={() => {
                  handleEnd();
                  handleEndSigning();
                }}
                onBegin={handleStartSigning}
                descriptionText="Firma aquí"
                clearText="Borrar"
                confirmText="Guardar"
                webStyle={`.m-signature-pad--footer { display: none; margin: 0px; } .m-signature-pad { height: 180px !important; }`}
                style={styles.firmaFixed}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              estado === estadoOriginal &&
              !imagen &&
              (!firma || firma.trim() === "")
                ? styles.buttonDisabled
                : {},
            ]}
            disabled={
              estado === estadoOriginal &&
              !imagen &&
              (!firma || firma.trim() === "")
            }
            onPress={handleGuardar}
          >
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
  },
  imagePlaceholder: {
    height: 250,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    objectFit: "contain",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    resizeMode: "cover",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  firmaContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  firmaFixed: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    backgroundColor: "#f8f8f8",
  },
  firmaDelete: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
});
