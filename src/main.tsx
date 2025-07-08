import { createRoot } from "react-dom/client";
import "rsuite/dist/rsuite.min.css";
import { ListTenagaKesehatan } from "./pages/ListTenagaKesehatan";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResumeByDistrict from "./pages/ResumeByDistrict";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container, Content, Header, Nav, Navbar } from "rsuite";
import { FaCog } from "react-icons/fa";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const route = createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Container>
      <Header>
        <Navbar appearance="inverse">
          <Nav>
            <Nav.Item href="/">Home</Nav.Item>
            <Nav.Item href="/resume/district">Resume By District</Nav.Item>
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
            <Route path="/" element={<ListTenagaKesehatan />} />
            <Route path="/resume/district" element={<ResumeByDistrict />} />
          </Routes>
        </BrowserRouter>
      </Content>
    </Container>
  </QueryClientProvider>
);
