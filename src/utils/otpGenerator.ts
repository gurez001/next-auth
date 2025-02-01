import otpGenerator from "otp-generator";
export async function OTPGenerator(length: number):Promise<string> {
  return await otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
}
