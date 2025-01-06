export interface Vendor {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  cuisine: string;
  location: {
    lat: number;
    lng: number;
  };
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  priceRange?: number;
  openingTime?: string;
  closingTime?: string;
  menuItems?: Array<{
    name: string;
    price: string;
  }>;
}