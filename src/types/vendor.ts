export interface OperatingHours {
  day: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface MenuItem {
  name: string;
  price: string;
  description?: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  cuisine: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  priceRange?: number;
  operatingHours: OperatingHours[];
  menuItems: MenuItem[];
}