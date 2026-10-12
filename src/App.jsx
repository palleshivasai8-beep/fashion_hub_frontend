
import React, { useEffect, useState } from "react";
import "./App.css";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
const API = rawApiUrl.replace(/\/+$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/+$/, "")
  : `${rawApiUrl.replace(/\/+$/, "")}/api`;

export default function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("fashionUser") || "null")
  );
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: ""
  });

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setProducts)
      .catch(() => setMessage("Could not load dresses. Start the backend."));
  }, []);

  async function submitAuth(e) {
    e.preventDefault();
    setMessage("");

    const registering = page === "register";
    const url = registering ? "register" : "login";
    const body = registering
      ? { name: form.name, email: form.email, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const response = await fetch(`${API}/auth/${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Request failed");

      if (registering) {
        setMessage("Registration successful! Please log in.");
        setPage("login");
      } else {
        setUser(data);
        localStorage.setItem("fashionUser", JSON.stringify(data));
        setMessage(`Welcome ${data.name}!`);
        setPage("home");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("fashionUser");
    setUser(null);
    setOrders([]);
    setCart([]);
    setPage("home");
    setMessage("Logged out successfully.");
  }

  async function loadOrders() {
    if (!user) {
      setPage("login");
      return;
    }

    try {
      const response = await fetch(`${API}/orders?userId=${user.id}`);
      if (!response.ok) throw new Error("Unable to load orders");
      setOrders(await response.json());
      setPage("orders");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markDelivered(id) {
    try {
      const response = await fetch(`${API}/orders/${id}/deliver`, {
        method: "PUT"
      });
      if (!response.ok) throw new Error("Unable to update order status");
      setMessage(`Order #${id} marked as Delivered!`);
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!user) {
      setPage("login");
      return;
    }

    if (cart.length === 0) {
      setMessage("Please add dresses to your cart.");
      return;
    }

    const order = {
      userId: user.id,
      customerName: user.name,
      address: form.address,
      productNames: cart.map((p) => p.name).join(", "),
      quantity: cart.length,
      totalPrice: cart.reduce((sum, p) => sum + Number(p.price), 0)
    };

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed");

      setCart([]);
      setMessage(`Order confirmed! Your order number is ${data.id}.`);
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      <header>
        <h1>Fashion Hub</h1>
        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("cart")}>Cart ({cart.length})</button>
          {user && <button onClick={loadOrders}>My Orders</button>}
          {!user ? (
            <>
              <button onClick={() => setPage("login")}>Login</button>
              <button onClick={() => setPage("register")}>Register</button>
            </>
          ) : (
            <>
              <span>Hi, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      {message && <p className="message">{message}</p>}

      {page === "home" && (
        <main>
          <h2>Welcome to Fashion Hub</h2>
          <p>Discover the latest fashion at affordable prices.</p>
          <div className="products">
            {products.map((p) => (
              <div className="product" key={p.id}>
                <img
                  src={p.image}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/300x350?text=Fashion";
                  }}
                />
                <h3>{p.name}</h3>
                <p>{p.category}</p>
                <h3>₹{p.price}</h3>
                <button onClick={() => {
                  setCart([...cart, p]);
                  setMessage(`${p.name} added to cart.`);
                }}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {(page === "register" || page === "login") && (
        <form className="auth-form" onSubmit={submitAuth}>
          <h2>{page === "register" ? "Create Account" : "Login"}</h2>
          {page === "register" && (
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={change}
              required
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={change}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={change}
            required
          />
          <button type="submit">
            {page === "register" ? "Register" : "Login"}
          </button>
          <p>
            {page === "register" ? "Already registered?" : "New user?"}
            <button
              type="button"
              onClick={() => setPage(page === "register" ? "login" : "register")}
            >
              {page === "register" ? " Login" : " Register"}
            </button>
          </p>
        </form>
      )}

      {page === "cart" && (
        <main>
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? <p>Your cart is empty.</p> : (
            <>
              {cart.map((p, i) => (
                <p key={`${p.id}-${i}`}>{p.name} — ₹{p.price}</p>
              ))}
              <h3>Total: ₹{cart.reduce((sum, p) => sum + Number(p.price), 0)}</h3>
              <button onClick={() => setPage("checkout")}>Proceed to Checkout</button>
            </>
          )}
        </main>
      )}

      {page === "checkout" && (
        <form className="auth-form" onSubmit={placeOrder}>
          <h2>Delivery Details</h2>
          <p>Customer: {user ? user.name : "Please log in first"}</p>
          <textarea
            name="address"
            placeholder="Enter your full delivery address"
            value={form.address}
            onChange={change}
            required
          />
          <button type="submit">Place Order</button>
        </form>
      )}

      {page === "orders" && (
        <main>
          <h2>My Orders</h2>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map((o) => (
            <div className="product" key={o.id}>
              <h3>Order #{o.id}</h3>
              <p>Items: {o.productNames}</p>
              <p>Quantity: {o.quantity}</p>
              <p>Total: ₹{o.totalPrice}</p>
              <p>Delivery address: {o.address}</p>
              <p>Status: <strong>{o.status}</strong></p>
              {o.status !== "Delivered" && (
                <button onClick={() => markDelivered(o.id)}>
                  Mark as Delivered
                </button>
              )}
            </div>
          ))}
        </main>
      )}
    </div>
  );
}