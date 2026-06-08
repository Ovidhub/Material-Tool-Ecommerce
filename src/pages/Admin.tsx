import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import type { HeroSlide, Order, PaymentMethod, PaymentMethodType, SiteContent } from "../context/StoreContext";
import { listAllOrders } from "../api/orders";
import { brands } from "../data/products";
import type { Product } from "../data/products";
import { DollarIcon, PackageIcon, UsersIcon, WrenchIcon, categoryIconMap } from "../components/Icons";

type ProductForm = {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: string;
  oldPrice: string;
  stock: string;
  sku: string;
  badge: "" | "New" | "Sale" | "Hot" | "Top";
  rating: string;
  image: string;
  shortDesc: string;
  description: string;
  features: string;
  specs: string;
};

type PaymentForm = {
  type: PaymentMethodType;
  name: string;
  enabled: boolean;
  mode: "test" | "live";
  publicKey: string;
  secretKey: string;
  clientId: string;
  clientSecret: string;
  walletAddress: string;
  network: string;
  instructions: string;
};

const blankPaymentForm: PaymentForm = {
  type: "stripe",
  name: "Credit / Debit Card",
  enabled: true,
  mode: "test",
  publicKey: "",
  secretKey: "",
  clientId: "",
  clientSecret: "",
  walletAddress: "",
  network: "",
  instructions: "",
};

const blankForm: ProductForm = {
  name: "",
  brand: brands[0],
  category: "drills",
  subcategory: "",
  price: "",
  oldPrice: "",
  stock: "10",
  sku: "",
  badge: "",
  rating: "5",
  image: "https://images.pexels.com/photos/4312855/pexels-photo-4312855.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  shortDesc: "",
  description: "",
  features: "Professional grade\nWarranty included\nFast shipping",
  specs: "Power: Professional\nWarranty: 1 Year\nCondition: New",
};

function formFromProduct(product: Product): ProductForm {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    stock: String(product.stock),
    sku: product.sku,
    badge: product.badge || "",
    rating: String(product.rating),
    image: product.image,
    shortDesc: product.shortDesc,
    description: product.description,
    features: product.features.join("\n"),
    specs: Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}

function productPayload(form: ProductForm) {
  const specs = Object.fromEntries(
    form.specs
      .split("\n")
      .map((line) => line.split(":"))
      .filter(([key, value]) => key?.trim() && value?.trim())
      .map(([key, ...value]) => [key.trim(), value.join(":").trim()]),
  );

  return {
    name: form.name.trim(),
    brand: form.brand,
    category: form.category,
    subcategory: form.subcategory.trim() || "Tools",
    price: Number(form.price) || 0,
    oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
    rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
    stock: Number(form.stock) || 0,
    sku: form.sku.trim() || `TR-${Date.now().toString().slice(-6)}`,
    badge: form.badge || undefined,
    shortDesc: form.shortDesc.trim(),
    description: form.description.trim() || form.shortDesc.trim(),
    features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
    specs: Object.keys(specs).length ? specs : { Condition: "New" },
    image: form.image.trim(),
  };
}

function paymentFormFromMethod(method: PaymentMethod): PaymentForm {
  return {
    type: method.type,
    name: method.name,
    enabled: method.enabled,
    mode: method.mode,
    publicKey: method.publicKey || "",
    secretKey: method.secretKey || "",
    clientId: method.clientId || "",
    clientSecret: method.clientSecret || "",
    walletAddress: method.walletAddress || "",
    network: method.network || "",
    instructions: method.instructions || "",
  };
}

