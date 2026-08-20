export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DepositStatus = "unpaid" | "paid" | "waived";

export type GalleryCategory =
  | "braids"
  | "knotless"
  | "twists"
  | "cornrows"
  | "kids"
  | "special";

export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  priceFrom: number;
  durationMin: number;
  durationMax: number;
  image: string;
  featured: boolean;
  category: GalleryCategory;
};

export type StyleLook = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: GalleryCategory;
  serviceId: string;
  image: string;
  durationMin: number;
  durationMax: number;
  priceFrom: number;
  featured: boolean;
};

export type Stylist = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
  workingDays: number[];
  startHour: number;
  endHour: number;
};

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: GalleryCategory;
  styleId: string;
  serviceId: string;
  durationLabel: string;
  priceFrom: number;
};

export type Testimonial = {
  id: string;
  name: string;
  image: string;
  rating: number;
  quote: string;
  service: string;
};

export type Appointment = {
  id: string;
  reference: string;
  serviceId: string;
  styleId: string | null;
  stylistId: string;
  date: string;
  time: string;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  deposit: {
    required: boolean;
    amount: number;
    status: DepositStatus;
  };
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  favoriteStyleIds: string[];
  createdAt: string;
};

export type EmailLog = {
  id: string;
  to: string;
  subject: string;
  html: string;
  createdAt: string;
};

export type StoreData = {
  services: Service[];
  styles: StyleLook[];
  stylists: Stylist[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  appointments: Appointment[];
  customers: Customer[];
  emails: EmailLog[];
};

export type BookingPayload = {
  serviceId: string;
  styleId: string | null;
  stylistId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
};
