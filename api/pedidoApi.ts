import api from "./axiosConfig";

export const obtenerPedidosRequest = (idOperario: string) => {
  //   return api.get(`/pedido/${idOperario}`);
  return api.get("/pedido/operario/" + idOperario);
};

export const obtenerPedidoId = (id: string) => {
  return api.get(`/pedido/${id}`);
};

export const actualizarFotoFirma = (
  idPedido: string,
  fotografiaEntrega: string,
  firmaCliente: string,
  estadoPedidoId: string
) => {
  const formData = new FormData();
  formData.append("fotografiaEntrega", fotografiaEntrega);
  formData.append("firmaCliente", firmaCliente);
  formData.append("estadoPedidoId", estadoPedidoId.toString());
  return api.put(`/pedido/actualizar-detalle/${idPedido}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
