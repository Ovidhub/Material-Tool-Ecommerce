import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { categories as seedCategories, products as seedProducts } from "../data/products";
import type { Category, Product } from "../data/products";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  emoji: string;
  qty: number;
};

export type User = {
  name: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
  avatar: string;
};

export type HeroSlide = {
  id: string;
  subtitle: string;
  title: string;
  title2: string;
  price: string;
  buttonText: string;
  link: string;
  image: string;
  brand: string;
};

export type PromoBanner = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image: string;
  style: "red" | "yellow" | "dark";
};

export type TrustItem = {
  id: string;
  title: string;
  desc: string;
};

export type AboutValue = {
  id: string;
  title: string;
  desc: string;
};

export type SiteContent = {
  brandName: string;
  brandAccent: string;
  tagline: string;
  logoUrl: string;
  logoBoxColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  promoText: string;
  promoCode: string;
  phone: string;
  email: string;
  address: string;
  cityLine: string;
  hours: string;
  heroSlides: HeroSlide[];
  homeCategoryTitle: string;
  homeCategorySubtitle: string;
  homeTrendingTitle: string;
  homeFeaturedTitle: string;
  homeNewArrivalsTitle: string;
  homePromoBanners: PromoBanner[];
  trustItems: TrustItem[];
  dealEyebrow: string;
  dealTitle: string;
  dealSubtitle: string;
  dealDescription: string;
  dealOldPrice: string;
  dealNewPrice: string;
  dealButtonText: string;
  dealLink: string;
  dealImage: string;
  testimonialTitle: string;
  testimonialQuote: string;
  testimonialName: string;
  testimonialRole: string;
  sidebarPromoEyebrow: string;
  sidebarPromoTitle: string;
  sidebarPromoSubtitle: string;
  sidebarPromoBody: string;
  sidebarPromoButton: string;
  sidebarPromoLink: string;
  aboutHeroEyebrow: string;
  aboutHeroTitle: string;
  aboutHeroHighlight: string;
  aboutHeroText: string;
  aboutImage: string;
  aboutMissionEyebrow: string;
  aboutMissionTitle: string;
  aboutMissionBody1: string;
  aboutMissionBody2: string;
  aboutValuesEyebrow: string;
  aboutValuesTitle: string;
  aboutValues: AboutValue[];
  aboutTeamEyebrow: string;
  aboutTeamTitle: string;
  footerDescription: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
};

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod?: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
};

export type PaymentMethodType = "stripe" | "paypal" | "crypto" | "bank" | "custom";

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  name: string;
  enabled: boolean;
  mode: "test" | "live";
  publicKey?: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  walletAddress?: string;
  network?: string;
  instructions?: string;
};

type State = {
  cart: CartItem[];
  user: User | null;
  wishlist: number[];
  orders: Order[];
  products: Product[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  siteContent: SiteContent;
  toast: string | null;
};

type Action =
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "REMOVE_FROM_CART"; productId: number }
  | { type: "UPDATE_QTY"; productId: number; qty: number }
  | { type: "CLEAR_CART" }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_WISHLIST"; productId: number }
  | { type: "PLACE_ORDER"; order: Order }
  | { type: "UPDATE_ORDER_STATUS"; orderId: string; status: Order["status"] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: number }
  | { type: "ADD_CATEGORY"; category: Category }
  | { type: "UPDATE_CATEGORY"; category: Category }
  | { type: "DELETE_CATEGORY"; categoryId: string }
  | { type: "ADD_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "UPDATE_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "DELETE_PAYMENT_METHOD"; methodId: string }
  | { type: "TOGGLE_PAYMENT_METHOD"; methodId: string }
  | { type: "UPDATE_SITE_CONTENT"; siteContent: SiteContent }
  | { type: "TOAST"; message: string | null };

const seedPaymentMethods: PaymentMethod[] = [
  {
    id: "stripe-default",
    type: "stripe",
    name: "Credit / Debit Card",
    enabled: true,
    mode: "test",
    publicKey: "pk_test_demo",
    instructions: "Cards are processed securely through Stripe.",
  },
];

