import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Badge,
  Button,
  Spinner,
  Alert,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { getUserDetail } from "@services/admin/userService";
import avatarDefault from "@assets/admin/images/users/avatar-1.jpg";
import Breadcrumb from "@components/admin/ui/Breadcrumb";
import { Link } from "react-router-dom";
import permissionLabels from "@services/admin/key.js";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("admin_user"));
    const userId = local?.id;

    if (userId) {
      getUserDetail(userId)
          .then((res) => {
            setUserData(res.data.data);
          })
          .catch(() => {
            setError("Không thể lấy thông tin người dùng.");
          })
          .finally(() => setLoading(false));
    }
  }, []);

  if (loading) {
    return (
        <div className="page-content">
          <Container className="py-5 d-flex justify-content-center align-items-center">
            <Spinner color="primary" />
          </Container>
        </div>
    );
  }

  if (error) {
    return (
        <div className="page-content">
          <Container className="py-5">
            <Alert color="danger">{error}</Alert>
          </Container>
        </div>
    );
  }

  const { user, role, permissions } = userData;

  return (
      <div className="page-content">
        <Container fluid>
          <style>
            {`
            .permission-list {
              max-height: 300px;
              overflow-y: auto;
            }

            .permission-item {
              transition: all 0.2s ease;
            }

            .permission-item:hover {
              background-color: #f1f3f5 !important;
              transform: translateX(5px);
            }

            .permission-list::-webkit-scrollbar {
              width: 6px;
            }

            .permission-list::-webkit-scrollbar-thumb {
              background-color: #c1c1c1;
              border-radius: 3px;
            }

            .permission-list::-webkit-scrollbar-track {
              background-color: #f1f1f1;
            }
          `}
          </style>
          <Breadcrumb title="Tài khoản" breadcrumbItem="Hồ sơ người dùng" />
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="shadow rounded border-0">
                <CardBody>
                  <div className="d-flex align-items-center mb-4">
                    <img
                        src={
                          user.avatar
                              ? `http://localhost:8000/storage/${user.avatar}`
                              : avatarDefault
                        }
                        alt="Avatar"
                        className="rounded-circle"
                        width={80}
                        height={80}
                        style={{ objectFit: "cover" }}
                    />
                    <div className="ms-4">
                      <h4 className="mb-0">{user.full_name}</h4>
                      <div className="text-muted">{user.email}</div>
                    </div>
                  </div>

                  <Row className="mb-4">
                    <Col sm={6}>
                      <strong>Username:</strong> {user.username}
                    </Col>
                    <Col sm={6}>
                      <strong>Số điện thoại:</strong> {user.phone_number}
                    </Col>
                    <Col sm={6} className="mt-2">
                      <strong>Vai trò:</strong>{" "}
                      <Badge color="info" className="text-uppercase">
                        {role}
                      </Badge>
                    </Col>
                    <Col sm={6} className="mt-2">
                      <strong>Trạng thái:</strong>{" "}
                      <Badge
                          color={user.status === "active" ? "success" : "secondary"}
                      >
                        {user.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                      </Badge>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <strong className="d-block mb-2">Danh sách quyền:</strong>
                    {permissions.length > 0 ? (
                        <ListGroup className="permission-list">
                          {permissions
                              .sort()
                              .map((p, idx) => (
                                  <ListGroupItem
                                      key={idx}
                                      className="d-flex align-items-center border-0 py-1 px-3 mb-1 rounded bg-light permission-item"
                                  >
                                    <span className="text-success me-2">✔</span>
                                    <Badge
                                        color="primary"
                                        className="py-2 px-3 flex-grow-1 text-start"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                      {permissionLabels[p] || p}
                                    </Badge>
                                  </ListGroupItem>
                              ))}
                        </ListGroup>
                    ) : (
                        <span className="text-muted">Không có quyền</span>
                    )}
                  </div>

                  <div className="text-end mt-4 d-flex justify-content-end gap-2">
                    <Link to="/change-password">
                      <Button color="secondary">Đổi mật khẩu</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
  );
};

export default UserProfile;