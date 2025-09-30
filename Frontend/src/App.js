import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

import MainNavigation from "./Shared/Components/Navigation/MainNavigation";
import { AuthContext } from "./Shared/Context/auth-context";
import { useAuth } from "./Shared/hooks/auth-hook";
import LoadingSpinner from "./Shared/Components/UIElements/LoadingSpinner";

const Users = React.lazy(() => import("./User/Pages/Users"));
const NewPlace = React.lazy(() => import("./Places/Pages/NewPlace"));
const UpdatePlace = React.lazy(() => import("./Places/Pages/UpdatePlace"));
const UserPlaces = React.lazy(() => import("./Places/Pages/UserPlaces"));
const Auth = React.lazy(() => import("./User/Pages/Auth"));

const App = () => {
  const { token, login, logout, userId } = useAuth();

  let routes;
  if (token) {
    routes = (
      <Switch>
        <Route path="/" component={Users} exact />
        <Route path="/:userId/places" component={UserPlaces} />
        <Route path="/places/new" component={NewPlace} />
        <Route path="/places/:placeId" component={UpdatePlace} />
        <Redirect to="/" />
      </Switch>
    );
  } else
    routes = (
      <Switch>
        <Route path="/" component={Users} exact />
        <Route path="/:userId/places" component={UserPlaces} />
        <Route path="/auth" component={Auth} />
        <Redirect to="/auth" />
      </Switch>
    );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner asOverlay />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
