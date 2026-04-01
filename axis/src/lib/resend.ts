import { Resend } from "resend";
import { serverEnvs } from "@/utils/env";

export const resend = new Resend(serverEnvs.RESEND_API_KEY);
