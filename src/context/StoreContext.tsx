import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { Category, Product } from "../data/products";
import * as authApi from "../api/auth";
import * as productsApi from "../api/products";
import * as categoriesApi from "../api/categories";
import * as ordersApi from "../api/orders";
import * as wishlistApi from "../api/wishlist";
import * as paymentMethodsApi from "../api/paymentMethods";
import * as siteContentApi from "../api/siteContent";

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
  loading: boolean;
};

type Action =
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "REMOVE_FROM_CART"; productId: number }
  | { type: "UPDATE_QTY"; productId: number; qty: number }
  | { type: "CLEAR_CART" }
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_WISHLIST"; productId: number }
  | { type: "BOOTSTRAP"; payload: Partial<State> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "PLACE_ORDER_RESULT"; order: Order }
  | { type: "UPDATE_ORDER_RESULT"; order: Order }
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
  products: [],
  categories: [],
  paymentMethods: [],
  siteContent: seedSiteContent,
  toast: null,
  loading: true,
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
    case "BOOTSTRAP":
      return { ...state, ...action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "PLACE_ORDER_RESULT":
      return { ...state, orders: [action.order, ...state.orders], cart: [] };
    case "UPDATE_ORDER_RESULT":
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.order.id ? action.order : o)),
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
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  placeOrder: (payload: Parameters<typeof ordersApi.placeOrder>[0]) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "slug" | "reviews"> & { reviews?: number; slug?: string }) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, "id">) => Promise<PaymentMethod>;
  updatePaymentMethod: (method: PaymentMethod) => Promise<void>;
  deletePaymentMethod: (methodId: string) => Promise<void>;
  togglePaymentMethod: (methodId: string) => Promise<void>;
  updateSiteContent: (siteContent: SiteContent) => Promise<void>;
  toast: (msg: string) => void;
  cartCount: number;
  cartSubtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const savedCart = localStorage.getItem("toolrack-cart");
      return savedCart ? { ...init, cart: JSON.parse(savedCart) as CartItem[] } : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem("toolrack-cart", JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [products, categories, paymentMethods, siteContent, user] = await Promise.all([
          productsApi.listProducts({ per_page: 200 }).then((r) => r.data).catch(() => []),
          categoriesApi.listCategories().catch(() => []),
          paymentMethodsApi.listPaymentMethods().catch(() => []),
          siteContentApi.getSiteContent().catch(() => seedSiteContent),
          authApi.me(),
        ]);
        if (cancelled) return;
        dispatch({
          type: "BOOTSTRAP",
          payload: {
            products,
            categories,
            paymentMethods,
            siteContent: { ...seedSiteContent, ...siteContent },
            user: user ?? null,
          },
        });
        if (user) {
          const [orders, wishlist] = await Promise.all([
            ordersApi.listOrders().catch(() => []),
            wishlistApi.listWishlist().catch(() => []),
          ]);
          if (!cancelled) dispatch({ type: "BOOTSTRAP", payload: { orders, wishlist } });
        }
      } finally {
        if (!cancelled) dispatch({ type: "SET_LOADING", loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
      login: async (email, password) => {
        const user = await authApi.login(email, password);
        dispatch({ type: "LOGIN", user });
        const [orders, wishlist] = await Promise.all([
          ordersApi.listOrders().catch(() => []),
          wishlistApi.listWishlist().catch(() => []),
        ]);
        dispatch({ type: "BOOTSTRAP", payload: { orders, wishlist } });
        return user;
      },
      register: async (name, email, password) => {
        const user = await authApi.register(name, email, password);
        dispatch({ type: "LOGIN", user });
        return user;
      },
      logout: async () => {
        await authApi.logout();
        dispatch({ type: "LOGOUT" });
        dispatch({ type: "BOOTSTRAP", payload: { orders: [], wishlist: [] } });
      },
      toggleWishlist: async (productId) => {
        if (!state.user) { dispatch({ type: "TOAST", message: "Sign in to save items to your wishlist" }); return; }
        const has = state.wishlist.includes(productId);
        dispatch({ type: "TOGGLE_WISHLIST", productId }); // optimistic
        try {
          if (has) await wishlistApi.removeWishlist(productId);
          else await wishlistApi.addWishlist(productId);
        } catch {
          dispatch({ type: "TOGGLE_WISHLIST", productId }); // revert
        }
      },
      placeOrder: async (payload) => {
        const order = await ordersApi.placeOrder(payload);
        dispatch({ type: "PLACE_ORDER_RESULT", order });
        return order;
      },
      updateOrderStatus: async (orderId, status) => {
        const order = await ordersApi.updateOrderStatus(orderId, status);
        dispatch({ type: "UPDATE_ORDER_RESULT", order });
        dispatch({ type: "TOAST", message: `Order ${orderId} marked ${status}` });
      },
      addProduct: async (productInput) => {
        const product = await productsApi.createProduct(productInput);
        dispatch({ type: "ADD_PRODUCT", product });
        dispatch({ type: "TOAST", message: `Product "${product.name}" added` });
        return product;
      },
      updateProduct: async (product) => {
        const updated = await productsApi.updateProduct(product.id, product);
        dispatch({ type: "UPDATE_PRODUCT", product: updated });
        dispatch({ type: "TOAST", message: `Product "${updated.name}" updated` });
      },
      deleteProduct: async (productId) => {
        await productsApi.deleteProduct(productId);
        dispatch({ type: "DELETE_PRODUCT", productId });
        dispatch({ type: "TOAST", message: "Product deleted" });
      },
      addCategory: async (name) => {
        const category = await categoriesApi.createCategory(name);
        dispatch({ type: "ADD_CATEGORY", category });
        dispatch({ type: "TOAST", message: `Category "${category.name}" added` });
        return category;
      },
      updateCategory: async (category) => {
        const updated = await categoriesApi.updateCategory(category.id, category.name);
        dispatch({ type: "UPDATE_CATEGORY", category: updated });
        dispatch({ type: "TOAST", message: `Category "${updated.name}" updated` });
      },
      deleteCategory: async (categoryId) => {
        await categoriesApi.deleteCategory(categoryId);
        dispatch({ type: "DELETE_CATEGORY", categoryId });
        dispatch({ type: "TOAST", message: "Category deleted" });
      },
      addPaymentMethod: async (methodInput) => {
        const method = await paymentMethodsApi.createPaymentMethod(methodInput);
        dispatch({ type: "ADD_PAYMENT_METHOD", method });
        dispatch({ type: "TOAST", message: `${method.name} payment method added` });
        return method;
      },
      updatePaymentMethod: async (method) => {
        const updated = await paymentMethodsApi.updatePaymentMethod(method);
        dispatch({ type: "UPDATE_PAYMENT_METHOD", method: updated });
        dispatch({ type: "TOAST", message: `${updated.name} payment method updated` });
      },
      deletePaymentMethod: async (methodId) => {
        await paymentMethodsApi.deletePaymentMethod(methodId);
        dispatch({ type: "DELETE_PAYMENT_METHOD", methodId });
        dispatch({ type: "TOAST", message: "Payment method deleted" });
      },
      togglePaymentMethod: async (methodId) => {
        const method = state.paymentMethods.find((x) => x.id === methodId);
        if (!method) return;
        const updated = await paymentMethodsApi.updatePaymentMethod({ ...method, enabled: !method.enabled });
        dispatch({ type: "UPDATE_PAYMENT_METHOD", method: updated });
        dispatch({ type: "TOAST", message: "Payment method status changed" });
      },
      updateSiteContent: async (siteContent) => {
        const saved = await siteContentApi.updateSiteContent(siteContent);
        dispatch({ type: "UPDATE_SITE_CONTENT", siteContent: { ...seedSiteContent, ...saved } });
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
