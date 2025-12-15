/**
 * CHUEF RECAPTCHA VERIFICATION MODULE
 * Server-side only - never expose secret to client
 * 
 * Uses Google reCAPTCHA v3 for invisible verification
 */

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export interface RecaptchaResult {
  ok: boolean;
  score?: number;
  reason?: string;
}

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE_THRESHOLD = 0.5;

/**
 * Verify a reCAPTCHA token server-side
 * @param token - The reCAPTCHA token from the client
 * @param ip - Optional client IP for additional verification
 */
export async function verifyRecaptcha(
  token: string,
  ip?: string
): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return {
      ok: false,
      reason: "Server configuration error",
    };
  }

  if (!token) {
    return {
      ok: false,
      reason: "Missing captcha token",
    };
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });

    if (ip) {
      params.append("remoteip", ip);
    }

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error("reCAPTCHA API error:", response.status);
      return {
        ok: false,
        reason: "Captcha verification service unavailable",
      };
    }

    const data: RecaptchaVerifyResponse = await response.json();

    if (!data.success) {
      const errorCodes = data["error-codes"]?.join(", ") || "unknown";
      console.warn("reCAPTCHA verification failed:", errorCodes);
      return {
        ok: false,
        reason: "Captcha verification failed",
      };
    }

    // For reCAPTCHA v3, check the score
    if (data.score !== undefined) {
      if (data.score < MIN_SCORE_THRESHOLD) {
        console.warn(`reCAPTCHA score too low: ${data.score}`);
        return {
          ok: false,
          score: data.score,
          reason: "Suspicious activity detected",
        };
      }

      return {
        ok: true,
        score: data.score,
      };
    }

    // reCAPTCHA v2 doesn't have a score
    return {
      ok: true,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      ok: false,
      reason: "Captcha verification failed",
    };
  }
}
