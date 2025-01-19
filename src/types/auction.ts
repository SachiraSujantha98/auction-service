export interface Auction {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}