const seedSiteContent: SiteContent = {
  brandName: "TOOL",
  brandAccent: "RACK",
  tagline: "Professional Material Tools & Equipment Store",
  logoUrl: "",
  logoBoxColor: "#dc2626",
  primaryColor: "#dc2626",
  secondaryColor: "#171717",
  accentColor: "#facc15",
  promoText: "Get Upto 25% Cashback On First Order",
  promoCode: "GET250FF",
  phone: "1-800-TOOL-495",
  email: "support@toolrack.com",
  address: "1234 Industrial Way",
  cityLine: "Portland, OR 97201",
  hours: "Mon-Fri: 7am-8pm · Sat: 8am-6pm",
  footerDescription:
    "Professional-grade power tools and equipment for contractors, builders, and serious DIYers. Trusted since 1998.",
  newsletterTitle: "Subscribe To Our Newsletter",
  newsletterSubtitle: "Get the latest deals, new arrivals, and exclusive offers.",
  homeCategoryTitle: "Shop By Categories",
  homeCategorySubtitle: "Browse our wide range of professional tools and equipment",
  homeTrendingTitle: "Trending Products",
  homeFeaturedTitle: "Featured Products",
  homeNewArrivalsTitle: "New Arrivals",
  homePromoBanners: [
    { id: "promo-1", eyebrow: "UP TO 15% OFF", title: "CIRCULAR SAW", subtitle: "WITH LASER", buttonText: "SHOP NOW", link: "/shop?category=circular-saws", image: "https://images.pexels.com/photos/11613793/pexels-photo-11613793.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", style: "red" },
    { id: "promo-2", eyebrow: "UP TO 30% OFF", title: "DEWALT DW715", subtitle: "NEW MACHINE", buttonText: "SHOP NOW", link: "/product/dewalt-dw715-miter-saw", image: "https://images.pexels.com/photos/5414384/pexels-photo-5414384.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400", style: "yellow" },
    { id: "promo-3", eyebrow: "PROFESSIONAL", title: "BOSCH GKS 235", subtitle: "TURBO CIRCULAR", buttonText: "SHOP NOW", link: "/product/bosch-gks-235-turbo-circular-saw", image: "https://images.pexels.com/photos/5846253/pexels-photo-5846253.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400", style: "dark" },
  ],
  trustItems: [
    { id: "trust-1", title: "Worldwide Shipping", desc: "For all Orders Over $200" },
    { id: "trust-2", title: "Money Back Guarantee", desc: "Guarantee Within In 30 Days" },
    { id: "trust-3", title: "Offers And Discounts", desc: "Back Returns In 7 Days" },
    { id: "trust-4", title: "24/7 Support Services", desc: "Contact us Anytime" },
  ],
  dealEyebrow: "EXCLUSIVE MONTH END OFFER",
  dealTitle: "BOSCH GKS 235",
  dealSubtitle: "TURBO CIRCULAR",
  dealDescription: "Professional 2050W turbo circular saw with 9-1/4\" blade. Perfect for demanding cutting applications.",
  dealOldPrice: "$245.00",
  dealNewPrice: "$185.00",
  dealButtonText: "SHOP NOW",
  dealLink: "/product/bosch-gks-235-turbo-circular-saw",
  dealImage: "https://images.pexels.com/photos/5846253/pexels-photo-5846253.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  testimonialTitle: "What Our Client Says",
  testimonialQuote: "ToolRack has been my go-to shop for 5 years. Quality tools, fast shipping, and unbeatable prices.",
  testimonialName: "Marcus Chen",
  testimonialRole: "General Contractor",
  sidebarPromoEyebrow: "LIMITED OFFER",
  sidebarPromoTitle: "20% OFF",
  sidebarPromoSubtitle: "GET 5 EQUIPMENT",
  sidebarPromoBody: "Use code POWER20 at checkout.",
  sidebarPromoButton: "SHOP NOW",
  sidebarPromoLink: "/shop?badge=Sale",
  aboutHeroEyebrow: "Our Story",
  aboutHeroTitle: "Building Trust,",
  aboutHeroHighlight: "One Tool At A Time.",
  aboutHeroText: "Since 1998, ToolRack has been the trusted partner for contractors, tradespeople, and serious DIYers across North America.",
  aboutImage: "https://images.pexels.com/photos/4312855/pexels-photo-4312855.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  aboutMissionEyebrow: "Our Mission",
  aboutMissionTitle: "Equip the hands that build our world.",
  aboutMissionBody1: "We believe the right tools make all the difference. Our team of experts personally tests and vets every product we carry.",
  aboutMissionBody2: "If it doesn't meet our standards, it doesn't make it to your job site.",
  aboutValuesEyebrow: "What We Stand For",
  aboutValuesTitle: "Our Values",
  aboutValues: [
    { id: "value-1", title: "Quality First", desc: "Every product is vetted by experts for durability and performance." },
    { id: "value-2", title: "Fair Pricing", desc: "Direct brand relationships mean lower prices for you." },
    { id: "value-3", title: "Fast Service", desc: "Same-day dispatch before 3 PM. Most orders arrive in 2-3 days." },
    { id: "value-4", title: "Lifetime Support", desc: "Industry-leading warranties on everything we sell." },
    { id: "value-5", title: "Sustainability", desc: "Eco-conscious shipping and recycled tools programs." },
    { id: "value-6", title: "Expert Advice", desc: "Real humans who know the trade, available when you need them." },
  ],
  aboutTeamEyebrow: "The People",
  aboutTeamTitle: "Meet Our Team",
  heroSlides: [
    {
      id: "hero-1",
      subtitle: "ALL THE PARTS YOU NEED",
      title: "INGCO ID6808",
      title2: "IMPACT DRILL",
      price: "$65.99",
      buttonText: "SHOP NOW",
      link: "/product/ingco-id6808-impact-drill",
      image: "https://images.pexels.com/photos/8811529/pexels-photo-8811529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      brand: "Ronix",
    },
    {
      id: "hero-2",
      subtitle: "PROFESSIONAL GRADE",
      title: "BOSCH GKS 235",
      title2: "TURBO CIRCULAR",
      price: "$185.00",
      buttonText: "SHOP NOW",
      link: "/product/bosch-gks-235-turbo-circular-saw",
      image: "https://images.pexels.com/photos/5846253/pexels-photo-5846253.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      brand: "Bosch",
    },
    {
      id: "hero-3",
      subtitle: "UP TO 30% OFF",
      title: "DEWALT DW715",
      title2: "MITER SAW",
      price: "$259.00",
      buttonText: "SHOP NOW",
      link: "/product/dewalt-dw715-miter-saw",
      image: "https://images.pexels.com/photos/5414384/pexels-photo-5414384.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      brand: "DeWalt",
    },
  ],
};

