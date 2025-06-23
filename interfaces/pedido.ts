export interface Pedido {
  id: string;
  nombre: string;
  direccion: string;
  estadoPedido:
    | "PENDIENTE"
    | "EN CAMINO"
    | "ENTREGADO"
    | "ANULADO"
    | "ASIGNADO";

  pedidoId: string;
  firmaCliente?: string | null;
  fotografiaEntrega?: string | null;
  estadoPedidoId?: string;
}
