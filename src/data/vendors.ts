import { Vendor } from '../types/vendor';

export const vendors: Vendor[] = [
  {
    id: '1',
    name: "Maria's Tacos",
    description: 'Authentic Mexican street tacos with homemade salsas',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    cuisine: 'Mexican',
    location: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'NYC Hot Dogs',
    description: 'Classic New York hot dogs with all the fixings',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    cuisine: 'American',
    location: { lat: 40.7580, lng: -73.9855 }
  },
  {
    id: '3',
    name: 'Halal Paradise',
    description: 'Famous halal cart with chicken over rice',
    image: 'https://images.unsplash.com/photo-1606843046080-45bf7a23c39f?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    cuisine: 'Middle Eastern',
    location: { lat: 40.7549, lng: -73.9840 }
  }
];