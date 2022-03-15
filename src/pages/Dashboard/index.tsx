import React, { lazy, Suspense, useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { AppContainer } from "../../components/layout/AppContainer";
import ErrorBoundary from "../../components/layout/ErrorBoundary";
import { Sidebar } from "../../components/layout/Sidebar";
import ToolBar from "../../components/layout/ToolBar";
import AppStateProvider from "../../context/appStateContext/AppStateProvider";
import ConnectionProvider from "../../context/connectionContext/ConnectionProvider/Index";
import useConnection, {
  connectionContext,
} from "../../context/connectionContext/useConnection";
import ContractProvider from "../../context/contractContext/ContractProvider";
import { SidebarContext } from "../../context/sidebarcontext";
import TransactionProvider from "../../context/transactionContext/TransactionProvider";

import routes, { Fallback } from "../../routes";

const NotFound = lazy(() => import("../NotFound"));

const Dashboard = () => {
  const { isSidebarOpen } = useContext(SidebarContext) || {};

  const location = useLocation();

  useEffect(() => {
    console.log(location, routes);
  }, [isSidebarOpen, location]);

  return (
    <div className={`flex h-screen ${isSidebarOpen && "overflow-hidden"}`}>
      <Sidebar />

      <div className="flex flex-col flex-1 w-full overflow-y-auto relative h-full py-20">
        <ToolBar />

        <AppContainer>
          <Suspense fallback={<Fallback />}>
            <Routes>
              {routes.map(
                (
                  route: { component: React.ComponentType; path: string },
                  i: React.Key | null | undefined
                ) => {
                  return route.component ? (
                    <Route
                      key={i}
                      path={`${route.path}`}
                      element={<route.component />}
                    />
                  ) : null;
                }
              )}
              <Route
                path=""
                element={<Navigate to="/decentralaunch/app/dashboard" />}
              />
              <Route path={"*"} element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppContainer>
      </div>
    </div>
  );
};

const DashboardWithContext = () => {
  return (
    <ConnectionProvider>
      <ContractProvider>
        <AppStateProvider>
          <TransactionProvider>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </TransactionProvider>
        </AppStateProvider>
      </ContractProvider>
    </ConnectionProvider>
  );
};

export default DashboardWithContext;
