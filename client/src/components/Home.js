import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Navbar,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Home() {
  const [models, setModels] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [cart, setCart] = useState({});
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/login");
    }
  }, [username, navigate]);

  useEffect(() => {
    axios
    .get(`${process.env.REACT_APP_API_BASE_URL}/models`)
      .then((res) => {
        setModels(res.data.models);
        setTotalStock(res.data.totalStock);
      })
      .catch((error) => console.error("Error fetching models:", error));
  }, []);

  const updateQuantity = (id, change) => {
    setCart((prev) => {
      const newQty = (prev[id] || 0) + change;
      return { ...prev, [id]: newQty >= 0 ? Math.min(newQty, totalStock) : 0 };
    });
  };

  const submitOrder = async () => {
    const selectedModels = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        id,
        name: models.find((m) => m._id === id)?.name,
        quantity: qty,
        image: models.find((m) => m._id === id)?.image,
        color: models.find((m) => m._id === id)?.color,
      }));

    if (selectedModels.length === 0) {
      alert("Please select at least one model.");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/orders/submit`,
        {
          username,
          selectedModels,
        }
      );

      if (response.data.success) {
        alert("Order submitted successfully!");
        setCart({});
        navigate("/orders");
      }
    } catch (error) {
      alert(
        "Error submitting order: " +
          (error.response?.data?.message || error.message)
      );
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

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <Container>
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
        <Nav className="ms-auto gap-2">
        <Button variant="primary" onClick={() => navigate("/orders")}>
  View Order
</Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </Navbar>

      {/* Pricing Tiers */}
      <Row className="pricing-tiers">
  <Col className="price-tier">
    <strong>1 - 40 pieces</strong>
    <br />
    ₹480
  </Col>
  <Col className="price-tier">
    <strong>41 - 60 pieces</strong>
    <br />
    ₹460
  </Col>
  <Col className="price-tier">
    <strong>≥ 61 pieces</strong>
    <br />
    ₹445
  </Col>
</Row>
      <Row className="mt-3">
        {/* <h5 className="mb-3 fs-6">Models ({models.length})</h5> */}
        {models.map((model) => (
          <Col key={model._id} xs={6} sm={6} md={4} lg={3} className="mb-3">
            <Card className="h-100 text-center shadow-sm p-2">
              <Card.Img
                variant="top"
                src={
                  model.image || "https://via.placeholder.com/150?text=No+Image"
                }
                alt={model.name}
                className="card-img"
                style={{ borderRadius: "6px" }}
              />
              <Card.Body
                style={{ padding: "7px" }}
                className="d-flex flex-column justify-content-between"
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
                  <span className="fw-bold">{model.name}</span>
                  <span style={{ paddingTop: "6px" }} className="text-muted">
                    {model.color}
                  </span>
                </div>
                <div
                  style={{ marginTop: "7px" }}
                  className="d-flex justify-content-between align-items-center border rounded px-2 py-1 w-100"
                >
                  <Button
                    variant="light"
                    className="p-2 btn-sm flex-grow-1"
                    onClick={() => updateQuantity(model._id, -1)}
                    disabled={(cart[model._id] || 0) === 0}
                  >
                    -
                  </Button>
                  <span className="mx-2 fs-6 text-center flex-grow-1">
                    {cart[model._id] || 0}
                  </span>
                  <Button
                    variant="light"
                    className="p-2 btn-sm flex-grow-1"
                    onClick={() => updateQuantity(model._id, 1)}
                    disabled={(cart[model._id] || 0) >= totalStock}
                  >
                    +
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
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
            onClick={submitOrder}
            className="px-3 py-2"
          >
            Submit
          </Button>
        </div>
      </div>
    </Container>
  );
}

export default Home;