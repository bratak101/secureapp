const emailRegex = /^[a-zA-Z0.9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function validateEmail(value) {
  if (!value.trim()) return 'E-mail jest wymagany'
  if (!emailRegex.test(value.trim())) return 'Nieprawidłowy format e-mail'
  return ''
}

export function validateUsername(value) {
  if (!value.trim()) return 'Nazwa użytkownika jest wymagana'
  if (value.length < 3) return 'Min. 3 znaki'
  if (value.length > 64) return 'Maks. 64 znaki'
  return ''
}

export function validatePassword(value, label = 'Hasło') {
  if (!value) return `${label} jest wymagane`
  if (value.length < 8) return 'Min. 8 znaków'
  return ''
}

export function passwordStrength(value) {
  if (!value) return { level: 0, label: '' }
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  const labels = ['', 'Słabe', 'Średnie', 'Dobre', 'Silne']
  return { level: Math.min(score, 4), label: labels[Math.min(score, 4)] }
}
