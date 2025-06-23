import { usePedido } from "@/hooks/usePedido";
import { Pedido } from "@/interfaces/pedido";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const estadoColor: {
  [key: string]: string;
} = {
  PENDIENTE: "#f39c12",
  "EN CAMINO": "#3498db",
  ENTREGADO: "#2ecc71",
  ANULADO: "#e74c3c",
  ASIGNADO: "#9b59b6",
};

const idOperario = "1";

const OrderScreen = () => {
  const router = useRouter();
  const { pedidos, loading, error, obtenerPedidos } = usePedido();

  useFocusEffect(
    useCallback(() => {
      obtenerPedidos(idOperario);
    }, [])
  );

  const renderItem = ({ item }: { item: Pedido }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/pedido/[id]",
          params: { id: item.pedidoId },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View>
        <Text style={styles.name}>{item.nombre}</Text>
        <Text style={styles.address}>{item.direccion}</Text>
        <View
          style={[
            styles.chip,
            { backgroundColor: estadoColor[item.estadoPedido] + "33" },
          ]}
        >
          <Text
            style={[styles.chipText, { color: estadoColor[item.estadoPedido] }]}
          >
            {item.estadoPedido}
          </Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos Asignados</Text>
        <Pressable onPress={() => router.replace("/auth/login")}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text
          style={{
            color: "#e74c3c",
            marginTop: 40,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.pedidoId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No hay pedidos asignados.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  chip: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  logout: {
    fontSize: 14,
    color: "#007bff",
  },
  card: {
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
  },
  arrow: {
    fontSize: 24,
    color: "#aaa",
  },
});
