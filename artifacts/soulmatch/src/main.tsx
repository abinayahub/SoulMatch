import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { API_URL } from './config/api';

// Configure the generated API client with the production API URL
setBaseUrl(API_URL);

// Wire up the auth token so all React Query hooks automatically send the JWT Bearer token
const ACCESS_TOKEN_KEY = "soulmatch_access_token";
setAuthTokenGetter(() => localStorage.getItem(ACCESS_TOKEN_KEY));

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