const initialState: State = {
  cart: [],
  user: null,
  wishlist: [],
  orders: [],
  products: seedProducts,
  categories: seedCategories,
  paymentMethods: seedPaymentMethods,
  siteContent: seedSiteContent,
  toast: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.cart.find((i) => i.productId === action.item.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.productId === action.item.productId ? { ...i, qty: i.qty + action.item.qty } : i,
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((i) => i.productId !== action.productId) };
    case "UPDATE_QTY":
      if (action.qty <= 0) {
        return { ...state, cart: state.cart.filter((i) => i.productId !== action.productId) };
      }
      return {
        ...state,
        cart: state.cart.map((i) => (i.productId === action.productId ? { ...i, qty: action.qty } : i)),
      };
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "LOGIN":
      return { ...state, user: action.user };
    case "LOGOUT":
      return { ...state, user: null };
    case "TOGGLE_WISHLIST": {
      const has = state.wishlist.includes(action.productId);
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    }
    case "PLACE_ORDER":
      return { ...state, orders: [action.order, ...state.orders], cart: [] };
    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.orderId ? { ...o, status: action.status } : o)),
      };
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.product.id ? action.product : p)),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
        cart: state.cart.filter((i) => i.productId !== action.productId),
        wishlist: state.wishlist.filter((id) => id !== action.productId),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.category] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.category.id ? action.category : c)),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.categoryId),
      };
    case "ADD_PAYMENT_METHOD":
      return { ...state, paymentMethods: [action.method, ...state.paymentMethods] };
    case "UPDATE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethods: state.paymentMethods.map((m) => (m.id === action.method.id ? action.method : m)),
      };
    case "DELETE_PAYMENT_METHOD":
      return { ...state, paymentMethods: state.paymentMethods.filter((m) => m.id !== action.methodId) };
    case "TOGGLE_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethods: state.paymentMethods.map((m) =>
          m.id === action.methodId ? { ...m, enabled: !m.enabled } : m,
        ),
      };
    case "UPDATE_SITE_CONTENT":
      return { ...state, siteContent: action.siteContent };
    case "TOAST":
      return { ...state, toast: action.message };
    default:
      return state;
  }
}

