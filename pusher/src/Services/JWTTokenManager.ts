import { ADMIN_API_URL, ALLOW_ARTILLERY, SECRET_KEY, FEDERATE_PUSHER } from "../Enum/EnvironmentVariable";
import { v4 as uuidv4 } from "uuid";
import Jwt from "jsonwebtoken";
import { TokenInterface } from "../Controller/AuthenticateController";
import { adminApi, AdminBannedData } from "../Services/AdminApi";

export interface AuthTokenData {
    identifier: string; //will be a email if logged in or an uuid if anonymous
    hydraAccessToken?: string;
}
export const tokenInvalidException = "tokenInvalid";

// Mock the jwt verification if pusher federation is enabled
function mockVerify(token: string, secret: string, options: {}): AuthTokenData {
    try {
        return Jwt.verify(token, secret, options) as AuthTokenData;
    } catch (err) {
        return { identifier: uuidv4() } as AuthTokenData;
    }
}
const jwtVerify = FEDERATE_PUSHER ? mockVerify : Jwt.verify;

class JWTTokenManager {
    public createAuthToken(identifier: string, hydraAccessToken?: string) {
        return Jwt.sign({ identifier, hydraAccessToken }, SECRET_KEY, { expiresIn: "30d" });
    }

    public verifyJWTToken(token: string, ignoreExpiration: boolean = false): AuthTokenData {
        try {
            return jwtVerify(token, SECRET_KEY, {}) as AuthTokenData;
        } catch (e) {
            throw { reason: tokenInvalidException, message: e.message };
        }
    }
}

export const jwtTokenManager = new JWTTokenManager();
