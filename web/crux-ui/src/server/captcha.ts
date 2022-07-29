import { internalError, invalidArgument, missingParameter } from './error-middleware'

export const validateCaptcha = async (captcha: string): Promise<void> => {
  if (!captcha) {
    throw missingParameter('captcha')
  }

  let success = false
  try {
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        method: 'POST',
      },
    )

    const dto = await res.json()
    success = dto.success
  } catch (error) {
    throw internalError(`Failed to validate captcha: ${error}`)
  }

  if (!success) {
    throw invalidArgument('captcha')
  }
}