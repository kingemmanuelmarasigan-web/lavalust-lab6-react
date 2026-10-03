import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access_token") || ""
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refresh_token") || ""
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // LOGIN
  const login = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid username or password.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      setToken(data.access_token);
      setRefreshToken(data.refresh_token);

      setUsername("");
      setPassword("");
      setMessage("Login successful.");
    } catch (err) {
      setError("Unable to connect to the API.");
    }
  };

  // GET PRODUCTS
  const getProducts = async () => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "GET",
         headers: {
    "Content-Type": "application/json",
    },
      body: JSON.stringify({ username, password }),
    });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Failed to load products.");
        return;
      }

      setProducts(data);
    } catch (err) {
      setError("Unable to connect to the API.");
    }
  };

  useEffect(() => {
    if (token) {
      getProducts();
    }
  }, [token]);

  // CLEAR FORM
  const clearForm = () => {
    setProductName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setEditingId(null);
  };

  // ADD / UPDATE PRODUCT
  const saveProduct = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const productData = {
      product_name: productName,
      description: description,
      price: Number(price),
      quantity: Number(quantity),
    };

    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save product.");
        return;
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      clearForm();
      getProducts();
    } catch (err) {
      setError("Unable to connect to the API.");
    }
  };

  // EDIT BUTTON
  const editProduct = (product) => {
    setEditingId(product.id);
    setProductName(product.product_name);
    setDescription(product.description || "");
    setPrice(product.price);
    setQuantity(product.quantity);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete product.");
        return;
      }

      setMessage("Product deleted successfully.");
      getProducts();
    } catch (err) {
      setError("Unable to connect to the API.");
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });
      }
    } catch (err) {
      // Continue logout even if API request fails
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setToken("");
    setRefreshToken("");
    setProducts([]);
    clearForm();
    setMessage("");
    setError("");
  };

  // LOGIN PAGE
  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo">♞</div>

          <h1>Product Manager</h1>
          <p className="subtitle">LavaLust API + React</p>

          <form onSubmit={login}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            <button type="submit" className="primary-button">
              Login
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // PRODUCT PAGE
  return (
    <div className="app-page">
      <header className="topbar">
        <div>
          <h1>Product Management</h1>
          <p>LavaLust REST API</p>
        </div>

        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="container">
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <section className="form-card">
          <div className="section-header">
            <div>
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              <p>
                {editingId
                  ? "Update the product information."
                  : "Add a new product to your inventory."}
              </p>
            </div>
          </div>

          <form onSubmit={saveProduct} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Chess Board"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="primary-button">
                {editingId ? "Update Product" : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="products-card">
          <div className="section-header">
            <div>
              <h2>Product List</h2>
              <p>Products retrieved from the LavaLust API.</p>
            </div>

            <button onClick={getProducts} className="refresh-button">
              Refresh
            </button>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <div>📦</div>
              <h3>No products found</h3>
              <p>Add your first product using the form above.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <strong>{product.product_name}</strong>
                      </td>
                      <td>{product.description}</td>
                      <td>₱{Number(product.price).toFixed(2)}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => editProduct(product)}
                            className="edit-button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;