import { Elysia } from "elysia";
import { AuthModel } from "../models/user.model";
import { authPlugin } from "../plugins/auth.plugin";
import { AuthenticationException } from "../exceptions/authentication.exception";
import { AuthServices } from "../services/auth.services";

const AuthRoutes = new Elysia({
  prefix: "/auth"
})
  .decorate("authService", new AuthServices)
  .model(AuthModel)
  .use(authPlugin)
  .post("/register", async ({ body, set, authService }) => {
    const newUser = await authService.registerUser(body);
    set.status = 201;

    return {
      message: "Account Successfully registered",
      data: {
        ...newUser
      }
    };
  }, {
    body: "auth.register",
    isSignIn: false
  })
  .post("/login", async ({
                           body,
                           authService,
                           jwt,
                           jwtRefresh,
                           cookie: { accessTokenCookie, refreshTokenCookie },
                           set
                         }) => {

    const user = await authService.validateUser(body.email, body.password);

    if (!user) {
      set.status = 400;
      throw new AuthenticationException(
        "Your credentials is not valid"
      );
    }

    const accessToken = await jwt.sign({
      sub: user.id
    });

    const refreshToken = await jwtRefresh.sign({
      sub: user.id
    });

    await authService.updateUserToken(user.id, refreshToken);

    accessTokenCookie.set({
      value: accessToken,
      httpOnly: true,
      path: "/"
    });


    refreshTokenCookie.set({
      value: refreshToken,
      httpOnly: true,
      path: "/"
    });

    set.status = 200;

    return {
      data: {
        access_token: accessToken,
        refresh_token: refreshToken
      }
    };

  }, { body: "auth.login", isSignIn: false })
  .get("/me", async ({ authenticatedUser }) => {
    return {
      ...authenticatedUser
    };
  }, {
    isSignIn: true,
    roles: ["admin"]
  });

export default AuthRoutes;