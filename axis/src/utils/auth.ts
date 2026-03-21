import { serverEnvs } from "@/utils/env";
import { type JWTPayload, jwtVerify } from "jose";

export const decodeToken = async (
	token: string,
): Promise<JWTPayload | null> => {
	try {
		const secret = new TextEncoder().encode(serverEnvs.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);
		return payload;
	} catch (error) {
		console.error("Token verification failed:", error); // TODO: handle error
		return null;
	}
};
