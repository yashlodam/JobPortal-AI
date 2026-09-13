import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { store } from "./State/Store.js";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import App from "./App.jsx";

const mantineTheme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'Satoshi, Inter, system-ui, sans-serif',
  headings: { fontFamily: 'Satoshi, Inter, system-ui, sans-serif' },
  defaultRadius: 'md',
  colors: {
    dark: [
      '#F1F5F9',
      '#94A3B8',
      '#708090',
      '#1C2333',
      '#161B22',
      '#0D1117',
      '#0a0e17',
      '#06080F',
      '#050710',
      '#030408',
    ],
  },
});

function ThemedMantineRoot() {
  const { theme } = useTheme();

  return (
    <MantineProvider theme={mantineTheme} forceColorScheme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ThemedMantineRoot />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);