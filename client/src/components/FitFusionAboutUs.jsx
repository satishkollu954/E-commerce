import React from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";

export function FitFusionAboutUs() {
  return (
    <Container className="py-5">
      <Row className="text-center mb-4">
        <Col>
          <h1 className="fw-bold">About Us</h1>
          <p className="text-muted">Your family’s go-to fashion destination</p>
        </Col>
      </Row>

      <Row className="align-items-center mb-5">
        <Col md={4}>
          <Image src="/fashion.jpg" fluid rounded />
        </Col>
        <Col md={8}>
          <h3 className="fw-semibold">Welcome to FitFusion 👋</h3>
          <p>
            At <strong>FitFusion</strong>, we blend style, comfort, and
            affordability to offer fashion for the entire family. Whether you're
            shopping for casual, festive, or everyday wear — we've got something
            stylish for Men, Women, and Kids.
          </p>
          <p>
            Our mission is to empower individuals and families to express
            themselves through high-quality, trend-forward clothing that doesn't
            compromise on comfort or price. With an ever-evolving collection
            curated by fashion experts, <strong>FitFusion</strong> ensures you
            always stay ahead of the style curve.
          </p>
          <p>
            We prioritize quality in every fabric, attention to detail in every
            stitch, and satisfaction in every order. From trendy teen looks to
            cozy family fits, our diverse catalog celebrates fashion for every
            age and occasion.
          </p>
          <p>
            Based on customer feedback and changing trends, we constantly update
            our collections to reflect what our shoppers love most. And with
            secure shopping, fast shipping, and responsive support — your
            FitFusion experience is smooth from start to finish.
          </p>
          <p>
            Join the FitFusion family and discover fashion that fits your life,
            your style, and your budget.
          </p>
        </Col>
      </Row>

      <Row className="text-center mb-5">
        <h3 className="fw-semibold mb-4">👗 What We Offer</h3>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5>👨‍💼 Men’s Collection</h5>
              <p>
                Stylish shirts, t-shirts, jeans, and jackets for every occasion.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5>👩 Women’s Collection</h5>
              <p>From ethnic to western wear – elegance meets trend here.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <h5>👶 Children’s Collection</h5>
              <p>Cute, comfy, and durable clothing for your little ones.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="align-items-center mb-5">
        <Col md={5} className="order-md-2">
          <Image src="/family-home.jpg" fluid rounded />
        </Col>
        <Col md={6}>
          <h3 className="fw-semibold">💡 Why Choose FitFusion?</h3>
          <ul>
            <li>✅ Inclusive fashion for all sizes & ages</li>
            <li>✅ Soft, high-quality fabrics</li>
            <li>✅ Easy and secure shopping experience</li>
            <li>✅ Fast and reliable delivery</li>
            <li>✅ Friendly customer support</li>
          </ul>
        </Col>
      </Row>

      <Row className="align-items-center">
        <Col md={5}>
          <Image src="/support.jpg" fluid rounded />
        </Col>
        <Col md={6}>
          <h3 className="fw-semibold">🌟 Our Vision</h3>
          <p>
            We aim to become a trusted fashion partner for families by blending
            modern design with practicality. Join the FitFusion family and
            experience the perfect balance between fashion and comfort!
          </p>
        </Col>
      </Row>
    </Container>
  );
}
