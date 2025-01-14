export interface Order {
    id: number;
    container_id: number;
    product_name: string;
    quantity: number;
    order_status: string;
    created_at: string;
    closed_at: string | null;
  }
  