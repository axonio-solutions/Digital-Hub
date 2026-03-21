import { serverEnvs } from "@/utils/env";
import { Resend } from "resend";

export const resend = new Resend(serverEnvs.RESEND_API_KEY);
