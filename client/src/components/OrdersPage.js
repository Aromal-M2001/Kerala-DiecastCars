import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Button, Navbar, Nav, Container, Modal, Form } from "react-bootstrap";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [isEditAllowed, setIsEditAllowed] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/orders`, { params: { username } })
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, [username]);

  const totalQuantity = orders.reduce(
    (sum, order) =>
      sum +
      order.selectedModels.reduce((s, model) => s + (model.quantity ?? 0), 0),
    0
  );

  const getUnitPrice = (totalQty) => {
    return totalQty >= 61 ? 445 : totalQty >= 41 ? 460 : 480;
  };

  const unitPrice = getUnitPrice(totalQuantity);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handlePasswordSubmit = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      if (response.data.success) {
        setShowModal(false);
        setIsEditAllowed(true);
        navigate("/edit-order", { state: { isEditAllowed: true } });
      } else {
        setError("Incorrect password");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    }
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
        <Navbar.Brand style={{ display: "flex", alignItems: "center" }} href="/">
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
          <Button variant="primary" onClick={handleEditClick}>
            Edit Order
          </Button>
           <Button variant="danger" onClick={handleLogout}>
                      Logout
           </Button>
        </Nav>
      </Navbar>

      <div className="table-responsive">
  <table className="table border rounded">
    <thead className="table-light">
      <tr>
        <th>Product Name</th>
        <th>Colour</th>
        <th>Qty</th>
        <th className="d-none d-md-table-cell">Total</th>
      </tr>
    </thead>
    <tbody>
      {orders.length === 0 ? (
        <tr>
          <td colSpan="5" className="text-center">
            No orders found.
          </td>
        </tr>
      ) : (
        orders.map((order, index) =>
          order.selectedModels.map((model, i) => {
            const totalQuantity = model.quantity ?? 0;
            const unitPrice = getUnitPrice(totalQuantity);
            const totalPrice = totalQuantity * unitPrice;

            return (
              <tr key={`${index}-${i}`}>
                <td className="d-flex align-items-center">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="me-3"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 5,
                    }}
                  />
                  <div>{model.name}</div>
                </td>
                <td className="align-middle">{model.color}</td>
                <td className="align-middle">{totalQuantity}</td>
                <td className="align-middle d-none d-md-table-cell">
                  ₹{totalPrice}
                </td>
              </tr>
            );
          })
        )
      )}
    </tbody>
  </table>
</div>


      {orders.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
          className="fs-5 custom-padding"
        >
          <strong className="fs-5 fs-md-5">
            Quantity:{" "}
            {orders.reduce(
              (sum, order) =>
                sum +
                order.selectedModels.reduce(
                  (s, model) => s + (model.quantity ?? 0),
                  0
                ),
              0
            )}{" "}{" "}
            <span style={{color: "rgb(119 119 119)"}}>(₹{unitPrice}/piece)</span>
          </strong>
          <strong className="ms-md-3 mt-3 pt-2 mt-md-0 fs-3 fs-md-5">
            Total : ₹
            {orders.reduce((sum, order) => {
              return (
                sum +
                order.selectedModels.reduce((s, model) => {
                  const totalQuantity = model.quantity ?? 0;
                  return s + totalQuantity * getUnitPrice(totalQuantity);
                }, 0)
              );
            }, 0)}/-
          </strong>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="password">
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </Form.Group>
          {error && <p className="text-danger mt-2">{error}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrdersPage;

