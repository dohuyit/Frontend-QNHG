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
} from "reactstrap";
import { getUserDetail } from "@services/admin/userService";
import avatarDefault from "@assets/admin/images/users/avatar-1.jpg";
import Breadcrumb from "@components/admin/ui/Breadcrumb";
import { Link } from "react-router-dom";

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
                          color={
                            user.status === "active" ? "success" : "secondary"
                          }
                      >
                        {user.status === "active"
                            ? "Đang hoạt động"
                            : "Không hoạt động"}
                      </Badge>
                    </Col>
                  </Row>

                  <div>
                    <strong>Danh sách quyền:</strong>
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {permissions.length > 0 ? (
                          permissions.map((p, idx) => (
                              <Badge color="primary" key={idx}>
                                {p}
                              </Badge>
                          ))
                      ) : (
                          <span className="text-muted">Không có quyền</span>
                      )}
                    </div>
                  </div>

                  <div className="text-end mt-4 d-flex justify-content-end gap-2">
                    <Link to="/change-password">
                      <Button color="secondary">Đổi mật khẩu</Button>
                    </Link>
                    <Button color="danger">Chỉnh sửa hồ sơ</Button>
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
