import {
  actualizarFotoFirma,
  obtenerPedidoId,
  obtenerPedidosRequest,
} from "@/api/pedidoApi";
import { Pedido } from "@/interfaces/pedido";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { useState } from "react";

export function usePedido() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerPedidos = async (idOperario: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerPedidosRequest(idOperario);
      setPedidos(response.data);
    } catch (err: unknown) {
      let message = "Error al obtener pedidos";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        message = errorObj.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const obtenerPedidoPorId = async (
    id: string
  ): Promise<Pedido | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerPedidoId(id);
      return response.data;
    } catch (err: unknown) {
      let message = "Error al obtener el pedido";
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        message = errorObj.response?.data?.message || message;
      }
      setError(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const actualizarPedidoConImagenes = async (
    pedidoId: string,
    fotografiaEntrega: File | string | null,
    firmaCliente: File | string | null,
    estadoPedidoId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      let fotoUrl = "";
      if (fotografiaEntrega) {
        if (
          typeof fotografiaEntrega === "string" &&
          fotografiaEntrega.startsWith("file://")
        ) {
          const file: any = {
            uri: fotografiaEntrega,
            type: "image/jpeg",
            name: "foto.jpg",
          };
          fotoUrl = await uploadToCloudinary(file);
        } else {
          fotoUrl = await uploadToCloudinary(fotografiaEntrega);
        }
      }
      let firmaUrl = "";
      if (firmaCliente) {
        if (
          typeof firmaCliente === "string" &&
          firmaCliente.startsWith("file://")
        ) {
          const file: any = {
            uri: firmaCliente,
            type: "image/jpeg",
            name: "firma.jpg",
          };
          firmaUrl = await uploadToCloudinary(file);
        } else {
          firmaUrl = await uploadToCloudinary(firmaCliente);
        }
      }
      await actualizarFotoFirma(pedidoId, fotoUrl, firmaUrl, estadoPedidoId);
      return true;
    } catch (err) {
      console.log(err);
      setError("Error al actualizar el pedido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    pedidos,
    loading,
    error,
    obtenerPedidos,
    obtenerPedidoPorId,
    actualizarPedidoConImagenes,
  };
}
