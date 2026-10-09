import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa tu pedido y finalízalo por WhatsApp.",
};

export default function CarritoLayout({ children }: LayoutProps<"/carrito">) {
  return children;
}