type StoreContextValue = {
  state: State;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlist: (productId: number) => void;
  placeOrder: (order: Omit<Order, "id" | "date" | "status">) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  addProduct: (product: Omit<Product, "id" | "slug" | "reviews"> & { reviews?: number; slug?: string }) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  addCategory: (name: string) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => PaymentMethod;
  updatePaymentMethod: (method: PaymentMethod) => void;
  deletePaymentMethod: (methodId: string) => void;
  togglePaymentMethod: (methodId: string) => void;
  updateSiteContent: (siteContent: SiteContent) => void;
  toast: (msg: string) => void;
  cartCount: number;
  cartSubtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem("toolforge-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...init,
          ...parsed,
          products: parsed.products?.length ? parsed.products : seedProducts,
          categories: parsed.categories?.length ? parsed.categories : seedCategories,
          paymentMethods: parsed.paymentMethods?.length ? parsed.paymentMethods : seedPaymentMethods,
          siteContent: parsed.siteContent ? { ...seedSiteContent, ...parsed.siteContent } : seedSiteContent,
        };
      }
    } catch {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem("toolforge-state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: "TOAST", message: null }), 2500);
    return () => clearTimeout(t);
  }, [state.toast]);

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
    const cartSubtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

    return {
      state,
      cartCount,
      cartSubtotal,
      addToCart: (item, qty = 1) => {
        dispatch({ type: "ADD_TO_CART", item: { ...item, qty } });
        dispatch({ type: "TOAST", message: `Added "${item.name}" to cart` });
      },
      removeFromCart: (productId) => dispatch({ type: "REMOVE_FROM_CART", productId }),
      updateQty: (productId, qty) => dispatch({ type: "UPDATE_QTY", productId, qty }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      login: (user) => dispatch({ type: "LOGIN", user }),
      logout: () => dispatch({ type: "LOGOUT" }),
      toggleWishlist: (productId) => dispatch({ type: "TOGGLE_WISHLIST", productId }),
      placeOrder: (o) =>
        dispatch({
          type: "PLACE_ORDER",
          order: {
            ...o,
            id: "TF-" + Math.floor(100000 + Math.random() * 900000),
            date: new Date().toISOString(),
            status: "Pending",
          },
        }),
      updateOrderStatus: (orderId, status) => {
        dispatch({ type: "UPDATE_ORDER_STATUS", orderId, status });
        dispatch({ type: "TOAST", message: `Order ${orderId} marked ${status}` });
      },
      addProduct: (productInput) => {
        const nextId = Math.max(0, ...state.products.map((p) => p.id)) + 1;
        const slugBase = productInput.slug || productInput.name;
        const slug = slugBase
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const product: Product = {
          ...productInput,
          id: nextId,
          slug: `${slug}-${nextId}`,
          reviews: productInput.reviews ?? 0,
        };
        dispatch({ type: "ADD_PRODUCT", product });
        dispatch({ type: "TOAST", message: `Product "${product.name}" added` });
        return product;
      },
      updateProduct: (product) => {
        dispatch({ type: "UPDATE_PRODUCT", product });
        dispatch({ type: "TOAST", message: `Product "${product.name}" updated` });
      },
      deleteProduct: (productId) => {
        dispatch({ type: "DELETE_PRODUCT", productId });
        dispatch({ type: "TOAST", message: "Product deleted" });
      },
      addCategory: (name) => {
        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const baseId = slug || `category-${Date.now()}`;
        const id = state.categories.some((c) => c.id === baseId) ? `${baseId}-${Date.now().toString().slice(-4)}` : baseId;
        const category: Category = { id, name: name.trim(), count: 0 };
        dispatch({ type: "ADD_CATEGORY", category });
        dispatch({ type: "TOAST", message: `Category "${category.name}" added` });
        return category;
      },
      updateCategory: (category) => {
        dispatch({ type: "UPDATE_CATEGORY", category });
        dispatch({ type: "TOAST", message: `Category "${category.name}" updated` });
      },
      deleteCategory: (categoryId) => {
        dispatch({ type: "DELETE_CATEGORY", categoryId });
        dispatch({ type: "TOAST", message: "Category deleted" });
      },
      addPaymentMethod: (methodInput) => {
        const method: PaymentMethod = { ...methodInput, id: `${methodInput.type}-${Date.now()}` };
        dispatch({ type: "ADD_PAYMENT_METHOD", method });
        dispatch({ type: "TOAST", message: `${method.name} payment method added` });
        return method;
      },
      updatePaymentMethod: (method) => {
        dispatch({ type: "UPDATE_PAYMENT_METHOD", method });
        dispatch({ type: "TOAST", message: `${method.name} payment method updated` });
      },
      deletePaymentMethod: (methodId) => {
        dispatch({ type: "DELETE_PAYMENT_METHOD", methodId });
        dispatch({ type: "TOAST", message: "Payment method deleted" });
      },
      togglePaymentMethod: (methodId) => {
        dispatch({ type: "TOGGLE_PAYMENT_METHOD", methodId });
        dispatch({ type: "TOAST", message: "Payment method status changed" });
      },
      updateSiteContent: (siteContent) => {
        dispatch({ type: "UPDATE_SITE_CONTENT", siteContent });
        dispatch({ type: "TOAST", message: "Website content updated" });
      },
      toast: (message) => dispatch({ type: "TOAST", message }),
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
