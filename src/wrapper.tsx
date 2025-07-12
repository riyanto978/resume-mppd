import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container, Content, Header, Nav, Navbar } from "rsuite";
import { ListTenagaKesehatan } from "./pages/ListTenagaKesehatan";
import ResumeByDistrict from "./pages/ResumeByDistrict";

import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { axiosClient } from "./config/axios";

const MySwal = withReactContent(Swal);

const Wrapper = () => {
  const sendImport = async () => {
    let timerInterval: number | undefined;
    try {
      const { value: file } = await Swal.fire({
        title: "Select image",
        input: "file",
        inputAttributes: {
          accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "aria-label": "Upload your profile picture",
        },
      });

      MySwal.fire({
        title: "Auto close alert!",
        html: "Tunggu...",
        showCloseButton: false,
        allowOutsideClick: false,
        // timerProgressBar: true,
        didOpen: () => {
          MySwal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append("file", file);

      await axiosClient.post("import/mppd", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });

      await MySwal.fire("Sukes Terupload");

      window.location.reload();
    } catch (error) {
    } finally {
      MySwal.hideLoading();
    }
  };

  return (
    <Container>
      <Header>
        <Navbar appearance="inverse">
          <Nav>
            <Nav.Item href="/">Home</Nav.Item>
            <Nav.Item href="/nakes">Tenaga Kesehatan</Nav.Item>
            <Nav.Item href="/chart">Chart</Nav.Item>
          </Nav>

          <Nav pullRight>
            <Nav.Item
              onClick={() => {
                sendImport();
              }}
            >
              Import MPPD
            </Nav.Item>
          </Nav>
        </Navbar>
      </Header>
      <Content
        style={{
          padding: "16px",
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ResumeByDistrict />} />
            <Route path="/nakes" element={<ListTenagaKesehatan />} />
          </Routes>
        </BrowserRouter>
      </Content>
    </Container>
  );
};

export default Wrapper;