function maskSecret(value?: string) {
  if (!value) return "Not configured";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export default function Admin() {
  const {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethod,
    updateSiteContent,
    toast,
  } = useStore();
  const errMsg = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");
  if (!state.user || !["admin", "super_admin"].includes(state.user.role)) return <Navigate to="/login" replace />;

  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const loadAdminOrders = () => { listAllOrders().then(setAdminOrders).catch(() => {}); };
  useEffect(() => { loadAdminOrders(); }, []);

  const [tab, setTab] = useState<"dashboard" | "products" | "categories" | "orders" | "payments" | "content" | "customers">("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(blankPaymentForm);
  const [contentForm, setContentForm] = useState<SiteContent>(state.siteContent);
  const products = state.products;
  const categories = state.categories;

  const allOrders = adminOrders;

  const stats = useMemo(
    () => ({
      revenue: adminOrders.reduce((s, o) => s + o.total, 0) + 24580,
      orders: adminOrders.length + 142,
      customers: 3847,
      products: products.length,
    }),
    [adminOrders, products.length],
  );

  function openAddForm() {
    setEditing(null);
    setForm({ ...blankForm, category: categories[0]?.id || "tools" });
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    setForm(formFromProduct(product));
    setFormOpen(true);
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    const payload = productPayload(form);
    try {
      if (editing) {
        await updateProduct({ ...editing, ...payload });
      } else {
        await addProduct(payload);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(blankForm);
    } catch (err) {
      toast(errMsg(err));
    }
  }

  async function duplicateProduct(product: Product) {
    try {
      await addProduct({ ...product, name: `${product.name} Copy`, sku: `${product.sku}-CP`, slug: undefined, reviews: 0 });
    } catch (err) {
      toast(errMsg(err));
    }
  }

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch = !q || [p.name, p.sku, p.brand, p.subcategory].some((value) => value.toLowerCase().includes(q));
    const matchesCategory = !productCategory || p.category === productCategory;
    const matchesBrand = !productBrand || p.brand === productBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });
  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = filteredProducts.slice((currentProductPage - 1) * pageSize, currentProductPage * pageSize);

  function resetProductFilters() {
    setProductSearch("");
    setProductCategory("");
    setProductBrand("");
    setProductPage(1);
  }

  async function submitCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    try {
      if (editingCategoryId) {
        const existing = categories.find((c) => c.id === editingCategoryId);
        if (existing) await updateCategory({ ...existing, name });
      } else {
        await addCategory(name);
      }
      setCategoryName("");
      setEditingCategoryId(null);
    } catch (err) {
      toast(errMsg(err));
    }
  }

  function startEditCategory(id: string, name: string) {
    setEditingCategoryId(id);
    setCategoryName(name);
  }

  function openAddPaymentForm(type: PaymentMethodType = "stripe") {
    const defaults: Record<PaymentMethodType, Partial<PaymentForm>> = {
      stripe: { type, name: "Credit / Debit Card", instructions: "Cards are processed securely through Stripe." },
      paypal: { type, name: "PayPal", instructions: "You will be redirected to PayPal to complete payment." },
      crypto: { type, name: "Crypto Payment", network: "USDT TRC20", instructions: "Send payment to the wallet address shown and include your order number." },
      bank: { type, name: "Bank Transfer", instructions: "Transfer to our bank account. Your order will be processed after payment confirmation." },
      custom: { type, name: "Custom Payment", instructions: "Store team will contact you with payment instructions." },
    };
    setEditingPayment(null);
    setPaymentForm({ ...blankPaymentForm, ...defaults[type] });
    setPaymentFormOpen(true);
  }

  function openEditPaymentForm(method: PaymentMethod) {
    setEditingPayment(method);
    setPaymentForm(paymentFormFromMethod(method));
    setPaymentFormOpen(true);
  }

  async function submitPaymentMethod(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      type: paymentForm.type,
      name: paymentForm.name.trim(),
      enabled: paymentForm.enabled,
      mode: paymentForm.mode,
      publicKey: paymentForm.publicKey.trim() || undefined,
      secretKey: paymentForm.secretKey.trim() || undefined,
      clientId: paymentForm.clientId.trim() || undefined,
      clientSecret: paymentForm.clientSecret.trim() || undefined,
      walletAddress: paymentForm.walletAddress.trim() || undefined,
      network: paymentForm.network.trim() || undefined,
      instructions: paymentForm.instructions.trim() || undefined,
    };
    try {
      if (editingPayment) await updatePaymentMethod({ ...editingPayment, ...payload });
      else await addPaymentMethod(payload);
      setPaymentFormOpen(false);
      setEditingPayment(null);
      setPaymentForm(blankPaymentForm);
    } catch (err) {
      toast(errMsg(err));
    }
  }

  function updateHeroSlide(index: number, patch: Partial<HeroSlide>) {
    setContentForm((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }));
  }

  function readImageFile(file: File, onLoad: (dataUrl: string) => void) {
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onLoad(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function uploadProductImage(file: File | null) {
    if (!file) return;
    readImageFile(file, (image) => setForm((current) => ({ ...current, image })));
  }

  function uploadLogoImage(file: File | null) {
    if (!file) return;
    readImageFile(file, (logoUrl) => setContentForm((current) => ({ ...current, logoUrl })));
  }

  function uploadHeroImage(index: number, file: File | null) {
    if (!file) return;
    readImageFile(file, (image) => updateHeroSlide(index, { image }));
  }

  function uploadPromoImage(index: number, file: File | null) {
    if (!file) return;
    readImageFile(file, (image) => setContentForm((current) => ({
      ...current,
      homePromoBanners: current.homePromoBanners.map((banner, i) => (i === index ? { ...banner, image } : banner)),
    })));
  }

  function uploadDealImage(file: File | null) {
    if (!file) return;
    readImageFile(file, (dealImage) => setContentForm((current) => ({ ...current, dealImage })));
  }

  function uploadAboutImage(file: File | null) {
    if (!file) return;
    readImageFile(file, (aboutImage) => setContentForm((current) => ({ ...current, aboutImage })));
  }

  function updatePromoBanner(index: number, patch: Partial<typeof contentForm.homePromoBanners[number]>) {
    setContentForm((current) => ({
      ...current,
      homePromoBanners: current.homePromoBanners.map((banner, i) => (i === index ? { ...banner, ...patch } : banner)),
    }));
  }

  function updateTrustItem(index: number, patch: Partial<typeof contentForm.trustItems[number]>) {
    setContentForm((current) => ({
      ...current,
      trustItems: current.trustItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateAboutValue(index: number, patch: Partial<typeof contentForm.aboutValues[number]>) {
    setContentForm((current) => ({
      ...current,
      aboutValues: current.aboutValues.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addHeroSlide() {
    setContentForm((current) => ({
      ...current,
      heroSlides: [
        ...current.heroSlides,
        {
          id: `hero-${Date.now()}`,
          subtitle: "NEW COLLECTION",
          title: "FEATURED TOOL",
          title2: "SPECIAL OFFER",
          price: "$99.00",
          buttonText: "SHOP NOW",
          link: "/shop",
          image: "https://images.pexels.com/photos/4312855/pexels-photo-4312855.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
          brand: "Hechimaterial",
        },
      ],
    }));
  }

  function deleteHeroSlide(index: number) {
    setContentForm((current) => ({
      ...current,
      heroSlides: current.heroSlides.filter((_, i) => i !== index),
    }));
  }

  async function saveContent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSiteContent(contentForm);
    } catch (err) {
      toast(errMsg(err));
    }
  }

  const kpis = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(0)}`, change: "+12.4%", Icon: DollarIcon, bg: "bg-red-600" },
    { label: "Orders", value: stats.orders.toString(), change: "+8.2%", Icon: PackageIcon, bg: "bg-green-600" },
    { label: "Customers", value: stats.customers.toLocaleString(), change: "+5.1%", Icon: UsersIcon, bg: "bg-blue-600" },
    { label: "Products", value: stats.products.toString(), change: "+3", Icon: WrenchIcon, bg: "bg-yellow-500" },
  ];
  const statusCls = (s: string) => s === "Delivered" ? "bg-green-100 text-green-700" : s === "Shipped" ? "bg-blue-100 text-blue-700" : s === "Processing" ? "bg-yellow-100 text-yellow-700" : "bg-neutral-100 text-neutral-600";
  const inputCls = "w-full px-3 py-2 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500";

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Admin Dashboard</div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900">Welcome, {state.user.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/account" className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 font-semibold text-sm rounded-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M12 11a4 4 0 100-8 4 4 0 000 8zM6 21v-1a6 6 0 0112 0v1" /></svg>
              Account &amp; Password
            </Link>
            <Link to="/" className="px-5 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 font-semibold text-sm rounded-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M15 19l-7-7 7-7" /></svg>
              View Store
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6 bg-white p-1 border border-neutral-200 rounded-sm w-fit">
          {(["dashboard", "products", "categories", "orders", "payments", ...(state.user.role === "super_admin" ? ["content" as const] : []), "customers"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider capitalize transition rounded-sm ${tab === t ? "bg-red-600 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>{t}</button>
          ))}
        </div>

        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((s) => (
                <div key={s.label} className="bg-white border border-neutral-200 rounded-sm p-5">
                  <div className={`w-10 h-10 ${s.bg} rounded grid place-items-center mb-3`}><s.Icon className="w-5 h-5 text-white" /></div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{s.label}</div>
                  <div className="text-2xl font-black text-neutral-900 mt-1">{s.value}</div>
                  <div className="text-xs text-green-600 font-bold mt-1">{s.change} ↑</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-sm p-5">
                <h3 className="font-bold text-neutral-900 mb-4">Revenue (Last 7 Days)</h3>
                <div className="flex items-end gap-3 h-48">
                  {[65, 42, 78, 55, 88, 72, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t" style={{ height: `${h}%` }} />
                      <div className="text-[11px] text-neutral-500 font-medium">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-sm p-5">
                <h3 className="font-bold text-neutral-900 mb-4">Top Categories</h3>
                <div className="space-y-4">
                  {categories.slice(0, 5).map((c, i) => {
                    const pct = [82, 67, 54, 41, 33][i];
                    const I = categoryIconMap[c.id];
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium text-neutral-700 flex items-center gap-1.5">{I && <I className="w-3.5 h-3.5" />}{c.name}</span><span className="text-neutral-500">{pct}%</span></div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "products" && (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-neutral-900">Product Catalog ({products.length})</h3>
                <p className="text-xs text-neutral-500">Add, edit, duplicate, and delete products. Changes persist in this browser.</p>
              </div>
              <button onClick={openAddForm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-sm uppercase tracking-wider">+ Add Product</button>
            </div>

            {formOpen && (
              <form onSubmit={submitProduct} className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h3 className="font-black text-neutral-900 uppercase text-sm">{editing ? "Edit Product" : "Add New Product"}</h3>
                  <button type="button" onClick={() => setFormOpen(false)} className="text-neutral-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <label className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">Product Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} placeholder="Auto if blank" /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Brand<select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`}>{brands.map((b) => <option key={b}>{b}</option>)}</select></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Subcategory<input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Price<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Old Price<input type="number" min="0" step="0.01" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Badge<select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value as ProductForm["badge"] })} className={`${inputCls} mt-1 font-normal normal-case`}><option value="">None</option><option>New</option><option>Sale</option><option>Hot</option><option>Top</option></select></label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Rating<input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <div className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">
                    Product Image
                    <div className="mt-1 flex flex-col sm:flex-row gap-2">
                      <input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={`${inputCls} font-normal normal-case flex-1`} placeholder="Image URL or uploaded file data" />
                      <label className="px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center whitespace-nowrap">
                        Upload Image
                        <input type="file" accept="image/*" onChange={(e) => uploadProductImage(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>
                    {form.image && <img src={form.image} alt="Product preview" className="mt-2 h-20 w-20 rounded-sm object-cover border border-neutral-200" />}
                  </div>
                </div>
                <label className="block text-xs font-bold uppercase text-neutral-600">Short Description<input required value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="block text-xs font-bold uppercase text-neutral-600">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="block text-xs font-bold uppercase text-neutral-600">Features (one per line)<textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  <label className="block text-xs font-bold uppercase text-neutral-600">Specs (Key: Value per line)<textarea value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} rows={4} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase rounded-sm">Cancel</button>
                  <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-sm">{editing ? "Save Changes" : "Create Product"}</button>
                </div>
              </form>
            )}

            <div className="bg-white border border-neutral-200 rounded-sm p-4 grid md:grid-cols-[1fr_180px_180px_110px_auto] gap-3 items-end">
              <label className="text-xs font-bold uppercase text-neutral-600">Search Catalog
                <input value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }} placeholder="Name, SKU, brand..." className={`${inputCls} mt-1 font-normal normal-case`} />
              </label>
              <label className="text-xs font-bold uppercase text-neutral-600">Category
                <select value={productCategory} onChange={(e) => { setProductCategory(e.target.value); setProductPage(1); }} className={`${inputCls} mt-1 font-normal normal-case`}>
                  <option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-neutral-600">Brand
                <select value={productBrand} onChange={(e) => { setProductBrand(e.target.value); setProductPage(1); }} className={`${inputCls} mt-1 font-normal normal-case`}>
                  <option value="">All brands</option>{brands.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-neutral-600">Per Page
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setProductPage(1); }} className={`${inputCls} mt-1 font-normal normal-case`}>
                  <option value={5}>5</option><option value={8}>8</option><option value={12}>12</option><option value={20}>20</option>
                </select>
              </label>
              <button onClick={resetProductFilters} className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase rounded-sm hover:bg-neutral-50">Reset</button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-200 text-xs text-neutral-500">
                Showing {paginatedProducts.length} of {filteredProducts.length} matching products
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
                    <tr><th className="text-left px-5 py-2.5 font-bold">Product</th><th className="text-left px-5 py-2.5 font-bold">SKU</th><th className="text-left px-5 py-2.5 font-bold">Category</th><th className="text-left px-5 py-2.5 font-bold">Price</th><th className="text-left px-5 py-2.5 font-bold">Stock</th><th className="text-right px-5 py-2.5 font-bold">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {paginatedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" /><div><div className="font-semibold text-neutral-900 text-xs line-clamp-1">{p.name}</div><div className="text-[11px] text-neutral-500">{p.brand}</div></div></div></td>
                        <td className="px-5 py-3 text-xs text-neutral-600 font-mono">{p.sku}</td>
                        <td className="px-5 py-3 text-xs text-neutral-600 capitalize">{p.subcategory}</td>
                        <td className="px-5 py-3 font-bold text-red-600">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-3"><span className={`text-xs font-bold ${p.stock < 15 ? "text-red-600" : "text-green-600"}`}>{p.stock}</span></td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditForm(p)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => duplicateProduct(p)} className="text-xs font-bold text-neutral-600 hover:underline">Duplicate</button>
                            <button onClick={async () => { if (confirm(`Delete ${p.name}?`)) { try { await deleteProduct(p.id); } catch (err) { toast(errMsg(err)); } } }} className="text-xs font-bold text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">Page {currentProductPage} of {totalProductPages}</div>
                <div className="flex items-center gap-1">
                  <button disabled={currentProductPage === 1} onClick={() => setProductPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 border border-neutral-300 text-xs font-bold rounded-sm disabled:opacity-40">Prev</button>
                  {Array.from({ length: totalProductPages }).map((_, i) => (
                    <button key={i} onClick={() => setProductPage(i + 1)} className={`px-3 py-1.5 border text-xs font-bold rounded-sm ${currentProductPage === i + 1 ? "bg-red-600 border-red-600 text-white" : "border-neutral-300"}`}>{i + 1}</button>
                  ))}
                  <button disabled={currentProductPage === totalProductPages} onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))} className="px-3 py-1.5 border border-neutral-300 text-xs font-bold rounded-sm disabled:opacity-40">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="space-y-4">
            <form onSubmit={submitCategory} className="bg-white border border-neutral-200 rounded-sm p-4 flex flex-col md:flex-row gap-3 md:items-end">
              <label className="flex-1 text-xs font-bold uppercase text-neutral-600">{editingCategoryId ? "Edit Category" : "Add Category"}
                <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Example: Welding Tools" className={`${inputCls} mt-1 font-normal normal-case`} />
              </label>
              <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-sm">{editingCategoryId ? "Save Category" : "Add Category"}</button>
              {editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryName(""); }} className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase rounded-sm">Cancel</button>}
            </form>

            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-900">Categories ({categories.length})</h3>
                <p className="text-xs text-neutral-500">New categories become available in the store filters and product form.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500"><tr><th className="text-left px-5 py-2.5 font-bold">Name</th><th className="text-left px-5 py-2.5 font-bold">Slug</th><th className="text-left px-5 py-2.5 font-bold">Products</th><th className="text-right px-5 py-2.5 font-bold">Actions</th></tr></thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {categories.map((c) => {
                      const I = categoryIconMap[c.id] || WrenchIcon;
                      const count = products.filter((p) => p.category === c.id).length;
                      return (
                        <tr key={c.id} className="hover:bg-neutral-50">
                          <td className="px-5 py-3 font-semibold text-neutral-900 flex items-center gap-2"><I className="w-4 h-4 text-red-600" />{c.name}</td>
                          <td className="px-5 py-3 text-xs font-mono text-neutral-500">{c.id}</td>
                          <td className="px-5 py-3 text-neutral-700">{count}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => startEditCategory(c.id, c.name)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                              <button onClick={async () => { if (count > 0) { alert("Move or delete products in this category first."); return; } if (confirm(`Delete ${c.name}?`)) { try { await deleteCategory(c.id); } catch (err) { toast(errMsg(err)); } } }} className="text-xs font-bold text-red-600 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200"><h3 className="font-bold text-neutral-900">All Orders</h3><p className="text-xs text-neutral-500">Orders placed through checkout can be updated here.</p></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500"><tr><th className="text-left px-5 py-2.5 font-bold">Order</th><th className="text-left px-5 py-2.5 font-bold">Date</th><th className="text-left px-5 py-2.5 font-bold">Items</th><th className="text-left px-5 py-2.5 font-bold">Total</th><th className="text-left px-5 py-2.5 font-bold">Status</th></tr></thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {allOrders.map((o) => {
                    const isRealOrder = adminOrders.some((order) => order.id === o.id);
                    return (
                      <tr key={o.id} className="hover:bg-neutral-50">
                        <td className="px-5 py-3 font-semibold">{o.id}</td><td className="px-5 py-3 text-neutral-600">{new Date(o.date).toLocaleDateString()}</td><td className="px-5 py-3 text-neutral-600">{o.items.length || 3}</td><td className="px-5 py-3 font-bold">${o.total.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          {isRealOrder ? (
                            <select value={o.status} onChange={async (e) => { try { await updateOrderStatus(o.id, e.target.value as typeof o.status); loadAdminOrders(); } catch (err) { toast(errMsg(err)); } }} className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase border-0 ${statusCls(o.status)}`}>
                              <option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option>
                            </select>
                          ) : <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase ${statusCls(o.status)}`}>{o.status}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-neutral-900">Payment Methods</h3>
                <p className="text-xs text-neutral-500">Add Stripe, PayPal, crypto, bank transfer, or a custom gateway. Enabled methods appear at checkout.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["stripe", "paypal", "crypto", "bank", "custom"] as PaymentMethodType[]).map((type) => (
                  <button key={type} onClick={() => openAddPaymentForm(type)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-sm">
                    + {type}
                  </button>
                ))}
              </div>
            </div>

            {paymentFormOpen && (
              <form onSubmit={submitPaymentMethod} className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <h3 className="font-black text-neutral-900 uppercase text-sm">{editingPayment ? "Edit Payment Method" : "Add Payment Method"}</h3>
                  <button type="button" onClick={() => setPaymentFormOpen(false)} className="text-neutral-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid md:grid-cols-4 gap-3">
                  <label className="text-xs font-bold uppercase text-neutral-600">Type
                    <select value={paymentForm.type} onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as PaymentMethodType })} className={`${inputCls} mt-1 font-normal normal-case`}>
                      <option value="stripe">Stripe</option><option value="paypal">PayPal</option><option value="crypto">Crypto</option><option value="bank">Bank Transfer</option><option value="custom">Custom</option>
                    </select>
                  </label>
                  <label className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">Display Name
                    <input required value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} />
                  </label>
                  <label className="text-xs font-bold uppercase text-neutral-600">Mode
                    <select value={paymentForm.mode} onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value as "test" | "live" })} className={`${inputCls} mt-1 font-normal normal-case`}>
                      <option value="test">Test</option><option value="live">Live</option>
                    </select>
                  </label>
                </div>

                {(paymentForm.type === "stripe") && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-bold uppercase text-neutral-600">Stripe Publishable Key<input value={paymentForm.publicKey} onChange={(e) => setPaymentForm({ ...paymentForm, publicKey: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} placeholder="pk_test_..." /></label>
                    <label className="text-xs font-bold uppercase text-neutral-600">Stripe Secret Key<input type="password" value={paymentForm.secretKey} onChange={(e) => setPaymentForm({ ...paymentForm, secretKey: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} placeholder="sk_test_..." /></label>
                  </div>
                )}

                {paymentForm.type === "paypal" && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-bold uppercase text-neutral-600">PayPal Client ID<input value={paymentForm.clientId} onChange={(e) => setPaymentForm({ ...paymentForm, clientId: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                    <label className="text-xs font-bold uppercase text-neutral-600">PayPal Secret<input type="password" value={paymentForm.clientSecret} onChange={(e) => setPaymentForm({ ...paymentForm, clientSecret: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  </div>
                )}

                {paymentForm.type === "crypto" && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-bold uppercase text-neutral-600">Network / Coin<input value={paymentForm.network} onChange={(e) => setPaymentForm({ ...paymentForm, network: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} placeholder="BTC, ETH, USDT TRC20" /></label>
                    <label className="text-xs font-bold uppercase text-neutral-600">Wallet Address<input value={paymentForm.walletAddress} onChange={(e) => setPaymentForm({ ...paymentForm, walletAddress: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                  </div>
                )}

                <label className="block text-xs font-bold uppercase text-neutral-600">Checkout Instructions
                  <textarea value={paymentForm.instructions} onChange={(e) => setPaymentForm({ ...paymentForm, instructions: e.target.value })} rows={3} className={`${inputCls} mt-1 font-normal normal-case`} />
                </label>

                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={paymentForm.enabled} onChange={(e) => setPaymentForm({ ...paymentForm, enabled: e.target.checked })} className="accent-red-600" />
                  Enable this payment method at checkout
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setPaymentFormOpen(false)} className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase rounded-sm">Cancel</button>
                  <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-sm">{editingPayment ? "Save Method" : "Create Method"}</button>
                </div>
              </form>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.paymentMethods.map((method) => (
                <div key={method.id} className="bg-white border border-neutral-200 rounded-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{method.type} · {method.mode}</div>
                      <h4 className="font-black text-neutral-900">{method.name}</h4>
                    </div>
                    <button onClick={async () => { try { await togglePaymentMethod(method.id); } catch (err) { toast(errMsg(err)); } }} className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase ${method.enabled ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {method.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
                    {method.type === "stripe" && <><div>Publishable: {maskSecret(method.publicKey)}</div><div>Secret: {maskSecret(method.secretKey)}</div></>}
                    {method.type === "paypal" && <><div>Client ID: {maskSecret(method.clientId)}</div><div>Secret: {maskSecret(method.clientSecret)}</div></>}
                    {method.type === "crypto" && <><div>Network: {method.network || "Not set"}</div><div className="break-all">Wallet: {maskSecret(method.walletAddress)}</div></>}
                    {(method.type === "bank" || method.type === "custom") && <div className="line-clamp-3">{method.instructions || "No instructions yet."}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditPaymentForm(method)} className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                    <button onClick={async () => { if (confirm(`Delete ${method.name}?`)) { try { await deletePaymentMethod(method.id); } catch (err) { toast(errMsg(err)); } } }} className="text-xs font-bold text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "content" && state.user.role === "super_admin" && (
          <form onSubmit={saveContent} className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-neutral-900">Super Admin Content Manager</h3>
                <p className="text-xs text-neutral-500">Edit brand, contact details, promotional copy, footer, newsletter, and hero slides.</p>
              </div>
              <button className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-sm">Save Website Content</button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <h4 className="font-black text-sm uppercase text-neutral-900 border-b border-neutral-200 pb-3">Branding</h4>
              <div className="grid md:grid-cols-4 gap-3">
                <label className="text-xs font-bold uppercase text-neutral-600">Brand Name<input value={contentForm.brandName} onChange={(e) => setContentForm({ ...contentForm, brandName: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Brand Accent<input value={contentForm.brandAccent} onChange={(e) => setContentForm({ ...contentForm, brandAccent: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">Tagline<input value={contentForm.tagline} onChange={(e) => setContentForm({ ...contentForm, tagline: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <div className="md:col-span-4 text-xs font-bold uppercase text-neutral-600">
                  Logo Image
                  <div className="mt-1 flex flex-col sm:flex-row gap-2">
                    <input value={contentForm.logoUrl} onChange={(e) => setContentForm({ ...contentForm, logoUrl: e.target.value })} placeholder="Leave blank to use wrench icon" className={`${inputCls} font-normal normal-case flex-1`} />
                    <label className="px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center whitespace-nowrap">
                      Upload Logo
                      <input type="file" accept="image/*" onChange={(e) => uploadLogoImage(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>
                  {contentForm.logoUrl && <img src={contentForm.logoUrl} alt="Logo preview" className="mt-2 h-16 w-auto max-w-[220px] rounded-sm object-contain border border-neutral-200 bg-white p-1" />}
                </div>
                <label className="text-xs font-bold uppercase text-neutral-600">Primary Theme Color<input type="color" value={contentForm.primaryColor} onChange={(e) => setContentForm({ ...contentForm, primaryColor: e.target.value })} className="mt-1 h-10 w-full border border-neutral-300 rounded-sm" /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Dark / Header Color<input type="color" value={contentForm.secondaryColor} onChange={(e) => setContentForm({ ...contentForm, secondaryColor: e.target.value })} className="mt-1 h-10 w-full border border-neutral-300 rounded-sm" /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Accent Color<input type="color" value={contentForm.accentColor} onChange={(e) => setContentForm({ ...contentForm, accentColor: e.target.value })} className="mt-1 h-10 w-full border border-neutral-300 rounded-sm" /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Logo Box Color <span className="normal-case font-normal text-neutral-400">(only used for the default wrench icon)</span><input type="color" value={contentForm.logoBoxColor} onChange={(e) => setContentForm({ ...contentForm, logoBoxColor: e.target.value })} className="mt-1 h-10 w-full border border-neutral-300 rounded-sm" /></label>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <h4 className="font-black text-sm uppercase text-neutral-900 border-b border-neutral-200 pb-3">Contact & Header Promo</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <label className="text-xs font-bold uppercase text-neutral-600">Phone<input value={contentForm.phone} onChange={(e) => setContentForm({ ...contentForm, phone: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Email<input value={contentForm.email} onChange={(e) => setContentForm({ ...contentForm, email: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Hours<input value={contentForm.hours} onChange={(e) => setContentForm({ ...contentForm, hours: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Address<input value={contentForm.address} onChange={(e) => setContentForm({ ...contentForm, address: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">City / Region<input value={contentForm.cityLine} onChange={(e) => setContentForm({ ...contentForm, cityLine: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Promo Code<input value={contentForm.promoCode} onChange={(e) => setContentForm({ ...contentForm, promoCode: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="md:col-span-3 text-xs font-bold uppercase text-neutral-600">Top Promo Text<input value={contentForm.promoText} onChange={(e) => setContentForm({ ...contentForm, promoText: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <h4 className="font-black text-sm uppercase text-neutral-900 border-b border-neutral-200 pb-3">Footer & Newsletter</h4>
              <label className="block text-xs font-bold uppercase text-neutral-600">Footer Description<textarea value={contentForm.footerDescription} onChange={(e) => setContentForm({ ...contentForm, footerDescription: e.target.value })} rows={3} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="text-xs font-bold uppercase text-neutral-600">Newsletter Title<input value={contentForm.newsletterTitle} onChange={(e) => setContentForm({ ...contentForm, newsletterTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Newsletter Subtitle<input value={contentForm.newsletterSubtitle} onChange={(e) => setContentForm({ ...contentForm, newsletterSubtitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <h4 className="font-black text-sm uppercase text-neutral-900 border-b border-neutral-200 pb-3">Homepage Sections</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="text-xs font-bold uppercase text-neutral-600">Category Title<input value={contentForm.homeCategoryTitle} onChange={(e) => setContentForm({ ...contentForm, homeCategoryTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Category Subtitle<input value={contentForm.homeCategorySubtitle} onChange={(e) => setContentForm({ ...contentForm, homeCategorySubtitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Trending Title<input value={contentForm.homeTrendingTitle} onChange={(e) => setContentForm({ ...contentForm, homeTrendingTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Featured Title<input value={contentForm.homeFeaturedTitle} onChange={(e) => setContentForm({ ...contentForm, homeFeaturedTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">New Arrivals Title<input value={contentForm.homeNewArrivalsTitle} onChange={(e) => setContentForm({ ...contentForm, homeNewArrivalsTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
              </div>
              <div className="grid md:grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
                <label className="text-xs font-bold uppercase text-neutral-600">Deal Eyebrow<input value={contentForm.dealEyebrow} onChange={(e) => setContentForm({ ...contentForm, dealEyebrow: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Deal Title<input value={contentForm.dealTitle} onChange={(e) => setContentForm({ ...contentForm, dealTitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Deal Subtitle<input value={contentForm.dealSubtitle} onChange={(e) => setContentForm({ ...contentForm, dealSubtitle: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Deal Link<input value={contentForm.dealLink} onChange={(e) => setContentForm({ ...contentForm, dealLink: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">Old Price<input value={contentForm.dealOldPrice} onChange={(e) => setContentForm({ ...contentForm, dealOldPrice: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="text-xs font-bold uppercase text-neutral-600">New Price<input value={contentForm.dealNewPrice} onChange={(e) => setContentForm({ ...contentForm, dealNewPrice: e.target.value })} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <label className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">Deal Description<textarea value={contentForm.dealDescription} onChange={(e) => setContentForm({ ...contentForm, dealDescription: e.target.value })} rows={2} className={`${inputCls} mt-1 font-normal normal-case`} /></label>
                <div className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">Deal Image<div className="mt-1 flex flex-col sm:flex-row gap-2"><input value={contentForm.dealImage} onChange={(e) => setContentForm({ ...contentForm, dealImage: e.target.value })} className={`${inputCls} font-normal normal-case flex-1`} /><label className="px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center">Upload Deal Image<input type="file" accept="image/*" onChange={(e) => uploadDealImage(e.target.files?.[0] || null)} className="hidden" /></label></div></div>
              </div>

              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <h5 className="font-bold text-xs uppercase text-neutral-700">Promo Banners</h5>
                {contentForm.homePromoBanners.map((banner, index) => (
                  <div key={banner.id} className="border border-neutral-200 rounded-sm p-3 grid lg:grid-cols-[120px_1fr] gap-3">
                    <img src={banner.image} alt={banner.title} className="w-full h-24 object-cover rounded-sm" />
                    <div className="grid md:grid-cols-3 gap-2">
                      <input value={banner.eyebrow} onChange={(e) => updatePromoBanner(index, { eyebrow: e.target.value })} placeholder="Eyebrow" className={inputCls} />
                      <input value={banner.title} onChange={(e) => updatePromoBanner(index, { title: e.target.value })} placeholder="Title" className={inputCls} />
                      <input value={banner.subtitle} onChange={(e) => updatePromoBanner(index, { subtitle: e.target.value })} placeholder="Subtitle" className={inputCls} />
                      <input value={banner.buttonText} onChange={(e) => updatePromoBanner(index, { buttonText: e.target.value })} placeholder="Button" className={inputCls} />
                      <input value={banner.link} onChange={(e) => updatePromoBanner(index, { link: e.target.value })} placeholder="Link" className={inputCls} />
                      <select value={banner.style} onChange={(e) => updatePromoBanner(index, { style: e.target.value as typeof banner.style })} className={inputCls}><option value="red">Red</option><option value="yellow">Yellow</option><option value="dark">Dark</option></select>
                      <input value={banner.image} onChange={(e) => updatePromoBanner(index, { image: e.target.value })} placeholder="Image URL" className={`${inputCls} md:col-span-2`} />
                      <label className="px-3 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center">Upload<input type="file" accept="image/*" onChange={(e) => uploadPromoImage(index, e.target.files?.[0] || null)} className="hidden" /></label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
                {contentForm.trustItems.map((item, index) => (<div key={item.id} className="grid gap-2"><input value={item.title} onChange={(e) => updateTrustItem(index, { title: e.target.value })} className={inputCls} /><input value={item.desc} onChange={(e) => updateTrustItem(index, { desc: e.target.value })} className={inputCls} /></div>))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <h4 className="font-black text-sm uppercase text-neutral-900 border-b border-neutral-200 pb-3">About Page Content</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={contentForm.aboutHeroEyebrow} onChange={(e) => setContentForm({ ...contentForm, aboutHeroEyebrow: e.target.value })} placeholder="Hero Eyebrow" className={inputCls} />
                <input value={contentForm.aboutHeroTitle} onChange={(e) => setContentForm({ ...contentForm, aboutHeroTitle: e.target.value })} placeholder="Hero Title" className={inputCls} />
                <input value={contentForm.aboutHeroHighlight} onChange={(e) => setContentForm({ ...contentForm, aboutHeroHighlight: e.target.value })} placeholder="Hero Highlight" className={inputCls} />
                <input value={contentForm.aboutMissionTitle} onChange={(e) => setContentForm({ ...contentForm, aboutMissionTitle: e.target.value })} placeholder="Mission Title" className={inputCls} />
                <textarea value={contentForm.aboutHeroText} onChange={(e) => setContentForm({ ...contentForm, aboutHeroText: e.target.value })} rows={2} placeholder="Hero Text" className={`${inputCls} md:col-span-2`} />
                <textarea value={contentForm.aboutMissionBody1} onChange={(e) => setContentForm({ ...contentForm, aboutMissionBody1: e.target.value })} rows={2} placeholder="Mission Body 1" className={inputCls} />
                <textarea value={contentForm.aboutMissionBody2} onChange={(e) => setContentForm({ ...contentForm, aboutMissionBody2: e.target.value })} rows={2} placeholder="Mission Body 2" className={inputCls} />
                <div className="md:col-span-2 text-xs font-bold uppercase text-neutral-600">About Image<div className="mt-1 flex flex-col sm:flex-row gap-2"><input value={contentForm.aboutImage} onChange={(e) => setContentForm({ ...contentForm, aboutImage: e.target.value })} className={`${inputCls} font-normal normal-case flex-1`} /><label className="px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center">Upload About Image<input type="file" accept="image/*" onChange={(e) => uploadAboutImage(e.target.files?.[0] || null)} className="hidden" /></label></div></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
                {contentForm.aboutValues.map((value, index) => (<div key={value.id} className="grid gap-2"><input value={value.title} onChange={(e) => updateAboutValue(index, { title: e.target.value })} className={inputCls} /><textarea value={value.desc} onChange={(e) => updateAboutValue(index, { desc: e.target.value })} rows={2} className={inputCls} /></div>))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h4 className="font-black text-sm uppercase text-neutral-900">Hero Slides</h4>
                <button type="button" onClick={addHeroSlide} className="px-3 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm">+ Add Slide</button>
              </div>
              <div className="space-y-4">
                {contentForm.heroSlides.map((slide, index) => (
                  <div key={slide.id} className="border border-neutral-200 rounded-sm p-4 grid lg:grid-cols-[160px_1fr] gap-4">
                    <div>
                      <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded-sm bg-neutral-100 border border-neutral-200" />
                      <label className="mt-2 block px-3 py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm cursor-pointer text-center">
                        Upload Slide Image
                        <input type="file" accept="image/*" onChange={(e) => uploadHeroImage(index, e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between gap-3"><div className="font-bold text-sm text-neutral-900">Slide {index + 1}</div>{contentForm.heroSlides.length > 1 && <button type="button" onClick={() => deleteHeroSlide(index)} className="text-xs font-bold text-red-600 hover:underline">Delete</button>}</div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <input value={slide.subtitle} onChange={(e) => updateHeroSlide(index, { subtitle: e.target.value })} placeholder="Subtitle" className={inputCls} />
                        <input value={slide.title} onChange={(e) => updateHeroSlide(index, { title: e.target.value })} placeholder="Title" className={inputCls} />
                        <input value={slide.title2} onChange={(e) => updateHeroSlide(index, { title2: e.target.value })} placeholder="Accent Title" className={inputCls} />
                        <input value={slide.price} onChange={(e) => updateHeroSlide(index, { price: e.target.value })} placeholder="Price" className={inputCls} />
                        <input value={slide.buttonText} onChange={(e) => updateHeroSlide(index, { buttonText: e.target.value })} placeholder="Button Text" className={inputCls} />
                        <input value={slide.brand} onChange={(e) => updateHeroSlide(index, { brand: e.target.value })} placeholder="Brand Badge" className={inputCls} />
                        <input value={slide.link} onChange={(e) => updateHeroSlide(index, { link: e.target.value })} placeholder="Button Link" className={`${inputCls} md:col-span-1`} />
                        <input value={slide.image} onChange={(e) => updateHeroSlide(index, { image: e.target.value })} placeholder="Image URL or uploaded file data" className={`${inputCls} md:col-span-2`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-sm">Save Website Content</button>
            </div>
          </form>
        )}

        {tab === "customers" && (
          <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200"><h3 className="font-bold text-neutral-900">Customers</h3></div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500"><tr><th className="text-left px-5 py-2.5 font-bold">Customer</th><th className="text-left px-5 py-2.5 font-bold">Email</th><th className="text-left px-5 py-2.5 font-bold">Orders</th><th className="text-left px-5 py-2.5 font-bold">Spent</th></tr></thead><tbody className="divide-y divide-neutral-100 text-sm">{[{ name: "Marcus Chen", email: "marcus@pro.com", orders: 27, spent: 4520 }, { name: "Sarah Williams", email: "sarah@build.com", orders: 18, spent: 3210 }, { name: "David Okafor", email: "david@diy.com", orders: 12, spent: 1840 }, { name: state.user.name, email: state.user.email, orders: state.orders.length, spent: state.orders.reduce((s, o) => s + o.total, 0) }].map((c) => (<tr key={c.email} className="hover:bg-neutral-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-red-600 grid place-items-center text-white text-xs font-bold">{c.name[0]}</div><span className="font-semibold">{c.name}</span></div></td><td className="px-5 py-3 text-neutral-600">{c.email}</td><td className="px-5 py-3">{c.orders}</td><td className="px-5 py-3 font-bold">${c.spent.toLocaleString()}</td></tr>))}</tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
}