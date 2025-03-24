import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Container, Row, Col, Card, Navbar, Nav } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";

function EditOrder() {
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [models, setModels] = useState([]); // Declare models
  const [orderDetails, setOrderDetails] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditAllowed = location.state?.isEditAllowed || false;
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/login");
    }
  }, [username, navigate]);

  useEffect(() => {
    if (!isEditAllowed) {
      navigate("/");
    }
  }, [isEditAllowed, navigate]);

  useEffect(() => {
    axios
      .get(`http://localhost:5001/api/orders`, { params: { username } })
      .then((res) => {
        const fetchedOrders = res.data.orders || [];
        setOrders(fetchedOrders);
  
        if (fetchedOrders.length > 0) {
          const lastOrder = fetchedOrders[fetchedOrders.length - 1];
          setOrderDetails(lastOrder);
  
          const initialCart = {};
          lastOrder.selectedModels.forEach((item) => {
            initialCart[item.id] = item.quantity;
          });
          setCart(initialCart);
        }
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, [username]);  

  useEffect(() => {
    // Fetch all available models
    axios
      .get("http://localhost:5001/api/models")
      .then((res) => setModels(res.data.models))
      .catch((error) => console.error("Error fetching models:", error));
  }, []);

  useEffect(() => {
    // Fetch the order details
    axios
      .get(`http://localhost:5001/api/orders/${orderId}`)
      .then((res) => {
        setOrderDetails(res.data.order);
        const initialCart = {};
        res.data.order.items.forEach((item) => {
          initialCart[item.id] = item.quantity;
        });
        setCart(initialCart);
      })
      .catch((error) => console.error("Error fetching order details:", error));
  }, [orderId]);

  const updateQuantity = (id, change) => {
    setCart((prev) => {
      const newQty = (prev[id] || 0) + change;
      return { ...prev, [id]: Math.max(0, newQty) };
    });
  };

  const submitUpdatedOrder = async () => {
    const selectedModels = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const model = models.find((m) => String(m._id) === String(id));
        return {
          id,
          name: model?.name || "Unknown",
          quantity: qty,
          image: model?.image || "",
          color: model?.color || "N/A",
        };
      });

    if (selectedModels.length === 0) {
      alert("Please select at least one model.");
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/orders/update`, {
        orderId,
        username,
        selectedModels,
      });

      if (response.data.success) {
        alert("Order updated successfully!");
        navigate("/orders");
      }
    } catch (error) {
      alert("Error updating order: " + (error.response?.data?.message || error.message));
    }
  };

  const getTotalCartQuantity = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getPerPieceRate = () => {
    const totalCartQuantity = getTotalCartQuantity();
    return totalCartQuantity >= 61 ? 445 : totalCartQuantity >= 41 ? 460 : 480;
  };

  const getSubtotal = () => {
    return getTotalCartQuantity() * getPerPieceRate();
  };

  return (
    <Container >
            <Navbar
              style={{ backgroundColor: "rgb(214 214 214)", borderRadius: "10px" }}
              expand="lg"
              className="shadow-sm mb-3 px-3"
            >
              <Navbar.Brand
                style={{ display: "flex", alignItems: "center" }}
                href="/"
              >
                <img
                  src="https://res.cloudinary.com/dpuppuerx/image/upload/v1742135807/phkkk4ny2ij04y3hysc7.jpg"
                  alt="Logo"
                  width="40"
                  height="40"
                  className="d-inline-block align-top me-2 logo-img"
                  style={{ borderRadius: "50%" }}
                />
                <span className="fw-bold fs-5 site-title">Kerala Diecast Cars</span>
              </Navbar.Brand>
              <Nav className="ms-auto">
              <Button variant="danger" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
              </Nav>
            </Navbar>

      <h4 className="mb-3">Edit Order</h4>
        <Row>
          {models.map((model) => (
            <Col key={model._id} xs={6} sm={6} md={4} lg={3} className="mb-3">
              <Card className="h-100 text-center shadow-sm p-2">
                <Card.Img
                  variant="top"
                  src={model.image || "https://via.placeholder.com/150?text=No+Image"}
                  alt={model.name}
                  className="card-img"
                  style={{ borderRadius: "6px" }}
                />
                <Card.Body style={{ padding: "7px" }} className="d-flex flex-column justify-content-between">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                    <span className="fw-bold">{model.name}</span>
                    <span style={{ paddingTop: "6px" }} className="text-muted">{model.color}</span>
                  </div>
                  <div style={{ marginTop: "7px" }} className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100">
                    <Button variant="light" className="p-2 btn-sm flex-grow-1" onClick={() => updateQuantity(model._id, -1)} disabled={(cart[model._id] || 0) === 0}>
                      -
                    </Button>
                    <span className="mx-2 fs-6 text-center flex-grow-1">{cart[model._id] || 0}</span>
                    <Button variant="light" className="p-2 btn-sm flex-grow-1" onClick={() => updateQuantity(model._id, 1)}>
                      +
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

      {/* <div className="mt-3 d-flex justify-content-between align-items-center border-top pt-3">
        <h5 style={{ fontSize: "18px", fontWeight: "bold" }}>
          Updated Items: {Object.values(cart).reduce((sum, qty) => sum + qty, 0)}
        </h5>
        <Button variant="warning" size="sm" onClick={submitUpdatedOrder} className="px-3 py-2">
          Update Order
        </Button>
      </div> */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
              }}
              className="mt-3 align-items-center border-top pt-3"
            >
              <div>
                <span className="fs-6">Per Piece: ₹{getPerPieceRate()}</span>
                <h5
                  style={{ paddingTop: "8px", fontSize: "18px", fontWeight: "bold" }}
                >
                  Subtotal: ₹{getSubtotal()}/-
                </h5>
              </div>
              <div>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={submitUpdatedOrder}
                  className="px-3 py-2"
                >
                 Update Order
                </Button>
              </div>
            </div>
    </Container>
  );
}

export default EditOrder;